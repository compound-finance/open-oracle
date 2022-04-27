// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.8.7;

import "./UniswapConfig.sol";
import "./UniswapLib.sol";
import "../Ownable.sol";
import "../Chainlink/AggregatorValidatorInterface.sol";

struct PriceData {
    uint248 price;
    bool failoverActive;
}

contract UniswapAnchoredView is
    AggregatorValidatorInterface,
    UniswapConfig,
    Ownable
{
    /// @notice The number of wei in 1 ETH
    uint256 public constant ETH_BASE_UNIT = 1e18;

    /// @notice A common scaling factor to maintain precision
    uint256 public constant EXP_SCALE = 1e18;

    /// @notice The highest ratio of the new price to the anchor price that will still trigger the price to be updated
    uint256 public immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new price to the anchor price that will still trigger the price to be updated
    uint256 public immutable lowerBoundAnchorRatio;

    /// @notice The time interval to search for TWAPs when calling the Uniswap V3 observe function
    uint32 public immutable anchorPeriod;

    /// @notice Official prices by symbol hash
    mapping(bytes32 => PriceData) public prices;

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(
        bytes32 indexed symbolHash,
        uint256 reporterPrice,
        uint256 anchorPrice
    );

    /// @notice The event emitted when the stored price is updated
    event PriceUpdated(bytes32 indexed symbolHash, uint256 price);

    /// @notice The event emitted when failover is activated
    event FailoverActivated(bytes32 indexed symbolHash);

    /// @notice The event emitted when failover is deactivated
    event FailoverDeactivated(bytes32 indexed symbolHash);

    bytes32 internal constant ETH_HASH = keccak256("ETH");

    /**
     * @notice Construct a Uniswap anchored view for a set of token configurations
     * @dev Note that to avoid immature TWAPs, the system must run for at least a single anchorPeriod before using.
     *      NOTE: Reported prices are set to 1 during construction. We assume that this contract will not be voted in by
     *      governance until prices have been updated through `validate` for each TokenConfig.
     * @param anchorToleranceMantissa_ The percentage tolerance that the reporter may deviate from the Uniswap anchor
     * @param anchorPeriod_ The minimum amount of time required for the old Uniswap price accumulator to be replaced
     * @param configs The static token configurations which define what prices are supported and how
     */
    constructor(
        uint256 anchorToleranceMantissa_,
        uint32 anchorPeriod_,
        TokenConfig[] memory configs
    ) UniswapConfig(configs) {
        require(anchorPeriod_ > 0, "Period not >0");
        anchorPeriod = anchorPeriod_;

        // Allow the tolerance to be whatever the deployer chooses, but prevent under/overflow (and prices from being 0)
        upperBoundAnchorRatio = anchorToleranceMantissa_ >
            type(uint256).max - ETH_BASE_UNIT
            ? type(uint256).max
            : ETH_BASE_UNIT + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = anchorToleranceMantissa_ < ETH_BASE_UNIT
            ? ETH_BASE_UNIT - anchorToleranceMantissa_
            : 1;

        uint256 numConfigs = configs.length;
        for (uint256 i = 0; i < numConfigs; i++) {
            TokenConfig memory config = configs[i];
            require(config.baseUnit > 0, "baseUnit not >0");
            address uniswapMarket = config.uniswapMarket;
            if (config.priceSource == PriceSource.REPORTER) {
                require(uniswapMarket != address(0), "No anchor");
                require(config.reporter != address(0), "No reporter");
                bytes32 symbolHash = config.symbolHash;
                prices[symbolHash].price = 1;
            } else {
                require(uniswapMarket == address(0), "Doesnt need anchor");
                require(config.reporter == address(0), "Doesnt need reporter");
            }
        }
    }

    /**
     * @notice Get the official price for a symbol
     * @param symbol The symbol to fetch the price of
     * @return Price denominated in USD, with 6 decimals
     */
    function price(string calldata symbol) external view returns (uint256) {
        TokenConfig memory config = getTokenConfigBySymbol(symbol);
        return priceInternal(config);
    }

    function priceInternal(TokenConfig memory config)
        internal
        view
        returns (uint256)
    {
        if (config.priceSource == PriceSource.REPORTER) {
            return prices[config.symbolHash].price;
        } else if (config.priceSource == PriceSource.FIXED_USD) {
            return config.fixedPrice;
        } else {
            // config.priceSource == PriceSource.FIXED_ETH
            uint256 usdPerEth = prices[ETH_HASH].price;
            require(usdPerEth > 0, "ETH price not set");
            return FullMath.mulDiv(usdPerEth, config.fixedPrice, ETH_BASE_UNIT);
        }
    }

    /**
     * @notice Get the underlying price of a cToken, in the format expected by the Comptroller.
     * @dev Implements the PriceOracle interface for Compound v2.
     * @param cToken The cToken address for price retrieval
     * @return Price denominated in USD for the given cToken address, in the format expected by the Comptroller.
     */
    function getUnderlyingPrice(address cToken)
        external
        view
        returns (uint256)
    {
        TokenConfig memory config = getTokenConfigByUnderlying(
            CErc20(cToken).underlying()
        );
        // Comptroller needs prices in the format: ${raw price} * 1e36 / baseUnit
        // The baseUnit of an asset is the amount of the smallest denomination of that asset per whole.
        // For example, the baseUnit of ETH is 1e18.
        // Since the prices in this view have 6 decimals, we must scale them by 1e(36 - 6)/baseUnit
        return FullMath.mulDiv(1e30, priceInternal(config), config.baseUnit);
    }

    /**
     * @notice This is called by the reporter whenever a new price is posted on-chain
     * @dev called by AccessControlledOffchainAggregator
     * @param currentAnswer the price
     * @return valid bool
     */
    function validate(
        uint256, /* previousRoundId */
        int256, /* previousAnswer */
        uint256, /* currentRoundId */
        int256 currentAnswer
    ) external override returns (bool valid) {
        // NOTE: We don't do any access control on msg.sender here. The access control is done in getTokenConfigByReporter,
        // which will REVERT if an unauthorized address is passed.
        TokenConfig memory config = getTokenConfigByReporter(msg.sender);
        uint256 reportedPrice = convertReportedPrice(config, currentAnswer);
        uint256 anchorPrice = calculateAnchorPriceFromEthPrice(config);

        PriceData memory priceData = prices[config.symbolHash];
        if (priceData.failoverActive) {
            require(anchorPrice < 2**248, "Anchor too big");
            prices[config.symbolHash].price = uint248(anchorPrice);
            emit PriceUpdated(config.symbolHash, anchorPrice);
        } else if (isWithinAnchor(reportedPrice, anchorPrice)) {
            require(reportedPrice < 2**248, "Reported too big");
            prices[config.symbolHash].price = uint248(reportedPrice);
            emit PriceUpdated(config.symbolHash, reportedPrice);
            valid = true;
        } else {
            emit PriceGuarded(config.symbolHash, reportedPrice, anchorPrice);
        }
    }

    /**
     * @notice In the event that a feed is failed over to Uniswap TWAP, this function can be called
     * by anyone to update the TWAP price.
     * @dev This only works if the feed represented by the symbolHash is failed over, and will revert otherwise
     * @param symbolHash bytes32
     */
    function pokeFailedOverPrice(bytes32 symbolHash) public {
        PriceData memory priceData = prices[symbolHash];
        require(priceData.failoverActive, "Not active");
        TokenConfig memory config = getTokenConfigBySymbolHash(symbolHash);
        uint256 anchorPrice = calculateAnchorPriceFromEthPrice(config);
        require(anchorPrice < 2**248, "Anchor too big");
        prices[config.symbolHash].price = uint248(anchorPrice);
        emit PriceUpdated(config.symbolHash, anchorPrice);
    }

    /**
     * @notice Calculate the anchor price by fetching price data from the TWAP
     * @param config TokenConfig
     * @return anchorPrice uint
     */
    function calculateAnchorPriceFromEthPrice(TokenConfig memory config)
        internal
        view
        returns (uint256 anchorPrice)
    {
        require(config.priceSource == PriceSource.REPORTER, "Reporter only");
        uint256 ethPrice = fetchEthPrice();
        if (config.symbolHash == ETH_HASH) {
            anchorPrice = ethPrice;
        } else {
            anchorPrice = fetchAnchorPrice(config, ethPrice);
        }
    }

    /**
     * @notice Convert the reported price to the 6 decimal format that this view requires
     * @param config TokenConfig
     * @param reportedPrice from the reporter
     * @return convertedPrice uint256
     */
    function convertReportedPrice(
        TokenConfig memory config,
        int256 reportedPrice
    ) internal pure returns (uint256) {
        require(reportedPrice >= 0, "Cant be neg");
        uint256 unsignedPrice = uint256(reportedPrice);
        uint256 convertedPrice = FullMath.mulDiv(
            unsignedPrice,
            config.reporterMultiplier,
            config.baseUnit
        );
        return convertedPrice;
    }

    function isWithinAnchor(uint256 reporterPrice, uint256 anchorPrice)
        internal
        view
        returns (bool)
    {
        if (reporterPrice > 0) {
            uint256 anchorRatio = FullMath.mulDiv(
                anchorPrice,
                ETH_BASE_UNIT,
                reporterPrice
            );
            return
                anchorRatio <= upperBoundAnchorRatio &&
                anchorRatio >= lowerBoundAnchorRatio;
        }
        return false;
    }

    /**
     * @dev Fetches the latest TWATP from the UniV3 pool oracle, over the last anchor period.
     *      Note that the TWATP (time-weighted average tick-price) is not equivalent to the TWAP,
     *      as ticks are logarithmic. The TWATP returned by this function will usually
     *      be lower than the TWAP.
     */
    function getUniswapTwap(TokenConfig memory config)
        internal
        view
        returns (uint256)
    {
        uint32 anchorPeriod_ = anchorPeriod;
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = anchorPeriod_;
        (int56[] memory tickCumulatives, ) = IUniswapV3Pool(
            config.uniswapMarket
        ).observe(secondsAgos);

        int56 anchorPeriod__ = int56(uint56(anchorPeriod_));
        int56 timeWeightedAverageTickS56 = (tickCumulatives[1] -
            tickCumulatives[0]) / anchorPeriod__;
        require(
            timeWeightedAverageTickS56 >= TickMath.MIN_TICK &&
                timeWeightedAverageTickS56 <= TickMath.MAX_TICK,
            "TWAP not in range"
        );
        require(
            timeWeightedAverageTickS56 < type(int24).max,
            "timeWeightedAverageTick > max"
        );
        int24 timeWeightedAverageTick = int24(timeWeightedAverageTickS56);
        if (config.isUniswapReversed) {
            // If the reverse price is desired, inverse the tick
            // price = 1.0001^{tick}
            // (price)^{-1} = (1.0001^{tick})^{-1}
            // \frac{1}{price} = 1.0001^{-tick}
            timeWeightedAverageTick = -timeWeightedAverageTick;
        }
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
            timeWeightedAverageTick
        );
        // Squaring the result also squares the Q96 scalar (2**96),
        // so after this mulDiv, the resulting TWAP is still in Q96 fixed precision.
        uint256 twapX96 = FullMath.mulDiv(
            sqrtPriceX96,
            sqrtPriceX96,
            FixedPoint96.Q96
        );

        // Scale up to a common precision (EXP_SCALE), then down-scale from Q96.
        return FullMath.mulDiv(EXP_SCALE, twapX96, FixedPoint96.Q96);
    }

    /**
     * @dev Fetches the current eth/usd price from Uniswap, with 6 decimals of precision.
     *  Conversion factor is 1e18 for eth/usdc market, since we decode Uniswap price statically with 18 decimals.
     */
    function fetchEthPrice() internal view returns (uint256) {
        return
            fetchAnchorPrice(
                getTokenConfigBySymbolHash(ETH_HASH),
                ETH_BASE_UNIT
            );
    }

    /**
     * @dev Fetches the current token/usd price from Uniswap, with 6 decimals of precision.
     * @param conversionFactor 1e18 if seeking the ETH price, and a 6 decimal ETH-USDC price in the case of other assets
     */
    function fetchAnchorPrice(
        TokenConfig memory config,
        uint256 conversionFactor
    ) internal view virtual returns (uint256) {
        // `getUniswapTwap(config)`
        //      -> TWAP between the baseUnits of Uniswap pair (scaled to 1e18)
        // `twap * config.baseUnit`
        //      -> price of 1 token relative to `baseUnit` of the other token (scaled to 1e18)
        uint256 twap = getUniswapTwap(config);

        // `unscaledPriceMantissa * config.baseUnit / EXP_SCALE`
        //      -> price of 1 token relative to baseUnit of the other token (scaled to 1)
        uint256 unscaledPriceMantissa = twap * conversionFactor;

        // Adjust twap according to the units of the non-ETH asset
        // 1. In the case of ETH, we would have to scale by 1e6 / USDC_UNITS, but since baseUnit2 is 1e6 (USDC), it cancels
        // 2. In the case of non-ETH tokens
        //  a. `getUniswapTwap(config)` handles "reversed" token pairs, so `twap` will always be Token/ETH TWAP.
        //  b. conversionFactor = ETH price * 1e6
        //      unscaledPriceMantissa = twap{token/ETH} * EXP_SCALE * conversionFactor
        //      so ->
        //      anchorPrice = (twap * tokenBaseUnit / ETH_BASE_UNIT) * ETH_price * 1e6
        //                  = twap * conversionFactor * tokenBaseUnit / ETH_BASE_UNIT
        //                  = unscaledPriceMantissa / EXP_SCALE * tokenBaseUnit / ETH_BASE_UNIT
        uint256 anchorPrice = (unscaledPriceMantissa * config.baseUnit) /
            ETH_BASE_UNIT /
            EXP_SCALE;

        return anchorPrice;
    }

    /**
     * @notice Activate failover, and fall back to using failover directly.
     * @dev Only the owner can call this function
     */
    function activateFailover(bytes32 symbolHash) external onlyOwner {
        require(!prices[symbolHash].failoverActive, "Already active");
        TokenConfig memory config = getTokenConfigBySymbolHash(symbolHash);
        require(config.priceSource == PriceSource.REPORTER, "Not reporter");
        prices[symbolHash].failoverActive = true;
        emit FailoverActivated(symbolHash);
        pokeFailedOverPrice(symbolHash);
    }

    /**
     * @notice Deactivate a previously activated failover
     * @dev Only the owner can call this function
     */
    function deactivateFailover(bytes32 symbolHash) external onlyOwner {
        require(prices[symbolHash].failoverActive, "Not active");
        prices[symbolHash].failoverActive = false;
        emit FailoverDeactivated(symbolHash);
    }
}
