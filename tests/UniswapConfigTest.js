function address(n) {
  return `0x${n.toString(16).padStart(40, '0')}`;
}

function toAscii(b) {
  return web3.utils.toAscii(b).replace(/\0/g, '');
}

function uint(n) {
  return web3.utils.toBN(n).toString();
}

describe('UniswapConfig', () => {
  it('basically works', async () => {
    const contract = await deploy('UniswapConfig', [[
      {cToken: address(1), underlying: address(0), symbol: 'ETH', baseUnit: uint(1e18), priceSource: 0, fixedPrice: 0, uniswapMarket: address(6), isUniswapReversed: false},
      {cToken: address(2), underlying: address(3), symbol: 'BTC', baseUnit: uint(1e18), priceSource: 1, fixedPrice: 1, uniswapMarket: address(7), isUniswapReversed: true}
    ]]);

    const cfg0 = await call(contract, 'getTokenConfig', [0]);
    const cfg1 = await call(contract, 'getTokenConfig', [1]);
    const cfgETH = await call(contract, 'getTokenConfigBySymbol', ['ETH']);
    const cfgBTC = await call(contract, 'getTokenConfigBySymbol', ['BTC']);
    const cfgCT0 = await call(contract, 'getTokenConfigByCToken', [address(1)]);
    const cfgCT1 = await call(contract, 'getTokenConfigByCToken', [address(2)]);
    expect(cfg0).toEqual(cfgETH);
    expect(cfgETH).toEqual(cfgCT0);
    expect(cfg1).toEqual(cfgBTC);
    expect(cfgBTC).toEqual(cfgCT1);
    expect(cfg0).not.toEqual(cfg1);

    await expect(call(contract, 'getTokenConfig', [2])).rejects.toRevert('revert token config not found');
    await expect(call(contract, 'getTokenConfigBySymbol', ['COMP'])).rejects.toRevert('revert token config not found');
    await expect(call(contract, 'getTokenConfigByCToken', [address(3)])).rejects.toRevert('revert'); // not a ctoken
  });

  it.only('returns configs exactly as specified', async () => {
    const symbols = Array(30).fill(0).map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i));
    const configs = symbols.map((symbol, i) => {
      return {cToken: address(i + 1), underlying: address(i), symbol, baseUnit: uint(1e6), priceSource: 0, fixedPrice: 1, uniswapMarket: address(i + 50), isUniswapReversed: i % 2 == 0}
    });
    const contract = await deploy('UniswapConfig', [configs]);

    await Promise.all(configs.map(async (config, i) => {
      const cfgByIndex = await call(contract, 'getTokenConfig', [i]);
      const cfgBySymbol = await call(contract, 'getTokenConfigBySymbol', [symbols[i]]);
      const cfgByCToken = await call(contract, 'getTokenConfigByCToken', [address(i + 1)]);
      expect({
        symbol: toAscii(cfgByIndex.symbolWord),
        cToken: cfgByIndex.cToken.toLowerCase(),
        underlying: cfgByIndex.underlying.toLowerCase(),
        baseUnit: cfgByIndex.baseUnit,
        priceSource: cfgByIndex.priceSource,
        fixedPrice:  cfgByIndex.fixedPrice,
        uniswapMarket: cfgByIndex.uniswapMarket.toLowerCase(),
        isUniswapReversed: cfgByIndex.isUniswapReversed
      }).toEqual({
        symbol: config.symbol,
        cToken: config.cToken,
        underlying: config.underlying,
        baseUnit: `${config.baseUnit}`,
        priceSource: `${config.priceSource}`,
        fixedPrice: `${config.fixedPrice}`,
        uniswapMarket: config.uniswapMarket,
        isUniswapReversed: config.isUniswapReversed
      });
      expect(cfgByIndex).toEqual(cfgBySymbol);
      expect(cfgBySymbol).toEqual(cfgByCToken);
    }));
  });

  it('checks gas', async () => {
    const configs = Array(26).fill(0).map((_, i) => {
      const symbol = String.fromCharCode('a'.charCodeAt(0) + i);
      return {cToken: address(i + 1), underlying: address(i), symbol, baseUnit: uint(1e6), priceSource: 0, fixedPrice: 1, uniswapMarket: address(i + 50), isUniswapReversed: i % 2 == 0}
    });
    const contract = await deploy('UniswapConfig', [configs]);

    const cfg9 = await call(contract, 'getTokenConfig', [9]);
    const tx9 = await send(contract, 'getTokenConfig', [9]);
    expect(cfg9.underlying).toEqual(address(9));
    expect(tx9.gasUsed).toEqual(22628);

    const cfg25 = await call(contract, 'getTokenConfig', [25]);
    const tx25 = await send(contract, 'getTokenConfig', [25]);
    expect(cfg25.underlying).toEqual(address(25));
    expect(tx25.gasUsed).toEqual(23044);

    const cfgZ = await call(contract, 'getTokenConfigBySymbol', ['z']);
    const txZ = await send(contract, 'getTokenConfigBySymbol', ['z']);
    expect(cfgZ.underlying).toEqual(address(25));
    expect(txZ.gasUsed).toEqual(25022);

    const cfgCT26 = await call(contract, 'getTokenConfigByCToken', [address(26)]);
    const txCT26 = await send(contract, 'getTokenConfigByCToken', [address(26)]);
    expect(cfgCT26.underlying).toEqual(address(25));
    expect(txCT26.gasUsed).toEqual(25145);
  });
});
