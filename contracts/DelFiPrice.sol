pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "./OraclePriceData.sol";
import "./OracleView.sol";

/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice is OracleView {
    /**
     * @notice The mapping of medianized prices per symbol
     */
    mapping(string => uint) public prices;

    /**
     * @notice The amount of time a price remains valid for (included in median)
     */
    uint public constant expiration = 48 hours;

    constructor(OraclePriceData data_, address[] memory sources_) public OracleView(data_, sources_) {}

    /**
     * @notice Primary entry point to post and recalculate prices
     * @dev We let anyone pay to post anything, but only sources count for prices.
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     * @param symbols The symbols to update the prices of
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Post the messages, whatever they are
        for (uint i = 0; i < messages.length; i++) {
            OraclePriceData(address(data)).put(messages[i], signatures[i]);
        }

        // Recalculate the asset prices
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];

            // Calculate the median price and write to storage
            (uint median,) = medianPrice(symbol, sources, expiration);
            prices[symbol] = median;
        }
    }

    /**
     * @notice Calculates the median price over any set of sources
     * @param symbol The symbol to calculate the median price of
     * @param sources_ The sources to use when calculating the median price
     * @param expiration_ The amount of time a price should be considered valid for
     * @return (median, count) The median price and the number of non-expired sources used
     */
    function medianPrice(string memory symbol, address[] memory sources_, uint expiration_) public view returns (uint median, uint count) {
        uint[] memory postedPrices = new uint[](sources_.length);
        for (uint i = 0; i < sources_.length; i++) {
            (uint timestamp, uint price) = OraclePriceData(address(data)).get(sources_[i], symbol);
            if (block.timestamp < timestamp + expiration_) {
                postedPrices[count] = price;
                count++;
            }
        }
        uint[] memory sortedPrices = sort(postedPrices, count);
        return (sortedPrices[count / 2], count);
    }

    /**
     * @notice Helper to sort an array of uints
     * @param array Array of integers to sort
     * @return The sorted array of integers
     */
    function sort(uint[] memory array, uint count) private pure returns (uint[] memory) {
        require(count <= array.length, "count must be <= array length");
        for (uint i = 0; i < count; i++) {
            for (uint j = i + 1; j < count; j++) {
                if (array[i] > array[j]) {
                    uint tmp = array[i];
                    array[i] = array[j];
                    array[j] = tmp;
                }
            }
        }
        return array;
    }
}