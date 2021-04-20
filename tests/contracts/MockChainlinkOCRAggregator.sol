// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "../../contracts/Chainlink/AggregatorValidatorInterface.sol";

contract MockChainlinkOCRAggregator {

    AggregatorValidatorInterface public uniswapAnchoredView;

    function setUniswapAnchoredView(address addr) public {
        uniswapAnchoredView = AggregatorValidatorInterface(addr);
    }

    function validate(int latestPrice) public {
        uniswapAnchoredView.validate(0, 0, 0, latestPrice);
    }
}