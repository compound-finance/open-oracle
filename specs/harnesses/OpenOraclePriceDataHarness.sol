pragma solidity ^0.6.10;

import "../../contracts/OpenOraclePriceData.sol";

contract OpenOraclePriceDataHarness is OpenOraclePriceData {
    
    function invokePutInternal(address source, uint64 timestamp, string memory key, uint64 value) external returns (string memory) {
       return putInternal(source, timestamp, key, value);
    }
}