pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";

interface AnchorPriceOracle {
     function getUnderlyingPrice(address) external view returns (uint256);
}

/**
 * @notice Price feed conforming to Price Oracle Proxy interface and
 * using a single open oracle reporter, anchored to and falling back to
 * the Compound v2 oracle system.
 * @author Compound Labs, Inc.
 */
contract AnchoredPriceView {
    /// @notice standard amount for the Dollar
    uint256 constant oneDollar = 1e6;

    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint256 price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint256 source, uint256 anchor);

    /// @notice The CToken contracts addresses
    struct CTokens {
        address cEthAddress;
        address cUsdcAddress;
        address cDaiAddress;
        address cRepAddress;
        address cWbtcAddress;
        address cBatAddress;
        address cZrxAddress;
        address cSaiAddress;
        address cUsdtAddress;
    }

    /// @notice The reporter address whose prices checked against the median for safety
    AnchorPriceOracle immutable anchor;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 lowerBoundAnchorRatio;


    /// @notice The mapping of posted by source prices per symbol
    mapping(string => uint256) public _prices;

    /// @notice circuit breaker for using anchor price oracle directly
    bool public breaker;

    /// @notice The binary representation for 'ETH' symbol , used for string comparison
    bytes32 constant symbolEth = keccak256(abi.encodePacked("ETH"));

    /// @notice The binary representation for 'USDC' symbol, used for string comparison
    bytes32 constant symbolUsdc = keccak256(abi.encodePacked("USDC"));

    /// @notice The binary representation for 'DAI' symbol, used for string comparison
    bytes32 constant symbolDai = keccak256(abi.encodePacked("DAI"));

    /// @notice The binary representation for 'REP' symbol, used for string comparison
    bytes32 constant symbolRep = keccak256(abi.encodePacked("REP"));

    /// @notice The binary representation for 'BTC' symbol, used for string comparison
    bytes32 constant symbolWbtc = keccak256(abi.encodePacked("BTC"));

    /// @notice The binary representation for 'BAT' symbol, used for string comparison
    bytes32 constant symbolBat = keccak256(abi.encodePacked("BAT"));

    /// @notice The binary representation for 'ZRX' symbol, used for string comparison
    bytes32 constant symbolZrx = keccak256(abi.encodePacked("ZRX"));

    /// @notice The binary representation for 'SAI' symbol, used for string comparison
    bytes32 constant symbolSai = keccak256(abi.encodePacked("SAI"));

    /// @notice The binary representation for 'SAI' symbol, used for string comparison
    bytes32 constant symbolUsdt = keccak256(abi.encodePacked("USDT"));

    /// @notice Address of the cEther contract
    address public immutable cEthAddress;

    /// @notice Address of the cUSDC contract
    address public immutable cUsdcAddress;

    /// @notice Address of the cDAI contract
    address public immutable cDaiAddress;

    /// @notice Address of the cREP contract
    address public immutable cRepAddress;

    /// @notice Address of the cWBTC contract
    address public immutable cWbtcAddress;

    /// @notice Address of the cBAT contract
    address public immutable cBatAddress;

    /// @notice Address of the cZRX contract
    address public immutable cZrxAddress;

    /// @notice Address of the cSAI contract
    address public immutable cSaiAddress;

    /// @notice Address of the cUsdt contract
    address public immutable cUsdtAddress;

    /// @notice the Open Oracle Reporter price source
    address public immutable source;

    /// @notice the Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    /**
     * @param data_ Address of the Oracle Data contract
     * @param source_ The reporter address whose price will be used if it matches the anchor
     * @param anchor_ The PriceOracleProxy that will be used to verify source price, or serve prices not given by the source
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(OpenOraclePriceData data_,
                address source_,
                address anchor_,
                uint anchorToleranceMantissa_,
                CTokens memory tokens_) public {
        source = source_;
        anchor = AnchorPriceOracle(anchor_);
        priceData = data_;

        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;

        _prices["USDC"] = oneDollar;
        _prices["USDT"] = oneDollar;

        cEthAddress = tokens_.cEthAddress;
        cUsdcAddress = tokens_.cUsdcAddress;
        cDaiAddress = tokens_.cDaiAddress;
        cRepAddress = tokens_.cRepAddress;
        cWbtcAddress = tokens_.cWbtcAddress;
        cBatAddress = tokens_.cBatAddress;
        cZrxAddress = tokens_.cZrxAddress;
        cSaiAddress = tokens_.cSaiAddress;
        cUsdtAddress = tokens_.cUsdtAddress;
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

        // load usdc for using in loop to convert anchor prices to dollars
        uint256 usdcPrice = anchor.getUnderlyingPrice(cUsdcAddress);

        // Try to update the view storage
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];
            address tokenAddress = getCTokenAddress(symbol);
            uint256 sourcePrice = priceData.getPrice(source, symbol);
            uint256 anchorPrice = getAnchorPrice(tokenAddress, usdcPrice);

            if (anchorPrice == 0 || tokenAddress == cUsdcAddress || tokenAddress == cUsdtAddress) {
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
            uint256 ethPerToken = anchor.getUnderlyingPrice(getCTokenAddress(symbol));

            // ethPerToken has 18 decimals since the usdt, usdc, wbtc tokens hit
            // usdPerEth has 6 decimals
            // scaling by 1e18 and dividing leaves 1e6, as desired
            return mul(usdPerEth, 1e18) / ethPerToken;
        }
    }

    /**
     * @dev fetch price in eth from proxy and convert to usd price using anchor usdc price.
     * @dev Anchor usdc price has 30 decimals, and anchor general price has 18 decimals, so multiplying 1e18 by 1e18 and dividing by 1e30 yields 1e6
     */
    function getAnchorPrice(address tokenAddress, uint256 usdcPrice) public view returns (uint256) {
        if ( tokenAddress == cUsdcAddress || tokenAddress == cUsdtAddress )  {
            // hard code to 1 dollar
            return oneDollar;
        }

        uint priceInEth = anchor.getUnderlyingPrice(tokenAddress);
        uint additionalScale;
        if ( tokenAddress == cWbtcAddress ){
            // wbtc proxy price is scaled 1e(36 - 8) = 1e28, so we need 8 more to get to 36
            additionalScale = 1e8;
        } else {
            // all other tokens are scaled 1e18, so we need 18 more to get to 36
            additionalScale = 1e18;
        }

        // usdcPrice has 30 decimals, so final result has 6
        return mul(priceInEth, additionalScale) / usdcPrice;
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2 and returns returns the Eth price for an asset.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external view returns (uint256) {
        if (breaker == true) {
            return anchor.getUnderlyingPrice(cToken);
        }

        uint256 usdPerToken = _prices[getOracleKey(cToken)];

        if ( usdPerToken == 0 ) {
            return anchor.getUnderlyingPrice(cToken);
        } else {
            uint256 usdPerEth = _prices["ETH"];
            uint256 ethPerToken = mul(usdPerToken, 1e6) / usdPerEth;
            uint256 additionalScale = getAdditionalScale(cToken);

            return mul(ethPerToken, additionalScale);
        }
    }

    /**
     * comptroller expects price to have 18 decimals,
     * additionally upscaled by 1e18 - underlyingdecimals
     * base decimals is 1e6, so start by addint twelve
     */
    function getAdditionalScale(address cToken) public view returns (uint256) {
        // total scale 1e30
        if (cToken == cUsdcAddress) return 1e24;
        if (cToken == cUsdtAddress) return 1e24;
        // total scale 1e28
        if (cToken == cWbtcAddress) return 1e22;
        // total scale 1e18
        if (cToken == cEthAddress) return 1e12;
        revert("Requested additional scale for token served by proxy");
    }

    /**
     * @notice Returns the cToken address for symbol
     * @param symbol The symbol to map to cToken address
     * @return The cToken address for the given symbol
     */
    function getCTokenAddress(string memory symbol) public view returns (address) {
        bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
        if (symbolHash == symbolEth) return cEthAddress;
        if (symbolHash == symbolUsdc) return cUsdcAddress;
        if (symbolHash == symbolDai) return cDaiAddress;
        if (symbolHash == symbolRep) return cRepAddress;
        if (symbolHash == symbolWbtc) return cWbtcAddress;
        if (symbolHash == symbolBat) return cBatAddress;
        if (symbolHash == symbolZrx) return cZrxAddress;
        if (symbolHash == symbolSai) return cSaiAddress;
        if (symbolHash == symbolUsdt) return cUsdtAddress;
        revert("Unknown token symbol");
    }

    /**
     * @notice Returns the symbol for cToken address
     * @param cToken The cToken address to map to symbol
     * @return The symbol for the given cToken address
     */
    function getOracleKey(address cToken) public view returns (string memory) {
        if (cToken == cEthAddress) return "ETH";
        if (cToken == cUsdcAddress) return "USDC";
        if (cToken == cDaiAddress) return "DAI";
        if (cToken == cRepAddress) return "REP";
        if (cToken == cWbtcAddress) return "BTC";
        if (cToken == cBatAddress) return "BAT";
        if (cToken == cZrxAddress) return "ZRX";
        if (cToken == cSaiAddress) return "SAI";
        if (cToken == cUsdtAddress) return "USDT";
        revert("Unknown token address");
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
