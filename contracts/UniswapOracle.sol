pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./UniswapContracts.sol";

/**
 * @notice 
 * @dev 
 * @dev
 * @author
 */
contract UniswapOracle {
    using FixedPoint for *;

     /// @notice The IUniswapV2Pair Token Pairs
    struct TokenPairs {
        address USDC_ETH_pair;
        address DAI_ETH_pair;
        address BAT_ETH_pair;
        address REP_ETH_pair;
        address WETH_ZRX_pair;
        address WBTC_ETH_pair;
    }

    // Addresses of the Token Pairs contracts
    address public immutable USDC_ETH_pair;
    address public immutable DAI_ETH_pair;
    address public immutable BAT_ETH_pair;
    address public immutable REP_ETH_pair;
    address public immutable WETH_ZRX_pair;
    address public immutable WBTC_ETH_pair;

    struct TokenPriceData {
        address pair;
        uint price0CumulativeLast;
        uint price1CumulativeLast;
        uint32 blockTimestampLast;
        FixedPoint.uq112x112 price0Average;
        FixedPoint.uq112x112 price1Average;
    }

    mapping(string => TokenPriceData) pairPrices;

    uint public constant PERIOD = 30 seconds;

    constructor(TokenPairs memory pairs) public { 
        USDC_ETH_pair = pairs.USDC_ETH_pair;
        DAI_ETH_pair = pairs.DAI_ETH_pair;
        BAT_ETH_pair = pairs.BAT_ETH_pair;
        REP_ETH_pair = pairs.REP_ETH_pair;
        WETH_ZRX_pair = pairs.WETH_ZRX_pair;
        WBTC_ETH_pair = pairs.WBTC_ETH_pair;

        // Init all supported token pairs 
        initTokenPair("ETH", pairs.USDC_ETH_pair);
        initTokenPair("DAI", pairs.DAI_ETH_pair);
        initTokenPair("BAT", pairs.BAT_ETH_pair);
        initTokenPair("REP", pairs.REP_ETH_pair);
        initTokenPair("ZRX", pairs.WETH_ZRX_pair);
        initTokenPair("BTC", pairs.WBTC_ETH_pair);
    }

    function initTokenPair(string memory symbol, address _pair) internal {
        // IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory_, token, wethAddress_));
        IUniswapV2Pair pair = IUniswapV2Pair(_pair); 

        uint112 reserve0;
        uint112 reserve1;
        uint32 blockTimestampLast;
        (reserve0, reserve1, blockTimestampLast) = pair.getReserves();
        require(reserve0 != 0 && reserve1 != 0, "UniswapOracle: NO_RESERVES"); // ensure that there's liquidity in the pair

        pairPrices[symbol].pair = address(pair);
        pairPrices[symbol].price0CumulativeLast = pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
        pairPrices[symbol].price1CumulativeLast = pair.price1CumulativeLast();  // fetch the current accumulated price value (0 / 1)
        pairPrices[symbol].blockTimestampLast = blockTimestampLast;
    }

    function update(string calldata symbol) external {
        (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp) =
            UniswapV2OracleLibrary.currentCumulativePrices(pairPrices[symbol].pair);
        uint32 timeElapsed = blockTimestamp - pairPrices[symbol].blockTimestampLast; // overflow is desired

        // ensure that at least one full period has passed since the last update
        // require(timeElapsed >= PERIOD, "UniswapOracle: PERIOD_NOT_ELAPSED");

        // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        pairPrices[symbol].price0Average = FixedPoint.uq112x112(uint224((price0Cumulative - pairPrices[symbol].price0CumulativeLast) / timeElapsed));
        pairPrices[symbol].price1Average = FixedPoint.uq112x112(uint224((price1Cumulative - pairPrices[symbol].price1CumulativeLast) / timeElapsed));

        pairPrices[symbol].price0CumulativeLast = price0Cumulative;
        pairPrices[symbol].price1CumulativeLast = price1Cumulative;
        pairPrices[symbol].blockTimestampLast = blockTimestamp;
    }

    // note this will always return 0 before update has been called successfully for the first time.
    // TODO return price in USD
    function getPrice(string calldata symbol) external view returns (uint price0Average, uint price1Average) {
        return (pairPrices[symbol].price0Average.mul(1e18).decode144(), pairPrices[symbol].price1Average.mul(1e18).decode144());
    }

}
