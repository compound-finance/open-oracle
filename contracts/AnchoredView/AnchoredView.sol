pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./SymbolConfiguration.sol";
import "../OpenOraclePriceData.sol";

interface AnchorOracle {
    function numBlocksPerPeriod() external view returns (uint); // approximately 1 hour: 60 seconds/minute * 60 minutes/hour * 1 block/15 seconds

    function assetPrices(address asset) external view returns (uint);

    struct Anchor {
        // floor(block.number / numBlocksPerPeriod) + 1
        uint period;

        // Price in ETH, scaled by 10**18
        uint priceMantissa;
    }
    function anchors(address asset) external view returns (Anchor memory);
}


/**
 * @notice Price feed conforming to Price Oracle Proxy interface.
 * @dev Use a single open oracle reporter and anchored to and falling back to the Compound v2 oracle system.
 * @dev The reporter must report at a minimum the USD/ETH price, so that anchor ETH/TOKEN prices can be converted to USD/TOKEN
 * @author Compound Labs, Inc.
 */
contract AnchoredView is SymbolConfiguration {
    /// @notice The mapping of anchored reporter prices by symbol
    mapping(string => uint) public _prices;

    /// @notice Circuit breaker for using anchor price oracle directly, ignoring reporter
    bool public reporterBreaker;

    /// @notice Circuit breaker for using reporter price without anchor
    bool public anchorBreaker;

    /// @notice the Open Oracle Reporter price reporter
    address public immutable reporter;

    /// @notice The anchor oracle ( Compound Oracle V1 )
    AnchorOracle public immutable anchor;

    /// @notice The Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint immutable lowerBoundAnchorRatio;

    /// @notice Average blocks per day, for checking anchor staleness
    /// @dev 1 day / 15
    uint constant blocksInADay = 5760;

    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint reporter, uint anchor);

    /// @notice The event emitted when reporter invalidates itself
    event ReporterInvalidated(address reporter);

    /// @notice The event emitted when the anchor is cut for staleness
    event AnchorCut(address anchor);

    /**
     * @param data_ Address of the Oracle Data contract
     * @param reporter_ The reporter address whose price will be used if it matches the anchor
     * @param anchor_ The PriceOracleProxy that will be used to verify reporter price, or serve prices not given by the reporter
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(OpenOraclePriceData data_,
                address reporter_,
                AnchorOracle anchor_,
                uint anchorToleranceMantissa_,
                CTokens memory tokens_) SymbolConfiguration(tokens_) public {
        reporter = reporter_;
        anchor = anchor_;
        priceData = data_;

        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;
    }

    /**
     * @notice Post open oracle reporter prices, and recalculate stored price by comparing to anchor
     * @dev We let anyone pay to post anything, but only prices from configured reporter will be stored in the view
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     * @param symbols The symbols to compare to anchor for authoritative reading
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Save the prices
        for (uint i = 0; i < messages.length; i++) {
            priceData.put(messages[i], signatures[i]);
        }

        // load usdc for using in loop to convert anchor prices to dollars
        uint usdcPrice = readAnchor(cUsdcAddress);

        // Try to update the view storage
        for (uint i = 0; i < symbols.length; i++) {
            CTokenMetadata memory tokenConfig = getCTokenConfig(symbols[i]);
            // symbol is not supported in the view, but allow writing to data
            if (tokenConfig.cTokenAddress == address(0)) continue;

            uint reporterPrice = priceData.getPrice(reporter, tokenConfig.openOracleKey);
            uint anchorPrice = getAnchorInUsd(tokenConfig, usdcPrice);
            
            uint anchorRatio = mul(anchorPrice, 100e16) / reporterPrice;
            bool withinAnchor = anchorRatio <= upperBoundAnchorRatio && anchorRatio >= lowerBoundAnchorRatio;

            if (withinAnchor || anchorBreaker) {
                // only update and emit event if value changes
                if (_prices[tokenConfig.openOracleKey] != reporterPrice) {
                    _prices[tokenConfig.openOracleKey] = reporterPrice;
                    emit PriceUpdated(tokenConfig.openOracleKey, reporterPrice);
                }
            } else {
                emit PriceGuarded(tokenConfig.openOracleKey, reporterPrice, anchorPrice);
            }
        }
    }
    /**
     * @notice Returns price denominated in USD, with 6 decimals
     * @dev If price was posted by reporter, return it. Otherwise, return anchor price converted through reporter ETH price.
     */
    function prices(string calldata symbol) external view returns (uint) {
        CTokenMetadata memory tokenConfig = getCTokenConfig(symbol);

        if (tokenConfig.priceSource == PriceSource.REPORTER) return _prices[symbol];
        if (tokenConfig.priceSource == PriceSource.FIXED_USD) return tokenConfig.fixedReporterPrice;
        if (tokenConfig.priceSource == PriceSource.ANCHOR) {
            uint usdPerEth = _prices["ETH"];
            require(usdPerEth > 0, "eth price not set, cannot convert eth to dollars");

            uint ethPerToken = readAnchor(tokenConfig);
            return mul(usdPerEth, ethPerToken) / tokenConfig.baseUnit;
        }
    }

    /**
     * @dev fetch price in eth from proxy and convert to usd price using anchor usdc price.
     * @dev Anchor price has 36 - underlying decimals, so scale back up to 36 decimals before dividing by by usdc price  (30 decimals), yielding 6 decimal usd price
     */
    function getAnchorInUsd(address cToken, uint ethPerUsdc) public view returns (uint) {
        CTokenMetadata memory tokenConfig = getCTokenConfig(cToken);
        return getAnchorInUsd(tokenConfig, ethPerUsdc);
    }

    function getAnchorInUsd(CTokenMetadata memory tokenConfig, uint ethPerUsdc) internal view returns (uint) {
        if (tokenConfig.anchorSource == AnchorSource.FIXED_USD) {
            return tokenConfig.fixedAnchorPrice;
        }

        uint ethPerToken = readAnchor(tokenConfig);

        return mul(ethPerToken, tokenConfig.baseUnit) / ethPerUsdc;
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2 and returns returns the Eth price for an asset.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) public view returns (uint) {
        CTokenMetadata memory tokenConfig = getCTokenConfig(cToken);
        if (reporterBreaker == true) {
            return readAnchor(tokenConfig);
        }

        if (tokenConfig.priceSource == PriceSource.FIXED_USD) {
            uint usdPerToken = tokenConfig.fixedReporterPrice;
            return mul(usdPerToken, 1e30) / tokenConfig.baseUnit;
        }

        if (tokenConfig.priceSource == PriceSource.REPORTER) {
            uint usdPerToken = _prices[tokenConfig.openOracleKey];
            return mul(usdPerToken, 1e30) / tokenConfig.baseUnit;
        }

        if (tokenConfig.priceSource == PriceSource.ANCHOR) {
            // convert anchor price to usd, via reporter eth price
            uint usdPerEth = _prices["ETH"];
            require(usdPerEth != 0, "no reporter price for usd/eth exists, cannot convert anchor price to usd terms");

            // factoring out extra 6 decimals from reporter eth price brings us back to decimals given by anchor
            uint ethPerToken = readAnchor(tokenConfig);
            return mul(usdPerEth, ethPerToken) / 1e6;
        }
    }

    /**
     * @notice Get the underlying price of a listed cToken asset
     * @param cToken The cToken to get the underlying price of
     * @return The underlying asset price mantissa (scaled by 1e18)
     */
    function readAnchor(address cToken) public view returns (uint) {
        return readAnchor(getCTokenConfig(cToken));
    }

    function readAnchor(CTokenMetadata memory tokenConfig) internal view returns (uint) {
        if (tokenConfig.anchorSource == AnchorSource.FIXED_ETH) return tokenConfig.fixedAnchorPrice;

        return anchor.assetPrices(tokenConfig.anchorOracleKey);
    }

    /// @notice invalidate the reporter, and fall back to using anchor directly in all cases
    function invalidate(bytes memory message, bytes memory signature) public {
        (string memory decoded_message, ) = abi.decode(message, (string, address));
        require(keccak256(abi.encodePacked(decoded_message)) == keccak256(abi.encodePacked("rotate")), "invalid message must be 'rotate'");
        require(priceData.source(message, signature) == reporter, "invalidation message must come from the reporter");

        reporterBreaker = true;
        emit ReporterInvalidated(reporter);
    }

    /// @notice invalidate the anchor, and fall back to using reporter without anchor

    /// @dev determine if anchor is stale by checking when usdc was last updated
    /// @dev all anchor prices are converted through usdc price, so if it is stale they are all stale
    function cutAnchor() external {
        AnchorOracle.Anchor memory latestUsdcAnchor = anchor.anchors(cUsdcAnchorKey);

        uint usdcAnchorBlockNumber = mul(latestUsdcAnchor.period, anchor.numBlocksPerPeriod());
        uint blocksSinceUpdate = block.number - usdcAnchorBlockNumber;

        // one day in 15 second blocks without an update
        if (blocksSinceUpdate > blocksInADay) {
            anchorBreaker = true;
            emit AnchorCut(address(anchor));
        }
    }


    // @notice overflow proof multiplication
    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) return 0;

        uint c = a * b;
        require(c / a == b, "multiplication overflow");

        return c;
    }
}
