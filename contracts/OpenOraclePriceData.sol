// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;

import "./OpenOracleData.sol";

/**
 * @title The Open Oracle Price Data Contract
 * @notice Values stored in this contract should represent a USD price with 6 decimals precision
 * @author Compound Labs, Inc.
 */
contract OpenOraclePriceData is OpenOracleData {
    ///@notice The event emitted when a source writes to its storage
    event Write(address indexed source, string key, uint64 timestamp, uint64 min, uint64 max);
    ///@notice The event emitted when the timestamp on a price is invalid and it is not written to storage
    event NotWritten(uint64 priorTimestamp, uint256 messageTimestamp, uint256 blockTimestamp);

    ///@notice The fundamental unit of storage for a reporter source
    struct Datum {
        uint64 timestamp;
        uint64 min;
        uint64 max;
    }

    struct Proof {
    uint[2] a;
    uint[2][2] b;
    uint[2] c;
    }

    struct PublicInput {
        uint[3] in;
    }

    /**
     * @dev The most recent authenticated data from all sources.
     *  This is private because dynamic mapping keys preclude auto-generated getters.
     */
    mapping(address => mapping(string => Datum)) private data;

    /**
     * @notice Write a bunch of signed datum to the authenticated storage mapping
     * @param message The payload containing the timestamp, and (key, min, max) pairs
     * @param signature The cryptographic signature of the message payload, authorizing the source to write
     * @return The keys that were written
     */
    function put(bytes calldata message, bytes calldata signature, Proof proof, PublicInput input) external returns (string memory) {
        require(message.min == input[1],
            "Minimum Price mis-match");
        require(message.max == input[2],
            "Maximum Price mis-match");
        
        // proof verification (gas benchmarking will be required)
        require(verifier.verifyTx(proof.a, proof.b, proof.c, input),
            "Invalid proof");
        (address source, uint64 timestamp, string memory key, uint64 min, uint64 max) = decodeMessage(message, signature);
        return putInternal(source, timestamp, key, min, max);
    }

    function putInternal(address source, uint64 timestamp, string memory key, uint64 min, uint64 max) internal returns (string memory) {
        // Only update if newer than stored, according to source
        Datum storage prior = data[source][key];
        if (timestamp > prior.timestamp && timestamp < block.timestamp + 60 minutes && source != address(0)) {
            data[source][key] = Datum(timestamp, min, max);
            emit Write(source, key, timestamp, min, max);
        } else {
            emit NotWritten(prior.timestamp, timestamp, block.timestamp);
        }
        return key;
    }

    function decodeMessage(bytes calldata message, bytes calldata signature) internal pure returns (address, uint64, string memory, uint64, uint64) {
        // Recover the source address
        address source = source(message, signature);

        // Decode the message and check the kind
        (string memory kind, uint64 timestamp, string memory key, uint64 min, uint64 max) = abi.decode(message, (string, uint64, string, uint64, uint64));
        require(keccak256(abi.encodePacked(kind)) == keccak256(abi.encodePacked("prices")), "Kind of data must be 'prices'");
        return (source, timestamp, key, min, max);
    }

    /**
     * @notice Read a single key from an authenticated source
     * @param source The verifiable author of the data
     * @param key The selector for the value to return
     * @return The claimed Unix timestamp for the data and the price range value (defaults to (0, 0, 0))
     */
    function get(address source, string calldata key) external view returns (uint64, uint64, uint64) {
        Datum storage datum = data[source][key];
        return (datum.timestamp, datum.min, datum.max);
    }

    /**
     * @notice Read only the value for a single key from an authenticated source
     * @param source The verifiable author of the data
     * @param key The selector for the value to return (symbol in case of uniswap)
     * @return The price value (defaults to (0, 0))
     */
    function getPriceRange(address source, string calldata key) external view returns (uint64, uint64) {
        return (data[source][key].min, data[source][key].max);
    }
}
