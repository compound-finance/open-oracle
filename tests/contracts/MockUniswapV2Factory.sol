// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;

import "./MockUniswapTokenPair.sol"

contract MockUniswapV2Factory {

    struct PairConfig {
        address token0;
        address token1;
        PriceSource priceSource;
    }

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    constructor(PairConfig[] memory configs) public {
        for (uint i = 0; i < configs.length; i++) {
            if (config.priceSource ==  == PriceSource.REPORTER) {
                PairConfig memory config = configs[i];
                // Init empty token pair
                MockUniswapTokenPair pair = new MockUniswapTokenPair(0,0,0,0,0);
                getPair[token0][token1] = pair;
                getPair[token1][token0] = pair; // populate mapping in the reverse direction
            }
        }
    }

    function createPair(address token0, address token1) external returns (address pair) {
        require(getPair[token0][token1] != 0, "Pair is expected to be set in constructor");
    }
}
