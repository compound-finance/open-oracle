// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.12;

import "./Uniswap/UniswapLib.sol";

contract UniswapV3SwapHelper is IUniswapV3SwapCallback {
    function performSwap(
        address pool,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96
    ) external returns (int256 amount0Delta, int256 amount1Delta) {
        (amount0Delta, amount1Delta) = IUniswapV3Pool(pool).swap(
            msg.sender,
            zeroForOne,
            amountSpecified,
            sqrtPriceLimitX96,
            abi.encode(msg.sender)
        );
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external override {
        // Caller will be a V3 pool
        IUniswapV3Pool pool = IUniswapV3Pool(msg.sender);
        address sender = abi.decode(data, (address));

        if (amount0Delta > 0) {
            IERC20(pool.token0()).transferFrom(
                sender,
                msg.sender,
                uint256(amount0Delta)
            );
        } else {
            IERC20(pool.token1()).transferFrom(
                sender,
                msg.sender,
                uint256(amount1Delta)
            );
        }
    }
}
