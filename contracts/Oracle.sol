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
        uint timestamp;
        bytes value;
    }

    /**
     * @notice The most recent authenticated data from all sources
     * @dev Datum are partitioned by their type checker (namespace, name) to guarantee safety.
     *  This is private because dynamic mapping keys preclude auto-generated getters.
     */
    mapping(address => mapping(string => mapping(address => mapping(bytes => Datum)))) private data;

    struct PutLocalVars {
        address source;

        uint timestamp;
        bytes[] pairs;
        bytes key;
        bytes value;

        bytes tsg;
        bytes fun;
        bool success;
    }

    /**
     * @notice Write a bunch of signed datum to the authenticated storage mapping
     * @param namespace The contract address which defines the (key, value) type
     * @param name The method name (in namespace) which checks the (key, value) type
     * @param message The payload containing the timestamp, and (key, value) pairs
     * @param signature The cryptographic signature of the message payload, authorizing the source to write
     */
    function put(address namespace, string calldata name, bytes calldata message, bytes calldata signature) external {
        PutLocalVars memory vars;

        // Recover the source address
        vars.source = source(message, signature);

        // Decode all the data tuples
        (vars.timestamp, vars.pairs) = abi.decode(message, (uint256, bytes[]));
        for (uint256 j = 0; j < vars.pairs.length; j++) {
            (vars.key, vars.value) = abi.decode(vars.pairs[j], (bytes, bytes));

            // Only update if type check passes (does not revert)
            vars.tsg = abi.encodePacked(name, "(bytes,bytes)");
            vars.fun = abi.encodeWithSignature(string(vars.tsg), vars.key, vars.value);
            (vars.success, ) = namespace.call(vars.fun);
            if (!vars.success) {
                continue;
            }

            // Only update if newer than stored, according to source
            Datum storage prior = data[namespace][name][vars.source][vars.key];
            if (prior.timestamp >= vars.timestamp) {
                continue;
            }

            // Update storage
            data[namespace][name][vars.source][vars.key] = Datum(vars.timestamp, vars.value);
        }
    }

    /**
     * @notice Read a single key with a pre-defined type signature from an authenticated source
     * @param namespace The contract address which defines the (key, value) type
     * @param name The method name (in namespace) which checks the (key, value) type
     * @param source The verifiable author of the data
     * @param key The selector for the value to return
     * @return The claimed Unix timestamp for the data and the encoded value (defaults to (0, 0x))
     */
    function get(address namespace, string calldata name, address source, bytes calldata key) external view returns (uint256, bytes memory) {
        Datum storage datum = data[namespace][name][source][key];
        return (datum.timestamp, datum.value);
    }

    /**
     * @notice Recovers the source address which signed a message
     * @dev Comparing to a claimed address would add nothing,
     *  as the caller could simply perform the recover and claim that address.
     * @param message The data that was presumably signed
     * @param signature The fingerprint of the data + private key
     * @return The source address which signed the message, presumably
     */
    function source(bytes memory message, bytes memory signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = abi.decode(signature, (bytes32, bytes32, uint8));
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(message)));
        return ecrecover(hash, v, r, s);
    }
}
