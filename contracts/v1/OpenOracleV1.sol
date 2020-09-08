// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../Uniswap/UniswapAnchoredView.sol";

interface IPriceOracle {
	function assetPrices(address) external returns (uint256);
	function getPrices(address) external returns (uint256);
}

/**
 * @title Open Oracle Adapater for v1 Interface
 * @author Compound Labs, Inc.
 */
contract OpenOracleV1 is IPriceOracle {
	UniswapAnchoredView public immutable openOracleView;

	constructor(UniswapAnchoredView openOracleView_) public {
		openOracleView = openOracleView_;
	}

	function getPrices(address asset) public override returns (uint256) {
		UniswapConfig.TokenConfig memory ethConfig = openOracleView.getTokenConfigBySymbol("ETH");
		UniswapConfig.TokenConfig memory cTokenConfig = openOracleView.getTokenConfigByUnderlying(asset);
		uint tokenPrice = openOracleView.getUnderlyingPrice(cTokenConfig.cToken);
		uint ethPrice = openOracleView.getUnderlyingPrice(ethConfig.cToken);
		require(ethPrice != 0, "eth price 0");
		return mul(tokenPrice, 1e18) / ethPrice;
	}

	function assetPrices(address asset) public override returns (uint256) {
		return getPrices(asset);
	}

	/// @dev Overflow proof multiplication
    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) return 0;
        uint c = a * b;
        require(c / a == b, "multiplication overflow");
        return c;
    }
}
