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
    const USDC = {cToken: address(1), underlying: address(2), symbolHash: keccak256("USDC"), baseUnit: uint(1e6), priceSource: PriceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: address(0), isUniswapReversed: false};
    const USDT = {cToken: address(3), underlying: address(4), symbolHash: keccak256("USDT"), baseUnit: uint(1e6), priceSource: PriceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: address(0), isUniswapReversed: false};
    const priceData = await deploy("OpenOraclePriceData", []);
    const oracle = await deploy('UniswapAnchoredView', [priceData._address, address(0), 0, 0, [USDC, USDT]]);
    expect(await call(oracle, 'price', ["USDC"])).numEquals(1e6);
    expect(await call(oracle, 'price', ["USDT"])).numEquals(1e6);
  });

  it('reverts fixed_eth prices if no ETH price', async () => {
    const SAI = {cToken: address(5), underlying: address(6), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), isUniswapReversed: false};
    const priceData = await deploy("OpenOraclePriceData", []);
    const oracle = await deploy('UniswapAnchoredView', [priceData._address, address(0), 0, 0, [SAI]]);
    expect(call(oracle, 'price', ["SAI"])).rejects.toRevert('revert ETH price not set, cannot convert to dollars');
  });

  it('reverts if ETH has no uniswap market', async () => {
    if (!coverage) {
      // This test for some reason is breaking coverage in CI, skip for now
      const ETH = {cToken: address(5), underlying: address(6), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: address(0), isUniswapReversed: true};
      const SAI = {cToken: address(5), underlying: address(6), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), isUniswapReversed: false};
      const priceData = await deploy("OpenOraclePriceData", []);
      expect(deploy('UniswapAnchoredView', [priceData._address, address(0), 0, 0, [ETH, SAI]])).rejects.toRevert('revert reported prices must have an anchor');
    }
  });

  it('reverts if non-reporter has a uniswap market', async () => {
    if (!coverage) {
      const ETH = {cToken: address(5), underlying: address(6), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: 14, uniswapMarket: address(112), isUniswapReversed: true};
      const SAI = {cToken: address(5), underlying: address(6), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), isUniswapReversed: false};
      const priceData = await deploy("OpenOraclePriceData", []);
      expect(deploy('UniswapAnchoredView', [priceData._address, address(0), 0, 0, [ETH, SAI]])).rejects.toRevert('revert only reported prices utilize an anchor');
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
      const reporter = "0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC";
      const messages = ["0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000d84ec180000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000"];
      const signatures = ["0xb8ba87c37228468f9d107a97eeb92ebd49a50993669cab1737fea77e5b884f2591affbf4058bcfa29e38756021deeafaeeab7a5c4f5ce584c7d1e12346c88d4e000000000000000000000000000000000000000000000000000000000000001b"];
      const ETH = {cToken: address(5), underlying: address(6), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: usdc_eth_pair._address, isUniswapReversed: true};
      const SAI = {cToken: address(7), underlying: address(8), symbolHash: keccak256("SAI"), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(5285551943761727), uniswapMarket: address(0), isUniswapReversed: false};
      const priceData = await deploy("OpenOraclePriceData", []);
      const oracle = await deploy('UniswapAnchoredView', [priceData._address, reporter, uint(20e16), 60, [ETH, SAI]]);
      await sendRPC(web3, 'evm_increaseTime', [30 * 60]);
      await send(oracle, "postPrices", [messages, signatures, ['ETH']]);
      expect(await call(oracle, 'price', ["ETH"])).numEquals(226815000);
      expect(await call(oracle, 'price', ["SAI"])).numEquals(1198842);
    }
  });
});