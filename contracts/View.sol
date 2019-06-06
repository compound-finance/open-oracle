pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

contract View {

    function name() external pure returns (string memory) {
        return "ze cool view";
    }
}
