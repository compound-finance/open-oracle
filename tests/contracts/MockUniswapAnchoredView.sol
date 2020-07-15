// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../contracts/Uniswap/UniswapAnchoredView.sol";

contract MockUniswapAnchoredView is UniswapAnchoredView {
    mapping(bytes32 => uint) public anchorPrices;

    constructor(OpenOraclePriceData priceData_,
                address reporter_,
                uint anchorToleranceMantissa_,
                uint anchorPeriod_,
                TokenConfigInput[] memory inputs) UniswapAnchoredView(priceData_, reporter_, anchorToleranceMantissa_, anchorPeriod_, inputs) public {}

    function setAnchorPrice(string memory symbol, uint price) external {
        anchorPrices[symbolToWord(symbol)] = price;
    }

    function fetchAnchorPrice(TokenConfig memory config, uint _conversionFactor) internal override returns (uint) {
        _conversionFactor; // Shh
        return anchorPrices[config.symbolWord];
    }
}
