// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;

import "./OpenOracleData.sol";

/**
 * @title The Open Oracle View Base Contract
 * @author Compound Labs, Inc.
 */
contract OpenOracleView {
    /**
     * @notice The Oracle Data Contract backing this View
     */
    OpenOracleData public priceData;

    /**
     * @notice The static list of sources used by this View
     * @dev Note that while it is possible to create a view with dynamic sources,
     *  that would not conform to the Open Oracle Standard specification.
     */
    address[] public sources;

    /**
     * @notice Construct a view given the oracle backing address and the list of sources
     * @dev According to the protocol, Views must be immutable to be considered conforming.
     * @param data_ The address of the oracle data contract which is backing the view
     * @param sources_ The list of source addresses to include in the aggregate value
     */
    constructor(OpenOracleData data_, address[] memory sources_) public {
        require(sources_.length > 0, "Must initialize with sources");
        priceData = data_;
        sources = sources_;
    }
}
