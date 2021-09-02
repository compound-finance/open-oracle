// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "../../contracts/Uniswap/UniswapLib.sol";

// Adapted from: https://github.com/Uniswap/uniswap-v3-core/blob/main/contracts/UniswapV3Pool.sol

contract MockUniswapTokenPair is IUniswapV3Pool {
    uint112 public reserve0;
    uint112 public reserve1;
    uint32 public blockTimestampLast;

    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;

    constructor(
        uint112 reserve0_,
        uint112 reserve1_,
        uint32 blockTimestampLast_,
        uint256 price0CumulativeLast_,
        uint256 price1CumulativeLast_
    ) public {
        reserve0 = reserve0_;
        reserve1 = reserve1_;
        blockTimestampLast = blockTimestampLast_;
        price0CumulativeLast = price0CumulativeLast_;
        price1CumulativeLast = price1CumulativeLast_;
    }

    function update(
        uint112 reserve0_,
        uint112 reserve1_,
        uint32 blockTimestampLast_,
        uint256 price0CumulativeLast_,
        uint256 price1CumulativeLast_
    ) public {
        reserve0 = reserve0_;
        reserve1 = reserve1_;
        blockTimestampLast = blockTimestampLast_;
        price0CumulativeLast = price0CumulativeLast_;
        price1CumulativeLast = price1CumulativeLast_;
    }

    function getReserves() external view returns(uint112, uint112, uint32) {
        return (reserve0, reserve1, blockTimestampLast);
    }

    function getReservesFraction(bool reversedMarket) external view returns (uint224) {
        require(reserve0 > 0, "Reserve is equal to 0");
        require(reserve1 > 0, "Reserve is equal to 0");
        if (reversedMarket) {
          return (uint224(reserve0) << 112) / reserve1;
        } else {
          return (uint224(reserve1) << 112) / reserve0;
        }
    }

    function observe(uint32[] calldata secondsAgos)
        external
        override
        view
        returns (
            int56[] memory tickCumulatives,
            uint160[] memory secondsPerLiquidityCumulativeX128s
        ) {
        // TODO: Mock these if necessary
        secondsAgos;
        tickCumulatives = new int56[](0);
        secondsPerLiquidityCumulativeX128s = new uint160[](0);
    }
}
