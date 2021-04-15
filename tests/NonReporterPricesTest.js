const { sendRPC } = require('./Helpers');

function address(n) {
  return `0x${n.toString(16).padStart(40, '0')}`;
}

function keccak256(str) {
  return web3.utils.keccak256(str);
}

function uint(n) {
  return web3.utils.toBN(n).toString();
}

const PriceSource = {
  FIXED_ETH: 0,
  FIXED_USD: 1,
  REPORTER: 2
};

describe('UniswapAnchoredView', () => {
  it('handles fixed_usd prices', async () => {
    const USDC = {cToken: address(1), underlying: address(2), symbolHash: keccak256("USDC"), baseUnit: uint(1e6), priceSource: PriceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: address(0), reporter: address(5), failoverPriceFeed: address(7), isUniswapReversed: false};
    const USDT = {cToken: address(3), underlying: address(4), symbolHash: keccak256("USDT"), baseUnit: uint(1e6), priceSource: PriceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: address(0), reporter: address(6), failoverPriceFeed: address(8), isUniswapReversed: false};
    const oracle = await deploy('UniswapAnchoredView', [0, 0, [USDC, USDT]]);
    expect(await call(oracle, 'price', ["USDC"])).numEquals(1e6);
    expect(await call(oracle, 'price', ["USDT"])).numEquals(1e6);
  });

  it('reverts fixed_eth prices if no ETH price', async () => {
    const SAI = {cToken: address(5), underlying: address(6), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), reporter: address(1), failoverPriceFeed: address(2), isUniswapReversed: false};
    const oracle = await deploy('UniswapAnchoredView', [0, 0, [SAI]]);
    expect(call(oracle, 'price', ["SAI"])).rejects.toRevert('revert ETH price not set, cannot convert to dollars');
  });

  it('reverts if ETH has no uniswap market', async () => {
    if (!coverage) {
      // This test for some reason is breaking coverage in CI, skip for now
      const ETH = {cToken: address(5), underlying: address(6), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: address(0), reporter: address(1), failoverPriceFeed: address(2), isUniswapReversed: true};
      const SAI = {cToken: address(5), underlying: address(6), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), reporter: address(1), failoverPriceFeed: address(2), isUniswapReversed: false};
      expect(deploy('UniswapAnchoredView', [0, 0, [ETH, SAI]])).rejects.toRevert('revert reported prices must have an anchor');
    }
  });

  it('reverts if non-reporter has a uniswap market', async () => {
    if (!coverage) {
      const ETH = {cToken: address(5), underlying: address(6), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: 14, uniswapMarket: address(112), reporter: address(1), failoverPriceFeed: address(2), isUniswapReversed: true};
      const SAI = {cToken: address(5), underlying: address(6), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), reporter: address(1), failoverPriceFeed: address(2), isUniswapReversed: false};
      expect(deploy('UniswapAnchoredView', [0, 0, [ETH, SAI]])).rejects.toRevert('revert only reported prices utilize an anchor');
    }
  });

  it('handles fixed_eth prices', async () => {
    if (!coverage) {
      const usdc_eth_pair = await deploy("MockUniswapTokenPair", [
        "1865335786147",
        "8202340665419053945756",
        "1593755855",
        "119785032308978310142960133641565753500432674230537",
        "5820053774558372823476814618189",
      ]);
      const reporter = await deploy('MockChainlinkOCRAggregator');
      const ETH = {cToken: address(5), underlying: address(6), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: usdc_eth_pair._address, reporter: reporter.options.address, failoverPriceFeed: address(1), isUniswapReversed: true};
      const SAI = {cToken: address(7), underlying: address(8), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), reporter: address(0), failoverPriceFeed: address(1), isUniswapReversed: false};
      const oracle = await deploy('UniswapAnchoredView', [uint(20e16), 60, [ETH, SAI]]);
      await send(reporter, 'setUniswapAnchoredView', [oracle.options.address]);
      await sendRPC(web3, 'evm_increaseTime', [30 * 60]);
      const ethPrice = 226815000;
      await send(reporter, "validate", [ethPrice]);
      expect(await call(oracle, 'price', ["ETH"])).numEquals(ethPrice);
      expect(await call(oracle, 'price', ["SAI"])).numEquals(1198842);
    }
  });
});