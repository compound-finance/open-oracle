pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./verifier.sol";

struct Observation {
    uint timestamp;
    uint acc;
}

struct proof {
    uint[2] a;
    uint[2][2] b;
    uint[2] c;
}

struct publicInput {
    uint[3] in;
}

contract OracleView {
    using FixedPoint for *;

    /// @notice The Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    Verifier public immutable verifier;
    /// @notice Official prices by symbol hash
    mapping(bytes32 => uint) public prices;

    /// @notice Circuit breaker for using anchor price oracle directly, ignoring reporter
    bool public reporterInvalidated;

    /// @notice The old observation for each symbolHash
    mapping(bytes32 => Observation) public oldObservations;

    /// @notice The new observation for each symbolHash
    mapping(bytes32 => Observation) public newObservations;

    /**
     * @notice Construct a uniswap anchored view for a set of token configurations
     * @dev Note that to avoid immature TWAPs, the system must run for at least a single anchorPeriod before using.
     * @param reporter_ The reporter whose prices are to be used
     * @param anchorToleranceMantissa_ The percentage tolerance that the reporter may deviate from the uniswap anchor
     * @param anchorPeriod_ The minimum amount of time required for the old uniswap price accumulator to be replaced
     * @param configs The static token configurations which define what prices are supported and how
     */
    constructor(OpenOraclePriceData priceData_,
                address reporter_
                Verifier verifier_) public {
        priceData = priceData_;
        reporter = reporter_;
        verifier = verifier_;
    }

    /**
     * @notice Post open oracle reporter prices, and recalculate stored price by comparing to anchor
     * @dev We let anyone pay to post anything, but only prices from configured reporter will be stored in the view.
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     * @param symbols The symbols to compare to anchor for authoritative reading
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols, proof[] proofs, publicInput[] inputs) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Save the prices
        for (uint i = 0; i < messages.length; i++) {
            require(messages[i].min == inputs[i][1],
            "Minimum Price mis-match");
            require(messages[i].max == inputs[i][2],
            "Maximum Price mis-match");
            require(verifier.verifyTx(proofs[i].a, proofs[i].b, proofs[i].c, inputs[i]),
            "Invalid proof");
            priceData.put(messages[i], signatures[i]);
        }
    }

    /**
     * @notice Get the official price for a symbol
     * @param symbol The symbol to fetch the price of
     * @return Price range denominated in USD, with 6 decimals
     */
    function price(string memory symbol) external view returns (uint) {
        TokenConfig memory config = getTokenConfigBySymbol(symbol);
        return priceInternal(config);
    }
}
