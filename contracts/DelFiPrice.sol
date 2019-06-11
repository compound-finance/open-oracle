pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "./Oracle.sol";
import "./View.sol";

/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice is View {
    /**
     * @notice The mapping of medianized prices per symbol
     */
    mapping(string => uint) public prices;

    /**
     * @notice The amount of time a price remains valid for (included in median)
     */
    uint public constant expiration = 24 hours;

    /**
     * @notice The namespace contract which enforces type-checking of values
     * @dev This View defines its own type specification for values.
     */
    address public namespace = address(this);

    /**
     * @notice The name of the type-checking method in the namespace contract
     */
    string public constant name = "price";

    /**
     * @notice Official data type checker for DelFi prices
     * @param key Symbol to get price of as a string
     * @param value Price in USD * 1e18 as a uint
     * @return Reverts if not a DelFi price
     */
    function price(bytes calldata key, bytes calldata value) external pure {
        (abi.decode(key, (string)), abi.decode(value, (uint)));
    }

    constructor(Oracle oracle_, address[] memory sources_) public View(oracle_, sources_) {}

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
            oracle.put(namespace, name, messages[i], signatures[i]);
        }

        // Recalculate the asset prices
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];

            // Calculate the median price
            (uint median, uint count) = medianPrice(symbol, sources, expiration);

            // Only update if a quorum is particpating
            if (count > sources.length / 2) {
                prices[symbol] = median;
            }
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
            (uint timestamp, bytes memory value) = oracle.get(namespace, name, sources_[i], bytes(symbol));
            if (block.timestamp - timestamp < expiration_) {
                postedPrices[count] = abi.decode(value, (uint));
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