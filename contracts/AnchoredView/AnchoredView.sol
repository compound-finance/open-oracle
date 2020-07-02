pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./SymbolConfiguration.sol";
import "../OpenOraclePriceData.sol";
import "../OpenOracleData.sol";

/**
 * @notice Price feed conforming to Price Oracle Proxy interface.
 * @dev Use a single open oracle reporter and anchored to and falling back to the Compound v2 oracle system.
 * @dev The reporter must report at a minimum the USD/ETH price, so that anchor ETH/TOKEN prices can be converted to USD/TOKEN
 * @author Compound Labs, Inc.
 */
abstract contract AnchoredView is SymbolConfiguration, OpenOracleData {
    /// @notice The mapping of anchored reporter prices by symbolHash
    mapping(bytes32 => uint) internal prices;

    /// @notice Circuit breaker for using anchor price oracle directly, ignoring reporter
    bool public reporterBreaker;

    /// @notice the Open Oracle Reporter price reporter
    address public immutable reporter;

    /// @notice The Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint immutable lowerBoundAnchorRatio;

    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint reporter, uint anchor);

    /// @notice The event emitted when reporter invalidates itself
    event ReporterInvalidated(address reporter);

    /**
     */
    constructor(OpenOraclePriceData priceData_,
                address reporter_,
                uint anchorToleranceMantissa_,
                TokenConfig[] memory configs) SymbolConfiguration(configs) public {
        priceData = priceData_;
        reporter = reporter_;

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

        uint ethPrice = fetchAnchorPrice(getTokenConfigBySymbol("ETH"), 1e6);

        // Try to update the view storage
        for (uint i = 0; i < symbols.length; i++) {
            TokenConfig memory config = getTokenConfigBySymbol(symbols[i]);
            string memory symbol = symbols[i];
            bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
            if (source(messages[i], signatures[i]) != reporter) continue;

            uint reporterPrice = priceData.getPrice(reporter, symbol);
            uint anchorPrice = fetchAnchorPrice(config, ethPrice);

            uint anchorRatio = mul(anchorPrice, 100e16) / reporterPrice;
            bool withinAnchor = anchorRatio <= upperBoundAnchorRatio && anchorRatio >= lowerBoundAnchorRatio;

            if (reporterBreaker == true) {
                if (prices[symbolHash] == anchorPrice) {
                    prices[symbolHash] = anchorPrice;
                }
            } else if (withinAnchor) {
                if (prices[symbolHash] != reporterPrice) {
                    prices[symbolHash] = reporterPrice;
                    emit PriceUpdated(symbol, reporterPrice);
                }
            } else {
                emit PriceGuarded(symbol, reporterPrice, anchorPrice);
            }
        }
    }
    /**
     * @notice Returns price denominated in USD, with 6 decimals
     * @dev If price was posted by reporter, return it. Otherwise, return anchor price converted through reporter ETH price.
     */

     function getPrices(string memory symbol) public view returns (uint) {
        TokenConfig memory config = getTokenConfigBySymbol(symbol);
        return pricesInternal(config);
     }

    function pricesInternal(TokenConfig memory config) internal view returns (uint) {
        if (config.priceSource == PriceSource.REPORTER) return prices[config.symbolHash];
        if (config.priceSource == PriceSource.FIXED_USD) return config.fixedPrice;
        if (config.priceSource == PriceSource.FIXED_ETH) {
            uint usdPerEth = prices[keccak256(abi.encodePacked("ETH"))]; // XXX: ethHash and rotateHash constants?
            require(usdPerEth > 0, "eth price not set, cannot convert eth to dollars");
            return mul(usdPerEth, config.fixedPrice) / config.baseUnit;
        }
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2 and returns returns the Eth price for an asset.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) public view returns (uint) {
        TokenConfig memory config = getTokenConfigByCToken(cToken);
        return pricesInternal(config);
    }

    /// @notice invalidate the reporter, and fall back to using anchor directly in all cases
    function invalidate(bytes memory message, bytes memory signature) public {
        (string memory decoded_message, ) = abi.decode(message, (string, address));
        require(keccak256(abi.encodePacked(decoded_message)) == keccak256(abi.encodePacked("rotate")), "invalid message must be 'rotate'");
        require(priceData.source(message, signature) == reporter, "invalidation message must come from the reporter");

        reporterBreaker = true;
        emit ReporterInvalidated(reporter);
    }

    // @notice overflow proof multiplication
    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) return 0;

        uint c = a * b;
        require(c / a == b, "multiplication overflow");

        return c;
    }

    function fetchAnchorPrice(TokenConfig memory tokenConfig, uint ethPerUsdc) internal virtual returns (uint);
}
