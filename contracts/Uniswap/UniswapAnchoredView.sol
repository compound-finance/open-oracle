// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./UniswapConfig.sol";
import "./UniswapLib.sol";
import "../Ownable.sol";
import "../Chainlink/AggregatorValidatorInterface.sol";

struct Observation {
    uint timestamp;
    int24 acc;
}

struct PriceData {
    uint248 price;
    bool failoverActive;
}

contract UniswapAnchoredView is AggregatorValidatorInterface, UniswapConfig, Ownable {
    /// @notice The number of wei in 1 ETH
    uint public constant ethBaseUnit = 1e18;

    /// @notice A common scaling factor to maintain precision
    uint public constant expScale = 1e18;

    /// @notice The highest ratio of the new price to the anchor price that will still trigger the price to be updated
    uint public immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new price to the anchor price that will still trigger the price to be updated
    uint public immutable lowerBoundAnchorRatio;

    /// @notice The minimum amount of time in seconds required for the old uniswap price accumulator to be replaced
    uint public immutable anchorPeriod;

    /// @notice Official prices by symbol hash
    mapping(bytes32 => PriceData) public prices;

    /// @notice The old observation for each symbolHash
    mapping(bytes32 => Observation) public oldObservations;

    /// @notice The new observation for each symbolHash
    mapping(bytes32 => Observation) public newObservations;

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(bytes32 indexed symbolHash, uint reporter, uint anchor);

    /// @notice The event emitted when the stored price is updated
    event PriceUpdated(bytes32 indexed symbolHash, uint price);

    /// @notice The event emitted when anchor price is updated
    event AnchorPriceUpdated(bytes32 indexed symbolHash, uint anchorPrice, uint oldTimestamp, uint newTimestamp);

    /// @notice The event emitted when the uniswap window changes
    event UniswapWindowUpdated(bytes32 indexed symbolHash, uint oldTimestamp, uint newTimestamp, int24 oldPrice, int24 newPrice);

    /// @notice The event emitted when failover is activated
    event FailoverUpdated(bytes32 indexed symbolHash, bool status);

    bytes32 constant ethHash = keccak256(abi.encodePacked("ETH"));

    /**
     * @notice Construct a uniswap anchored view for a set of token configurations
     * @dev Note that to avoid immature TWAPs, the system must run for at least a single anchorPeriod before using.
     * @param anchorToleranceMantissa_ The percentage tolerance that the reporter may deviate from the uniswap anchor
     * @param anchorPeriod_ The minimum amount of time required for the old uniswap price accumulator to be replaced
     * @param configs The static token configurations which define what prices are supported and how
     */
    constructor(uint anchorToleranceMantissa_,
                uint anchorPeriod_,
                TokenConfig[] memory configs) UniswapConfig(configs) public {

        anchorPeriod = anchorPeriod_;

        // Allow the tolerance to be whatever the deployer chooses, but prevent under/overflow (and prices from being 0)
        upperBoundAnchorRatio = anchorToleranceMantissa_ > uint(-1) - 100e16 ? uint(-1) : 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = anchorToleranceMantissa_ < 100e16 ? 100e16 - anchorToleranceMantissa_ : 1;

        for (uint i = 0; i < configs.length; i++) {
            TokenConfig memory config = configs[i];
            require(config.baseUnit > 0, "baseUnit must be greater than zero");
            address uniswapMarket = config.uniswapMarket;
            if (config.priceSource == PriceSource.REPORTER) {
                require(uniswapMarket != address(0), "reported prices must have an anchor");
                require(config.reporter != address(0), "reported price much have a reporter");
                bytes32 symbolHash = config.symbolHash;
                prices[symbolHash].price = 1;
                int24 tick = currentTick(config);
                oldObservations[symbolHash].timestamp = block.timestamp;
                newObservations[symbolHash].timestamp = block.timestamp;
                oldObservations[symbolHash].acc = tick;
                newObservations[symbolHash].acc = tick;
                emit UniswapWindowUpdated(symbolHash, block.timestamp, block.timestamp, tick, tick);
            } else {
                require(uniswapMarket == address(0), "only reported prices utilize an anchor");
            }
        }
    }

    /**
     * @notice Get the official price for a symbol
     * @param symbol The symbol to fetch the price of
     * @return Price denominated in USD, with 6 decimals
     */
    function price(string memory symbol) external view returns (uint) {
        TokenConfig memory config = getTokenConfigBySymbol(symbol);
        return priceInternal(config);
    }

    function priceInternal(TokenConfig memory config) internal view returns (uint) {
        if (config.priceSource == PriceSource.REPORTER) return prices[config.symbolHash].price;
        if (config.priceSource == PriceSource.FIXED_USD) return config.fixedPrice;
        if (config.priceSource == PriceSource.FIXED_ETH) {
            uint usdPerEth = prices[ethHash].price;
            require(usdPerEth > 0, "ETH price not set, cannot convert to dollars");
            return mul(usdPerEth, config.fixedPrice) / ethBaseUnit;
        }
    }

    /**
     * @notice Get the underlying price of a cToken
     * @dev Implements the PriceOracle interface for Compound v2.
     * @param cToken The cToken address for price retrieval
     * @return Price denominated in USD, with 18 decimals, for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external view returns (uint) {
        TokenConfig memory config = getTokenConfigByCToken(cToken);
         // Comptroller needs prices in the format: ${raw price} * 1e(36 - baseUnit)
         // Since the prices in this view have 6 decimals, we must scale them by 1e(36 - 6 - baseUnit)
        return mul(1e30, priceInternal(config)) / config.baseUnit;
    }

    /**
     * @notice This is called by the reporter whenever a new price is posted on-chain
     * @dev called by AccessControlledOffChainAggregator
     * @param currentAnswer the price
     * @return valid bool
     */
    function validate(uint256/* previousRoundId */,
            int256 /* previousAnswer */,
            uint256 /* currentRoundId */,
            int256 currentAnswer) external override returns (bool valid) {

        // This will revert if no configs found for the msg.sender
        TokenConfig memory config = getTokenConfigByReporter(msg.sender);
        uint256 reportedPrice = convertReportedPrice(config, currentAnswer);
        uint256 anchorPrice = calculateAnchorPriceFromEthPrice(config);

        PriceData memory priceData = prices[config.symbolHash];
        if (priceData.failoverActive) {
            require(anchorPrice < 2**248, "Anchor price too large");
            prices[config.symbolHash].price = uint248(anchorPrice);
            emit PriceUpdated(config.symbolHash, anchorPrice);
        } else if (isWithinAnchor(reportedPrice, anchorPrice)) {
            require(reportedPrice < 2**248, "Reported price too large");
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
        require(priceData.failoverActive, "Failover must be active");
        TokenConfig memory config = getTokenConfigBySymbolHash(symbolHash);
        uint anchorPrice = calculateAnchorPriceFromEthPrice(config);
        require(anchorPrice < 2**248, "Anchor price too large");
        prices[config.symbolHash].price = uint248(anchorPrice);
        emit PriceUpdated(config.symbolHash, anchorPrice);
    }

    /**
     * @notice Calculate the anchor price by fetching price data from the TWAP
     * @param config TokenConfig
     * @return anchorPrice uint
     */
    function calculateAnchorPriceFromEthPrice(TokenConfig memory config) internal returns (uint anchorPrice) {
        uint ethPrice = fetchEthPrice();
        require(config.priceSource == PriceSource.REPORTER, "only reporter prices get posted");
        if (config.symbolHash == ethHash) {
            anchorPrice = ethPrice;
        } else {
            anchorPrice = fetchAnchorPrice(config.symbolHash, config, ethPrice);
        }
    }

    /**
     * @notice Convert the reported price to the 6 decimal format that this view requires
     * @param config TokenConfig
     * @param reportedPrice from the reporter
     * @return convertedPrice uint256
     */
    function convertReportedPrice(TokenConfig memory config, int256 reportedPrice) internal pure returns (uint256) {
        require(reportedPrice >= 0, "Reported price cannot be negative");
        uint256 unsignedPrice = uint256(reportedPrice);
        uint256 convertedPrice = mul(unsignedPrice, config.reporterMultiplier) / config.baseUnit;
        return convertedPrice;
    }


    function isWithinAnchor(uint reporterPrice, uint anchorPrice) internal view returns (bool) {
        if (reporterPrice > 0) {
            uint anchorRatio = mul(anchorPrice, 100e16) / reporterPrice;
            return anchorRatio <= upperBoundAnchorRatio && anchorRatio >= lowerBoundAnchorRatio;
        }
        return false;
    }

    /**
     * @dev Fetches the current token/eth price accumulator from uniswap.
     */
    function currentTick(TokenConfig memory config) internal view returns (int24) {
        Slot0 memory slot0 = IUniswapV3Pool(config.uniswapMarket).slot0();
        if (config.isUniswapReversed) {
            return (-int24(slot0.tick));
        } else {
            return slot0.tick;
        }
    }

    /**
     * @dev Fetches the current eth/usd price from uniswap, with 6 decimals of precision.
     *  Conversion factor is 1e18 for eth/usdc market, since we decode uniswap price statically with 18 decimals.
     */
    function fetchEthPrice() internal returns (uint) {
        return fetchAnchorPrice(ethHash, getTokenConfigBySymbolHash(ethHash), ethBaseUnit);
    }

    /**
     * @dev Fetches the current token/usd price from uniswap, with 6 decimals of precision.
     * @param conversionFactor 1e18 if seeking the ETH price, and a 6 decimal ETH-USDC price in the case of other assets
     */
    function fetchAnchorPrice(bytes32 symbolHash, TokenConfig memory config, uint conversionFactor) internal virtual returns (uint) {
        (int24 tick, uint oldTimestamp) = pokeWindowValues(config);

        // Calculate uniswap time-weighted average price
        // Underflow is a property of the accumulators: https://uniswap.org/audit.html#orgc9b3190
        uint256 sqrtPriceX96 = mul(TickMath.getSqrtRatioAtTick(tick), ethBaseUnit) / (2**96);
        uint rawUniswapPriceMantissa = mul(sqrtPriceX96, sqrtPriceX96) / ethBaseUnit;
        uint unscaledPriceMantissa = mul(rawUniswapPriceMantissa, conversionFactor);
        uint anchorPrice;

        // Adjust rawUniswapPrice according to the units of the non-ETH asset
        // In the case of ETH, we would have to scale by 1e6 / USDC_UNITS, but since baseUnit2 is 1e6 (USDC), it cancels
        if (config.isUniswapReversed) {
            // unscaledPriceMantissa * ethBaseUnit / config.baseUnit / expScale, but we simplify bc ethBaseUnit == expScale
            anchorPrice = (unscaledPriceMantissa / config.baseUnit) / (ethBaseUnit / config.baseUnit);
        } else {
            anchorPrice = mul(unscaledPriceMantissa, config.baseUnit) / ethBaseUnit / expScale;
        }

        emit AnchorPriceUpdated(symbolHash, anchorPrice, oldTimestamp, block.timestamp);

        return anchorPrice;
    }

    /**
     * @dev Get time-weighted average prices for a token at the current timestamp.
     *  Update new and old observations of lagging window if period elapsed.
     */
    function pokeWindowValues(TokenConfig memory config) internal returns (int24, uint) {
        bytes32 symbolHash = config.symbolHash;
        int24 tick = currentTick(config);

        Observation memory newObservation = newObservations[symbolHash];

        // Update new and old observations if elapsed time is greater than or equal to anchor period
        uint timeElapsed = block.timestamp - newObservation.timestamp;
        if (timeElapsed >= anchorPeriod) {
            oldObservations[symbolHash].timestamp = newObservation.timestamp;
            oldObservations[symbolHash].acc = newObservation.acc;

            newObservations[symbolHash].timestamp = block.timestamp;
            newObservations[symbolHash].acc = tick;
            emit UniswapWindowUpdated(config.symbolHash, newObservation.timestamp, block.timestamp, newObservation.acc, tick);
        }
        return (tick, oldObservations[symbolHash].timestamp);
    }

    /**
     * @notice Activate/Deactivate failover, and fall back to using failover directly.
     * @dev Only the owner can call this function
     */
    function updateFailover(bytes32 symbolHash, bool status) external onlyOwner() {
        require(prices[symbolHash].failoverActive != status, "Already updated");
        prices[symbolHash].failoverActive = status;
    }

    /// @dev Overflow proof multiplication
    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) return 0;
        uint c = a * b;
        require(c / a == b, "multiplication overflow");
        return c;
    }
}
