// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;

import "../../contracts/Chainlink/AggregatorInterface.sol";

contract MockChainlinkPriceFeed is AggregatorInterface {

    int256 public price;

    function setLatestAnswer(int256 newPrice) external {
        price = newPrice;
    }

    function latestAnswer() external view override returns (int256) {
        return price;
    }
    function latestTimestamp() external view override returns (uint256) { return 0; }
    function latestRound() external view override returns (uint256) {return 0; }
    function getAnswer(uint256) external view override returns (int256) {return 0;}
    function getTimestamp(uint256) external view override returns (uint256) {return 0;}
}
