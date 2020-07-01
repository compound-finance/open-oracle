function address(n) {
  return `0x${n.toString(16).padStart(40, '0')}`;
}

function integer(n) {
  return web3.utils.toBN(n);
}

function keccak256(str) {
  return web3.utils.keccak256(str);
}

describe('SymbolConfiguration', () => {
  it('basically works', async () => {
    const contract = await deploy('SymbolConfiguration', [[
      {cToken: address(1), underlying: address(0), symbolHash: keccak256('ETH'), baseUnit: integer(1e18), priceSource: 0, fixedPrice: 0, uniswapMarket: address(6), isUniswapReversed: false},
      {cToken: address(2), underlying: address(3), symbolHash: keccak256('BTC'), baseUnit: integer(1e18), priceSource: 1, fixedPrice: 1, uniswapMarket: address(7), isUniswapReversed: true}
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

  it.only('checks gas', async () => {
    const configs = Array(26).fill(0).map((_, i) => {
      const symbol = String.fromCharCode('a'.charCodeAt(0) + i);
      return {cToken: address(i + 1), underlying: address(i), symbolHash: keccak256(symbol), baseUnit: integer(1e6), priceSource: 0, fixedPrice: 1, uniswapMarket: address(i + 50), isUniswapReversed: i % 2 == 0}
    });
    const contract = await deploy('SymbolConfiguration', [configs]);

    const cfg9 = await call(contract, 'getTokenConfig', [9]);
    const tx9 = await send(contract, 'getTokenConfig', [9]);
    expect(cfg9.underlying).toEqual(address(9));
    expect(tx9.gasUsed).toEqual(22619);

    const cfg25 = await call(contract, 'getTokenConfig', [25]);
    const tx25 = await send(contract, 'getTokenConfig', [25]);
    expect(cfg25.underlying).toEqual(address(25));
    expect(tx25.gasUsed).toEqual(23035);

    const cfgZ = await call(contract, 'getTokenConfigBySymbol', ['z']);
    const txZ = await send(contract, 'getTokenConfigBySymbol', ['z']);
    expect(cfgZ.underlying).toEqual(address(25));
    expect(txZ.gasUsed).toEqual(24987);

    const cfgCT26 = await call(contract, 'getTokenConfigByCToken', [address(26)]);
    const txCT26 = await send(contract, 'getTokenConfigByCToken', [address(26)]);
    expect(cfgCT26.underlying).toEqual(address(25));
    expect(txCT26.gasUsed).toEqual(25136);
  });
});