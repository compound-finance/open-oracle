const {
  address,
  bytes,
  encode,
  sign,
  uint256
} = require('./Helpers');

describe('OpenOracleData', () => {
  // XXX describe cant be async with jest :(
  //  all things considered, havent found a nice way to do setup
  it('sets up the oracle data and tests some stuff', async () => {
    const privateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';
    const oracleData = await deploy('OpenOracleData', []);
    const priceData = await deploy('OpenOraclePriceData', []);

    // gets default data
    let {
      0: timestamp,
      1: value
    } = await call(priceData.methods.get(address(0), 'ETH'));

    expect(timestamp).numEquals(0);
    expect(value).numEquals(0);

    const delfi = await deploy('DelFiPrice', [priceData.address, [account]]);
    const now = new Date - 0;

    // succeeds with message (no pairs) + signature
    const K = 'ETH', V = 7;
    let {
      message,
      signature,
      signatory
    } = sign(encode(now, []), privateKey);

    // the source we recover in solidity should match
    expect(await call(oracleData.methods.source(message, signature))).toEqual(signatory);
    expect(await call(oracleData.methods.source(bytes('bad'), signature))).not.toEqual(signatory);
    await expect(call(oracleData.methods.source(message, bytes('0xbad')))).rejects.toRevert();

    // writes nothing
    const wrote0 = await send(priceData.methods.put(message, signature));
    expect(wrote0.gasUsed).toBeLessThan(40000);

    // reads nothing
    ({
      0: timestamp,
      1: value
    } = await call(priceData.methods.get(signatory, K)));
     expect(timestamp).numEquals(0);
     expect(value).numEquals(0);

    // writes 1 pair
    ({
      message,
      signature,
      signatory
    } = sign(encode(now, [[K, V]]), privateKey));

    const wrote1 = await send(priceData.methods.put(message, signature), {gas: 1000000});
    expect(wrote1.gasUsed).toBeLessThan(82000);

    // reads 1 pair
    ({
      0: timestamp,
      1: value
    } = await call(priceData.methods.get(signatory, K)));
    expect(timestamp).numEquals(now);
    expect(value).numEquals(V);

    // write fails with older timestamp
    ({
      message,
      signature,
      signatory
    } = sign(encode(now - 1, [[K, 6]]), privateKey));

    await send(priceData.methods.put(message, signature), {gas: 1000000});

    ({
      0: timestamp,
      1: value
    } = await call(priceData.methods.get(signatory, K)));
    expect(timestamp).numEquals(now);
    expect(value).numEquals(V);

    // writes 2 pairs
    ({
      message,
      signature,
      signatory
    } = sign(encode(now, [
      ['ABC', 100],
      ['BTC', 9000],
    ]), privateKey));

    const wrote2a = await send(priceData.methods.put(message, signature), {gas: 1000000});
    expect(wrote2a.gasUsed).toBeLessThan(130000);

    ({
      0: timestamp,
      1: value
    } = await call(priceData.methods.get(signatory, 'BTC')));
    expect(timestamp).numEquals(now);
    expect(value).numEquals(9000);

    ({
      message,
      signature,
      signatory
    } = sign(encode(now + 1, [
      ['ABC', 100],
      ['BTC', 9000],
    ]), privateKey));

    const wrote2b = await send(priceData.methods.put(message, signature), {gas: 1000000});
    expect(wrote2b.gasUsed).toBeLessThan(70000);

  }, 30000);
});
