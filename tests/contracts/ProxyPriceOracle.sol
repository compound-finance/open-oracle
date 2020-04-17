pragma solidity ^0.6.6;

contract ProxyPriceOracle {

    function getUnderlyingPrice(address) external pure returns (uint) {
        return 498000000;
    }
}
