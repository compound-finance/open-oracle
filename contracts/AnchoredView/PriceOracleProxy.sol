pragma solidity ^0.6.6;

interface CErc20 {
    function underlying() external view returns (address);
}

interface V1PriceOracleInterface {
    function assetPrices(address asset) external view returns (uint);
}

contract PriceOracleProxy {
    /// @notice The v1 price oracle, which will continue to serve prices for v1 assets
    V1PriceOracleInterface public v1PriceOracle;

    /// @notice Handpicked key for USDC
    address public constant usdcOracleKey = address(1);

    /// @notice Handpicked key for DAI
    address public constant daiOracleKey = address(2);

    /// @notice Frozen SAI price in ETH
    uint public saiPrice = 1e18;

    /// @param v1PriceOracle_ The address of the v1 price oracle, which will continue to operate and hold prices for collateral assets
    constructor(address v1PriceOracle_) public {
        v1PriceOracle = V1PriceOracleInterface(v1PriceOracle_);
    }

    function getUnderlyingPrice(address cTokenAddress)

}
