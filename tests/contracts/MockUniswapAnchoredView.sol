// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;
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

    function fetchAnchorPrice(bytes32 _symbolHash, TokenConfig memory config, uint _conversionFactor) internal override returns (uint) {
        _symbolHash; // Shh
        _conversionFactor; // Shh
        return anchorPrices[config.symbolHash];
    }
}
