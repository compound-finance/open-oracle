// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;

// @dev mock version of v1 price oracle, allowing manually setting return values
contract ProxyPriceOracle {

    mapping(address => uint256) public prices;

    function setUnderlyingPrice(address ctoken, uint price) external {
        prices[ctoken] = price;
    }

    function getUnderlyingPrice(address ctoken) external view returns (uint) {
        return prices[ctoken];
    }
}


contract MockAnchorOracle {
    struct Anchor {
        // floor(block.number / numBlocksPerPeriod) + 1
        uint period;

        // Price in ETH, scaled by 10**18
        uint priceMantissa;
    }
    mapping(address => uint256) public assetPrices;

    function setPrice(address asset, uint price) external {
        assetPrices[asset] = price;
    }

    function setUnderlyingPrice(MockCToken asset, uint price) external {
        assetPrices[asset.underlying()] = price;
    }


    uint public constant numBlocksPerPeriod = 240;

    mapping(address => Anchor) public anchors;
    function setAnchorPeriod(address asset, uint period) external {
        // dont care about anchor price, only period
        anchors[asset] = Anchor({period: period, priceMantissa: 1e18});
    }
}

contract MockCToken {
    address public underlying;
    constructor(address underlying_) public {
        underlying = underlying_;
    }
}
