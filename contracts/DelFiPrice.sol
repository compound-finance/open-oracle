pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./OpenOracleView.sol";

interface AnchorPriceOracle {
     function getUnderlyingPrice(address) external returns (uint256);
}


/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice is OpenOracleView {
    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint64 price);

    /// @notice The event emitted when new prices are posted but the median price is not updated due to the anchor
    event PriceGuarded(string symbol, uint64 median, uint64 anchor);

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

    /// @notice The binary representation for 'BTC' symbol, used for string comparison
    bytes32 constant symbolWbtc = keccak256(abi.encodePacked("BTC"));

    /// @notice The binary representation for 'BAT' symbol, used for string comparison
    bytes32 constant symbolBat = keccak256(abi.encodePacked("BAT"));

    /// @notice The binary representation for 'ZRX' symbol, used for string comparison
    bytes32 constant symbolZrx = keccak256(abi.encodePacked("ZRX"));

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

    /**
     * @param data_ Address of the Oracle Data contract
     * @param sources_ The reporter addresses whose prices will be used to calculate the median
     * @param anchor_ The reporter address whose prices checked against the median for safety
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(OpenOraclePriceData data_, 
                address[] memory sources_,
                address anchor_,
                uint anchorToleranceMantissa_,
                CTokens memory tokens_) public OpenOracleView(data_, sources_) {
        anchor = AnchorPriceOracle(anchor_);
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
        cSaiAddress = tokens_.cSaiAddress;
        cUsdtAddress = tokens_.cUsdtAddress;
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
            OpenOraclePriceData(address(data)).put(messages[i], signatures[i]);
        }

        // Try to update the median
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];
            uint64 medianPrice = medianPrice(symbol, sources);
            uint256 usdcPrice = anchor.getUnderlyingPrice(cUsdcAddress);
            //TODO sort out proper precision and decimals here
            uint64 anchorPrice = uint64(anchor.getUnderlyingPrice(getCTokenAddress(symbol)) / usdcPrice);
            if (anchorPrice == 0) {
                emit PriceGuarded(symbol, medianPrice, anchorPrice);
            } else {
                uint256 anchorRatioMantissa = uint256(medianPrice) * 100e16 / anchorPrice;
                // Only update the view's price if the median of the sources is within a bound, and it is a new median
                if (anchorRatioMantissa <= upperBoundAnchorRatio && anchorRatioMantissa >= lowerBoundAnchorRatio) {
                    // only update and emit event if the median price is new, otherwise do nothing
                    if (prices[symbol] != medianPrice) {
                        prices[symbol] = medianPrice;
                        emit PriceUpdated(symbol, medianPrice);
                    }
                } else {
                    emit PriceGuarded(symbol, medianPrice, anchorPrice);
                }
            }
        }
    }

    /**
     * @notice Flags that this contract is meant to be compatible with Compound v2 PriceOracle interface.
     * @return true, this contract is meant to be used by Compound v2 PriceOracle interface.
     */
    function isPriceOracle() external pure returns (bool) {
       return true;
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2.
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external returns (uint256) {
        if(cToken == cSaiAddress) {
            uint256 ethPerUsd = prices["ETH"];
            return anchor.getUnderlyingPrice(cSaiAddress) / ethPerUsd;
        }
        return prices[getOracleKey(cToken)];
    }

    /**
     * @notice Calculates the median price over any set of sources
     * @param symbol The symbol to calculate the median price of
     * @param sources_ The sources to use when calculating the median price
     * @return median The median price over the set of sources
     */
    function medianPrice(string memory symbol, address[] memory sources_) public view returns (uint64 median) {
        require(sources_.length > 0, "sources list must not be empty");

        uint N = sources_.length;
        uint64[] memory postedPrices = new uint64[](N);
        for (uint i = 0; i < N; i++) {
            postedPrices[i] = OpenOraclePriceData(address(data)).getPrice(sources_[i], symbol);
        }

        uint64[] memory sortedPrices = sort(postedPrices);
        // if N is even, get the left and right medians and average them
        if (N % 2 == 0) {
            uint64 left = sortedPrices[(N / 2) - 1];
            uint64 right = sortedPrices[N / 2];
            uint128 sum = uint128(left) + uint128(right);
            return uint64(sum / 2);
        } else {
            // if N is odd, just return the median
            return sortedPrices[N / 2];
        }
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

    /**
     * @notice Helper to sort an array of uints
     * @param array Array of integers to sort
     * @return The sorted array of integers
     */
    function sort(uint64[] memory array) private pure returns (uint64[] memory) {
        uint N = array.length;
        for (uint i = 0; i < N; i++) {
            for (uint j = i + 1; j < N; j++) {
                if (array[i] > array[j]) {
                    uint64 tmp = array[i];
                    array[i] = array[j];
                    array[j] = tmp;
                }
            }
        }
        return array;
    }
}
