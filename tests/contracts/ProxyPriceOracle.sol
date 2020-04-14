pragma solidity ^0.6.6;
import "../../contracts/DelFiPrice.sol";


contract ProxyPriceOracle is AnchorPriceOracle {
    /// @notice The mapping of medianized prices per CToken contract address
    mapping(address => uint64) public prices;

    function setUnderlyingPrice(address ctoken, uint64 price) external {
        prices[ctoken] = price;
    }

    function getUnderlyingPrice(address ctoken) external override returns (uint) {
        return prices[ctoken];
    }
}
