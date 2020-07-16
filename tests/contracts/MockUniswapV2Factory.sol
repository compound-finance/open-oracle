// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "./MockUniswapTokenPair.sol";

contract MockUniswapV2Factory {
    enum PriceSource {FIXED_ETH, FIXED_USD, REPORTER}
    struct PairConfig {
        address token0;
        address token1;
        PriceSource priceSource;
    }

    mapping(address => mapping(address => address)) public getPair;

    constructor(PairConfig[] memory configs) public {
        for (uint i = 0; i < configs.length; i++) {
            PairConfig memory config = configs[i];
            if (config.priceSource == PriceSource.REPORTER) {
                // Init empty token pair
                MockUniswapTokenPair pair = new MockUniswapTokenPair(1,1,1,1,1);
                getPair[config.token0][config.token1] = address(pair);
                getPair[config.token1][config.token0] = address(pair); // populate mapping in the reverse direction
            }
        }
    }

    function createPair(address token0, address token1) external view returns (address pair) {
        address result = getPair[token0][token1];
        require(result != address(0), "Pair is expected to be set in constructor");
        return result;
    }
}
