pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "./Oracle.sol";
import "./View.sol";

/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice is View {
    constructor(Oracle oracle_, address[] memory sources_) public View(oracle_, sources_) {}
}