function address(n) {
  return `0x${n.toString(16).padStart(40, '0')}`;
}

function keccak256(str) {
  return web3.utils.keccak256(str);
}

function uint(n) {
  return web3.utils.toBN(n).toString();
}

describe('UniswapConfig', () => {
  it('basically works', async () => {
    const unlistedButUnderlying = await deploy('MockCToken', [address(4)])
    const unlistedNorUnderlying = await deploy('MockCToken', [address(5)])
    const contract = await deploy('UniswapConfig', [[
      {cToken: address(1), underlying: address(0), symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: 0, fixedPrice: 0, uniswapMarket: address(6), reporter: address(8), isUniswapReversed: false},
      {cToken: address(2), underlying: address(3), symbolHash: keccak256('BTC'), baseUnit: uint(1e18), priceSource: 1, fixedPrice: 1, uniswapMarket: address(7), reporter: address(9), isUniswapReversed: true},
      {cToken: unlistedButUnderlying._address, underlying: address(4), symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: 1, fixedPrice: 1, uniswapMarket: address(7), reporter: address(10), isUniswapReversed: true}
    ]]);

    const cfg0 = await call(contract, 'getTokenConfig', [0]);
    const cfg1 = await call(contract, 'getTokenConfig', [1]);
    const cfg2 = await call(contract, 'getTokenConfig', [2]);
    const cfgETH = await call(contract, 'getTokenConfigBySymbol', ['ETH']);
    const cfgBTC = await call(contract, 'getTokenConfigBySymbol', ['BTC']);
    const cfgR8 = await call(contract, 'getTokenConfigByReporter', [address(8)]);
    const cfgR9 = await call(contract, 'getTokenConfigByReporter', [address(9)]);
    const cfgCT0 = await call(contract, 'getTokenConfigByCToken', [address(1)]);
    const cfgCT1 = await call(contract, 'getTokenConfigByCToken', [address(2)]);
    const cfgU2 =  await call(contract, 'getTokenConfigByCToken', [unlistedButUnderlying._address])
    expect(cfg0).toEqual(cfgETH);
    expect(cfgETH).toEqual(cfgR8);
    expect(cfgR8).toEqual(cfgCT0);
    expect(cfg1).toEqual(cfgBTC);
    expect(cfgBTC).toEqual(cfgR9);
    expect(cfgR9).toEqual(cfgCT1);
    expect(cfg0).not.toEqual(cfg1);
    expect(cfgU2).toEqual(cfg2);

    await expect(call(contract, 'getTokenConfig', [3])).rejects.toRevert('revert token config not found');
    await expect(call(contract, 'getTokenConfigBySymbol', ['COMP'])).rejects.toRevert('revert token config not found');
    await expect(call(contract, 'getTokenConfigByReporter', [address(1)])).rejects.toRevert('revert token config not found');
    await expect(call(contract, 'getTokenConfigByCToken', [address(3)])).rejects.toRevert('revert'); // not a ctoken
    await expect(call(contract, 'getTokenConfigByCToken', [unlistedNorUnderlying._address])).rejects.toRevert('revert token config not found');
  });

  it('returns configs exactly as specified', async () => {
    const symbols = Array(28).fill(0).map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i));
    const configs = symbols.map((symbol, i) => {
      return {cToken: address(i + 1), underlying: address(i), symbolHash: keccak256(symbol), baseUnit: uint(1e6), priceSource: 0, fixedPrice: 1, uniswapMarket: address(i + 50), reporter: address(i + 51), isUniswapReversed: i % 2 == 0}
    });
    const contract = await deploy('UniswapConfig', [configs]);

    await Promise.all(configs.map(async (config, i) => {
      const cfgByIndex = await call(contract, 'getTokenConfig', [i]);
      const cfgBySymbol = await call(contract, 'getTokenConfigBySymbol', [symbols[i]]);
      const cfgByCToken = await call(contract, 'getTokenConfigByCToken', [address(i + 1)]);
      const cfgByCReporter = await call(contract, 'getTokenConfigByReporter', [address(i + 51)]);
      const cfgByUnderlying = await call(contract, 'getTokenConfigByUnderlying', [address(i)]);
      expect({
        cToken: cfgByIndex.cToken.toLowerCase(),
        underlying: cfgByIndex.underlying.toLowerCase(),
        symbolHash: cfgByIndex.symbolHash,
        baseUnit: cfgByIndex.baseUnit,
        priceSource: cfgByIndex.priceSource,
        fixedPrice:  cfgByIndex.fixedPrice,
        uniswapMarket: cfgByIndex.uniswapMarket.toLowerCase(),
        reporter: cfgByIndex.reporter.toLowerCase(),
        isUniswapReversed: cfgByIndex.isUniswapReversed
      }).toEqual({
        cToken: config.cToken,
        underlying: config.underlying,
        symbolHash: config.symbolHash,
        baseUnit: `${config.baseUnit}`,
        priceSource: `${config.priceSource}`,
        fixedPrice: `${config.fixedPrice}`,
        uniswapMarket: config.uniswapMarket,
        reporter: config.reporter,
        isUniswapReversed: config.isUniswapReversed
      });
      expect(cfgByIndex).toEqual(cfgBySymbol);
      expect(cfgBySymbol).toEqual(cfgByCToken);
      expect(cfgByCToken).toEqual(cfgByCReporter);
      expect(cfgByUnderlying).toEqual(cfgBySymbol);
    }));
  });

  it('checks gas', async () => {
    const configs = Array(28).fill(0).map((_, i) => {
      const symbol = String.fromCharCode('a'.charCodeAt(0) + i);
      return {
        cToken: address(i),
        underlying: address(i + 1),
        symbolHash: keccak256(symbol),
        baseUnit: uint(1e6),
        priceSource: 0,
        fixedPrice: 1,
        uniswapMarket: address(i + 50),
        reporter: address(i + 51),
        isUniswapReversed: i % 2 == 0}
    });
    const contract = await deploy('UniswapConfig', [configs]);

    const cfg9 = await call(contract, 'getTokenConfig', [9]);
    const tx9 = await send(contract, 'getTokenConfig', [9]);
    expect(cfg9.underlying).addrEquals(address(10));
    expect(tx9.gasUsed).toEqual(22814);

    const cfg25 = await call(contract, 'getTokenConfig', [27]);
    const tx25 = await send(contract, 'getTokenConfig', [27]);
    expect(cfg25.underlying).addrEquals(address(28));
    expect(tx25.gasUsed).toEqual(23282);

    const cfgZ = await call(contract, 'getTokenConfigBySymbol', ['z']);
    const txZ = await send(contract, 'getTokenConfigBySymbol', ['z']);
    expect(cfgZ.cToken).addrEquals(address(25));
    expect(cfgZ.underlying).addrEquals(address(26));
    expect(txZ.gasUsed).toEqual(25511);

    const cfgCT26 = await call(contract, 'getTokenConfigByCToken', [address(27)]);
    const txCT26 = await send(contract, 'getTokenConfigByCToken', [address(27)]);
    expect(cfgCT26.cToken).addrEquals(address(27));
    expect(cfgCT26.underlying).addrEquals(address(28));
    expect(txCT26.gasUsed).toEqual(25529);

    const cfgR26 = await call(contract, 'getTokenConfigByReporter', [address(27+51)]);
    const txR26 = await send(contract, 'getTokenConfigByReporter', [address(27+51)]);
    expect(cfgR26.cToken).addrEquals(address(27));
    expect(cfgR26.underlying).addrEquals(address(28));
    expect(txR26.gasUsed).toEqual(25530);

    const cfgU26 = await call(contract, 'getTokenConfigByUnderlying', [address(28)]);
    const txU26 = await send(contract, 'getTokenConfigByUnderlying', [address(28)]);
    expect(cfgU26.cToken).addrEquals(address(27));
    expect(cfgU26.underlying).addrEquals(address(28));
    expect(txU26.gasUsed).toEqual(25552);
  });
});