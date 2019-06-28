pragma solidity ^0.5.10;
pragma experimental ABIEncoderV2;

import "./OpenOracleData.sol";

/**
 * @title The Open Oracle Price Data Contract
 * @author Compound Labs, Inc.
 */
contract OpenOraclePriceData is OpenOracleData {
    /**
     * @notice The event emitted when a source writes to its storage
     */
    event Write(address indexed source, string indexed key, uint timestamp, uint value);

    /**
     * @notice The fundamental unit of storage for a reporter source
     */
    struct Datum {
        uint timestamp;
        uint value;
    }

    /**
     * @notice The most recent authenticated data from all sources
     * @dev This is private because dynamic mapping keys preclude auto-generated getters.
     */
    mapping(address => mapping(string => Datum)) private data;

    /**
     * @notice Write a bunch of signed datum to the authenticated storage mapping
     * @param message The payload containing the timestamp, and (key, value) pairs
     * @param signature The cryptographic signature of the message payload, authorizing the source to write
     */
    function put(bytes calldata message, bytes calldata signature) external {
        // Recover the source address
        address source = source(message, signature);

        // Decode all the data tuples
        (uint timestamp, bytes[] memory pairs) = abi.decode(message, (uint, bytes[]));
        for (uint j = 0; j < pairs.length; j++) {
            (string memory key, uint value) = abi.decode(pairs[j], (string, uint));

            // Only update if newer than stored, according to source
            Datum storage prior = data[source][key];
            if (prior.timestamp >= timestamp) {
                continue;
            }

            // Update storage
            data[source][key] = Datum(timestamp, value);
            emit Write(source, key, timestamp, value);
        }
    }

    /**
     * @notice Read a single key from an authenticated source
     * @param source The verifiable author of the data
     * @param key The selector for the value to return
     * @return The claimed Unix timestamp for the data and the encoded value (defaults to (0, 0))
     */
    function get(address source, string calldata key) external view returns (uint, uint) {
        Datum storage datum = data[source][key];
        return (datum.timestamp, datum.value);
    }
}
