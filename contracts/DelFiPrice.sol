pragma solidity ^0.5.10;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./OpenOracleView.sol";

/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice is OpenOracleView {
    /**
     * @notice The mapping of medianized prices per symbol
     */
    mapping(string => uint) public prices;

    constructor(OpenOraclePriceData data_, address[] memory sources_) public OpenOracleView(data_, sources_) {}

    /**
     * @notice Primary entry point to post and recalculate prices
     * @dev We let anyone pay to post anything, but only sources count for prices.
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Initialize the list of symbol lists
        string[][] memory symbolses = new string[][](messages.length);
        uint maxSymbols = 0;

        // Post the messages, whatever they are
        for (uint i = 0; i < messages.length; i++) {
            string[] memory keys = OpenOraclePriceData(address(data)).put(messages[i], signatures[i]);
            symbolses[i] = keys;
            maxSymbols += keys.length;
        }

        // Intialize the symbol set to update
        string[] memory symbols = new string[](maxSymbols);
        uint numSymbols = 0;

        // Calculate the unique symbol set
        for (uint i = 0; i < symbolses.length; i++) {
            for (uint j = 0; j < symbolses[i].length; j++) {
                bool found = false;
                for (uint k = 0; k < symbols.length; k++) {
                    if (keccak256(abi.encodePacked(symbols[k])) == keccak256(abi.encodePacked(symbolses[i][j]))) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    symbols[numSymbols] = symbolses[i][j];
                    numSymbols++;
                }
            }
        }

        // Recalculate the asset prices
        for (uint i = 0; i < numSymbols; i++) {
            string memory symbol = symbols[i];

            // Calculate the median price and write to storage
            prices[symbol] = medianPrice(symbol, sources);
        }
    }

    /**
     * @notice Calculates the median price over any set of sources
     * @param symbol The symbol to calculate the median price of
     * @param sources_ The sources to use when calculating the median price
     * @return median The median price over the set of sources
     */
    function medianPrice(string memory symbol, address[] memory sources_) public view returns (uint median) {
        uint N = sources_.length;
        uint[] memory postedPrices = new uint[](N);
        for (uint i = 0; i < N; i++) {
            ( , uint price) = OpenOraclePriceData(address(data)).get(sources_[i], symbol);
            postedPrices[i] = price;
        }
        uint[] memory sortedPrices = sort(postedPrices);
        return sortedPrices[N / 2];
    }

    /**
     * @notice Helper to sort an array of uints
     * @param array Array of integers to sort
     * @return The sorted array of integers
     */
    function sort(uint[] memory array) private pure returns (uint[] memory) {
        uint N = array.length;
        for (uint i = 0; i < N; i++) {
            for (uint j = i + 1; j < N; j++) {
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