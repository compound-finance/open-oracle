// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "../../contracts/Uniswap/UniswapAnchoredView.sol";

contract MockUniswapAnchoredView is UniswapAnchoredView {
    mapping(bytes32 => uint) public anchorPrices;

    constructor(
                uint anchorToleranceMantissa_,
                uint anchorPeriod_,
                TokenConfig[] memory configs) UniswapAnchoredView(anchorToleranceMantissa_, anchorPeriod_, configs) public {}

    function setAnchorPrice(string memory symbol, uint price) external {
        anchorPrices[keccak256(abi.encodePacked(symbol))] = price;
    }

    function fetchAnchorPrice(TokenConfig memory config, uint _conversionFactor) internal override view returns (uint) {
        _conversionFactor; // Shh
        return anchorPrices[config.symbolHash];
    }
}
