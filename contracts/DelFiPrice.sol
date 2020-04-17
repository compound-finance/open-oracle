pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";

interface AnchorPriceOracle {
     function getUnderlyingPrice(address) external view returns (uint256);
}


/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice {
    /// @notice The event emitted when the stored price is updated
    event PriceUpdated(string symbol, uint64 price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint64 stored, uint64 anchor);

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

    /// @notice The Price Oracle Proxy address whose prices checked against the source for safety
    AnchorPriceOracle immutable anchor;

    /// @notice The Open Oracle data contract to read source prices
    OpenOraclePriceData immutable priceData;

    address immutable source;

    /// @notice The mapping of medianized prices per symbol
    mapping(string => uint64) public prices;

    /// @notice The binary representation for 'ETH' symbol , used for string comparison
    bytes32 constant symbolEth = keccak256(abi.encodePacked("ETH"));

    /// @notice The binary representation for 'USDC' symbol, used for string comparison
    bytes32 constant symbolUsdc = keccak256(abi.encodePacked("USDC"));

    /// @notice The binary representation for 'DAI' symbol, used for string comparison
    bytes32 constant symbolDai = keccak256(abi.encodePacked("DAI"));

    /// @notice The binary representation for 'REP' symbol, used for string comparison
    bytes32 constant symbolRep = keccak256(abi.encodePacked("REP"));

    /// @notice The highest ratio of the new source price to the anchor price that will still trigger the stored price to be updated
    uint256 immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new source price to the anchor price that will still trigger the stored price to be updated
    uint256 immutable lowerBoundAnchorRatio;

    /// @notice The mapping of stored prices per symbol
    mapping(string => uint64) public prices;

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

    /**
     * @param data_ Address of the Oracle Price Data contract
     * @param source_ The reporter address whose prices will be used
     * @param anchor_ The Price Oracle Proxy whose prices will be checked against for safety
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and source price. A tolerance of 10e16 means a new source that is 10% off from the anchor will still be saved
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(OpenOraclePriceData data_, address source_, address anchor_, uint anchorToleranceMantissa_, CTokens memory tokens_) public {
        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;

        cEthAddress = tokens_.cEthAddress;
        cUsdcAddress = tokens_.cUsdcAddress;
        cDaiAddress = tokens_.cDaiAddress;
        cRepAddress = tokens_.cRepAddress;
        cWbtcAddress = tokens_.cWbtcAddress;
        cBatAddress = tokens_.cBatAddress;
        cZrxAddress = tokens_.cZrxAddress;

        priceData = data_;
        source = source_;
        anchor = AnchorPriceOracle(anchor_);
    }

    /**
     * @notice Primary entry point to post and recalculate prices
     * @dev We let anyone pay to post anything, but only sources count for prices
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Save the prices
        for (uint i = 0; i < messages.length; i++) {
            priceData.put(messages[i], signatures[i]);
        }

        uint usdcPrice = anchor.getUnderlyingPrice(tokens.cUsdcAddress);

        // Update view value if anchor allows
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];
            uint64 sourcePrice = priceData.getPrice(source, symbol);

            // get price from anchor, and convert to dollars
<<<<<<< HEAD
            // TODO: get decimals right

=======
            // TODO do decimals correclty
>>>>>>> sketch in dollar mapping
            uint64 anchorPrice = uint64(anchor.getUnderlyingPrice(getCTokenAddress(symbol)) / usdcPrice);

            if (anchorPrice == 0) {
                emit PriceGuarded(symbol, sourcePrice, anchorPrice);
            } else {
                uint256 anchorRatioMantissa = uint256(sourcePrice) * 100e16 / anchorPrice;
                // Only update the view's price if the source price is within a bound, and it is changed
                if (anchorRatioMantissa <= upperBoundAnchorRatio && anchorRatioMantissa >= lowerBoundAnchorRatio) {
                    // only update and emit event if the source price is new, otherwise do nothing
                    if (prices[symbol] != sourcePrice) {
                        prices[symbol] = sourcePrice;
                        emit PriceUpdated(symbol, sourcePrice);
                    }
                } else {
                    emit PriceGuarded(symbol, sourcePrice, anchorPrice);
                }
            }
        }
    }

    // @notice Price Oracle Proxy interface
    function getUnderlyingPrice(address cTokenAddress) public view returns (uint256) {
        if(cTokenAddress == tokens.cSaiAddress) {
            uint256 ethPerUsd = prices["ETH"];
<<<<<<< HEAD
            // TODO: get decimals right
=======
            // TODO do decimals correctly 
>>>>>>> sketch in dollar mapping
            return anchor.getUnderlyingPrice(tokens.cSaiAddress) / ethPerUsd;
        }

        return prices[getOracleKey(cTokenAddress)];
    }

    /**
     * @notice Returns the cToken address for symbol
     * @param symbol The symbol to map to cToken address
     * @return cToken The cToken address for the given symbol
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
        revert("Unknown token symbol");
    }

    /**
     * @notice Returns the symbol for a cToken address 
     * @param cTokenAddress The cToken address to map to symbol
     * @return symbol The symbol for the cToken address
     */
    function getOracleKey(address cTokenAddress) public view returns (string memory) {
        if (cTokenAddress == cEthAddress) return "ETH";
        if (cTokenAddress == cUsdcAddress) return "USDC";
        if (cTokenAddress == cDaiAddress) return "DAI";
        if (cTokenAddress == cRepAddress) return "REP";
        if (cTokenAddress == cWbtcAddress) return "BTC";
        if (cTokenAddress == cBatAddress) return "BAT";
        if (cTokenAddress == cZrxAddress) return "ZRX";
        if (cTokenAddress == cUsdtAddress) return "USDC";
        revert("Unknown token symbol");
    }

    function safeMul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }
}
