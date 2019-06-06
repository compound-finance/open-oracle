pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

contract Oracle {

    function name() external pure returns (string memory) {
        return "ze cool oracle";
    }
}
