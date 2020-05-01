pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./CompoundProxyOracleAnchor.sol";

interface CompoundProtocolView {
     function getUnderlyingPrice(address) external view returns (uint256);
}
/**
 * @notice Price feed conforming to Price Oracle Proxy interface and
 * using a single open oracle reporter, anchored to and falling back to
 * the Compound v2 oracle system.
 * @author Compound Labs, Inc.
 */
contract AnchoredPriceView is CompoundProtocolView {
    /// @notice standard amount for the Dollar
    uint256 constant oneDollar = 1e6;

    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint256 price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint256 source, uint256 anchor);

    /// @notice The reporter address whose prices checked against the median for safety
    CompoundProxyOracleAnchor immutable anchor;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 lowerBoundAnchorRatio;

    /// @notice The mapping of posted by source prices per symbol
    mapping(string => uint256) public _prices;

    /// @notice circuit breaker for using anchor price oracle directly
    bool public breaker;

    /// @notice the Open Oracle Reporter price source
    address public immutable source;

    /// @notice the Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    /**
     * @param data_ Address of the Oracle Data contract
     * @param source_ The reporter address whose price will be used if it matches the anchor
     * @param anchor_ The CompoundProxyOracleAnchor that will be used to verify source price, or serve prices not given by the source
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     */
    constructor(OpenOraclePriceData data_,
                address source_,
                address anchor_,
                uint anchorToleranceMantissa_) public {
        source = source_;
        //TODO possibly use just Anchor type or create new Anchor here
        anchor = CompoundProxyOracleAnchor(anchor_);
        priceData = data_;

        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;

        _prices["USDC"] = oneDollar;
        _prices["USDT"] = oneDollar;
    }

    /**
     * @notice Primary entry point to post and recalculate prices
     * @dev We let anyone pay to post anything, but only prices from configured source will be stored in the view
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Save the prices
        for (uint i = 0; i < messages.length; i++) {
            priceData.put(messages[i], signatures[i]);
        }

        // Try to update the view storage
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];
            // address tokenAddress = anchor.getCTokenAddress(symbol);
            bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
            uint256 sourcePrice = priceData.getPrice(source, symbol);
            uint256 anchorPrice = anchor.getPrice(symbol);

            if (anchorPrice == 0 || symbolHash == keccak256(abi.encodePacked("USDC"))
             || symbolHash == keccak256(abi.encodePacked("USDT"))) {
                emit PriceGuarded(symbol, sourcePrice, anchorPrice);
            } else {
                uint256 anchorRatioMantissa = sourcePrice * 100e16 / anchorPrice;
                // Only update the view's price if the source price is within a bound, and it is a new median
                if (anchorRatioMantissa <= upperBoundAnchorRatio && anchorRatioMantissa >= lowerBoundAnchorRatio) {
                    // only update and emit event if the source price is new, otherwise do nothing
                    if (_prices[symbol] != sourcePrice) {
                        _prices[symbol] = sourcePrice;
                        emit PriceUpdated(symbol, sourcePrice);
                    }
                } else {
                    emit PriceGuarded(symbol, sourcePrice, anchorPrice);
                }
            }
        }
    }

    /**
     * @notice Returns price denominated in USD, with 6 decimals
     * @dev If price was posted by source, return it. Otherwise, return anchor price converted through source ETH price.
     */
    function prices(string calldata symbol) external view returns (uint256) {
        uint256 price = _prices[symbol];

        if (price != 0) {
            return price;
        } else {
            uint256 usdPerEth = _prices["ETH"];
            uint256 ethPerToken = anchor.getUnderlyingPrice(anchor.getCTokenAddress(symbol));

            // ethPerToken has 18 decimals since the usdt, usdc, wbtc tokens hit
            // usdPerEth has 6 decimals
            // scaling by 1e18 and dividing leaves 1e6, as desired
            return mul(usdPerEth, 1e18) / ethPerToken;
        }
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2 and returns returns the Eth price for an asset.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external view override returns (uint256) {
        if (breaker == true) {
            return anchor.getUnderlyingPrice(cToken);
        }
        uint256 usdPerToken = _prices[anchor.getOracleKey(cToken)];

        if (usdPerToken == 0) {
            return anchor.getUnderlyingPrice(cToken);
        } else {
            uint256 usdPerEth = _prices["ETH"];
            uint256 ethPerToken = mul(usdPerToken, 1e6) / usdPerEth;
            uint256 additionalScale = anchor.getAdditionalScale(cToken);

            return mul(ethPerToken, additionalScale);
        }
    }

    function invalidate(bytes memory message, bytes memory signature) public {
        (string memory decoded_message, ) = abi.decode(message, (string, address));
        require(keccak256(abi.encodePacked(decoded_message)) == keccak256(abi.encodePacked("rotate")), "invalid message must be 'rotate'");
        require(priceData.source(message, signature) == source, "invalidation message must come from the reporter");

        breaker = true;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "multiplication overflow");

        return c;
    }

}
