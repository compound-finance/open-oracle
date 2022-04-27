// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "../Chainlink/AggregatorValidatorInterface.sol";

contract MockChainlinkOCRAggregator {
    AggregatorValidatorInterface public uniswapAnchoredView;

    function setUniswapAnchoredView(address addr) public {
        uniswapAnchoredView = AggregatorValidatorInterface(addr);
    }

    function validate(int256 latestPrice) public {
        uniswapAnchoredView.validate(0, 0, 0, latestPrice);
    }
}
