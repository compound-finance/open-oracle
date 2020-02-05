pragma solidity ^0.5.12;
pragma experimental ABIEncoderV2;

contract Test {

    function testOverflow() public pure {
        require(uint64(uint128(uint64(-1) + uint64(-1))/2) > uint64(10000), 'overflows');
    }
}
