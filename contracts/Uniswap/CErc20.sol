// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.8.7;

interface CErc20 {
    function underlying() external view returns (address);
}
