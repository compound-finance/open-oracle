pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./OpenOracleView.sol";

interface AnchorPriceOracle {
     function getUnderlyingPrice(address) external returns (uint);
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

    /// @notice The reporter address whose prices checked against the median for safety
    address anchor;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 lowerBoundAnchorRatio;

    /// @notice The mapping of medianized prices per symbol
    mapping(string => uint64) public prices;

    /// @notice Address of the cEther contract
    address public cEthAddress;

    /// @notice Address of the cUSDC contract
    address public cUsdcAddress;

    /// @notice Address of the cDAI contract
    address public cDaiAddress;

    /// @notice Address of the cREP contract
    address public cRepAddress;

    /// @notice Address of the cWBTC contract
    address public cWbtcAddress;

    /// @notice Address of the cBAT contract
    address public cBatAddress;

    /// @notice Address of the cZRX contract
    address public cZrxAddress;

    /**
     * @param data_ Address of the Oracle Data contract
     * @param sources_ The reporter addresses whose prices will be used to calculate the median
     * @param anchor_ The reporter address whose prices checked against the median for safety
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     * @param cEthAddress_ The address of cETH token asset
     * @param cDaiAddress_ The address of cDAI token asset
     * @param cZrxAddress_ The address of cZRX token asset
     */
    constructor(OpenOraclePriceData data_, 
                address[] memory sources_,
                address anchor_,
                uint anchorToleranceMantissa_,
                address cEthAddress_,
                address cUsdcAddress_,
                address cDaiAddress_,
                // address cRepAddress_,
                // address cWbtcAddress_, 
                // address cBatAddress_, 
                address cZrxAddress_) public OpenOracleView(data_, sources_) {
        anchor = anchor_;
        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;
        cEthAddress = cEthAddress_;
        cUsdcAddress = cUsdcAddress_;
        cDaiAddress = cDaiAddress_;
        // cRepAddress = cRepAddress_;
        // cWbtcAddress = cWbtcAddress_;
        // cBatAddress = cBatAddress_;
        cZrxAddress = cZrxAddress_;
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
            // uint64 anchorPrice = OpenOraclePriceData(address(data)).getPrice(anchor, symbol);
            uint64 anchorPrice = uint64(AnchorPriceOracle(address(anchor)).getUnderlyingPrice(getOracleKey(symbol)));
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
     * @return cToken The cToken address for the given symbol
     */
    function getOracleKey(string memory symbol) public view returns (address cToken) {
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("ETH"))) return cEthAddress;
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("USDC"))) return cUsdcAddress;
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("DAI"))) return cDaiAddress;
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("REP"))) return cRepAddress;
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("BTC"))) return cWbtcAddress;
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("BAT"))) return cBatAddress;
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("ZRX"))) return cZrxAddress;
        return address(0);
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
