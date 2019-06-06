pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

/**
 * @title The Open Oracle Data Contract
 * @author Compound Labs, Inc.
 */
contract Oracle {
    /**
     * @notice The fundamental unit of storage for a reporter source
     */
    struct Datum {
        uint256 timestamp;
        bytes value;
    }

    /**
     * @notice The most recent authenticated data from all sources
     * @dev Datum are partitioned by their type signature to guarantee safety.
     */
    mapping(address => mapping(uint256 => mapping(bytes => Datum))) private data;

    /**
     * @notice Write a bunch of signed datum to the authenticated storage mapping
     * @param message The payload containing type signature, timestamp, and (key, value) pairs
     * @param signature The cryptographic signature of the message payload, authorizing the source to write
     */
    function put(bytes calldata message, bytes calldata signature) external {
        (bytes32 r, bytes32 s, uint8 v) = abi.decode(signature, (bytes32, bytes32, uint8));
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(message)));
        address source = ecrecover(hash, v, r, s);

        (uint256 typeSig, uint256 timestamp, bytes[] memory pairs) = abi.decode(message, (uint256, uint256, bytes[]));

        for (uint256 j = 0; j < pairs.length; j++) {
            (bytes memory key, bytes memory value) = abi.decode(pairs[j], (bytes, bytes));
            // XXX dont we need to actually verify typeSig here?
            data[source][typeSig][key] = Datum(timestamp, value);
        }
    }

    /**
     * @notice Read a single key with a given type signature from an authenticated source
     * @param source The verifiable author of the data
     * @param typeSig The required type signature of the value
     * @param key The selector for the value to return
     * @return The claimed Unix timestamp for the data and the encoded value, or 0 and the empty value
     */
    function get(address source, uint typeSig, bytes calldata key) external view returns (uint256, bytes memory) {
        Datum storage datum = data[source][typeSig][key];
        return (datum.timestamp, datum.value);
    }
}
