pragma solidity ^0.6.6;
import "../../contracts/DelFiPrice.sol";


// @dev mock version of price oracle proxy, allowing manually setting return values
contract ProxyPriceOracle is AnchorPriceOracle {

    mapping(address => uint256) public prices;

    function setUnderlyingPrice(address ctoken, uint price) external {
        prices[ctoken] = price;
    }

    function getUnderlyingPrice(address ctoken) override external view returns (uint) {
        return prices[ctoken];
    }
}
