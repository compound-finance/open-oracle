
describe('OracleData', () => {
  // XXX describe cant be async with jest :(
  //  all things considered, havent found a nice way to do setup
  it('sets up the oracle data and tests some stuff', async () => {
    const {
      account,
      address,
      bytes,
      deploy,
      encode,
      sign,
      web3
    } = saddle; // XXX this kinda sucks

    const privateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';
    const oracleData = await deploy('OracleData', [], {from: account});
    const priceData = await deploy('OraclePriceData', [], {from: account});

    // gets default data
    let {
      0: timestamp,
      1: value
    } = await priceData.methods.get(address(0), 'ETH').call();
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
    expect(await oracleData.methods.source(message, signature).call()).toEqual(signatory);
    expect(await oracleData.methods.source(bytes('bad'), signature).call()).not.toEqual(signatory);
    await expect(oracleData.methods.source(message, bytes('0xbad')).call()).rejects.toThrow('revert');

    // writes nothing
    const wrote0 = await priceData.methods.put(message, signature).send({from: account});
    expect(wrote0.gasUsed).toBeLessThan(40000);

    // reads nothing
    ({
      0: timestamp,
      1: value
    } = await priceData.methods.get(signatory, K).call());
     expect(timestamp).numEquals(0);
     expect(value).numEquals(0);

    // writes 1 pair
    ({
      message,
      signature,
      signatory
    } = sign(encode(now, [[K, V]]), privateKey));

    const wrote1 = await priceData.methods.put(message, signature).send({from: account, gas: 1000000});
    expect(wrote1.gasUsed).toBeLessThan(80000);

    // reads 1 pair
    ({
      0: timestamp,
      1: value
    } = await priceData.methods.get(signatory, K).call());
    expect(timestamp).numEquals(now);
    expect(value).numEquals(V);

    // write fails with older timestamp
    ({
      message,
      signature,
      signatory
    } = sign(encode(now - 1, [[K, 6]]), privateKey));

    await priceData.methods.put(message, signature).send({from: account, gas: 1000000});

    ({
      0: timestamp,
      1: value
    } = await priceData.methods.get(signatory, K).call());
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

    const wrote2a = await priceData.methods.put(message, signature).send({from: account, gas: 1000000});
    expect(wrote2a.gasUsed).toBeLessThan(125000);

    ({
      0: timestamp,
      1: value
    } = await priceData.methods.get(signatory, 'BTC').call());
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

    const wrote2b = await priceData.methods.put(message, signature).send({from: account, gas: 1000000});
    expect(wrote2b.gasUsed).toBeLessThan(65000);

  }, 30000);
});
