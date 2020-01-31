const {
  address,
  bytes,
  numToHex
} = require('./Helpers');

const {
  encode,
  sign,
} = require('../sdk/javascript/.tsbuilt/reporter');

describe('OpenOracleData', () => {
  let oracleData;
  let priceData;
  let delfi;
  let anchorAddress = accounts[1];

  beforeEach(async done => {
    oracleData = await deploy('OpenOracleData', []);
    priceData = await deploy('OpenOraclePriceData', []);
    delfi = await deploy('DelFiPrice', [priceData._address, [account], anchorAddress, numToHex(1e17)]);
    done();
  });

  // TODO: refactor this ;/
  it('sets up the oracle data and tests some stuff', async () => {
    const privateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';

    // gets default data
    let {
      0: timestamp,
      1: value
    } = await call(priceData, 'get', [address(0), 'ETH']);

    expect(timestamp).numEquals(0);
    expect(value).numEquals(0);

    const now = new Date - 0;

    // succeeds with message (no pairs) + signature
    const K = 'ETH', V = 7;
    let signed = sign(encode('prices', now, []), privateKey);
    expect(signed).toEqual([]);

    // 1 pair
    signed = sign(encode('prices', now, [[K, V]]), privateKey);

    for (let {message, signature, signatory} of signed) {
      // writes
      const wrote1 = await send(priceData, 'put', [message, signature], {gas: 1000000});
      expect(wrote1.gasUsed).toBeLessThan(86000);

      // the source we recover in solidity should match
      expect(await call(oracleData, 'source', [message, signature])).toEqual(signatory);
      expect(await call(oracleData, 'source', [bytes('bad'), signature])).not.toEqual(signatory);
      await expect(call(oracleData, 'source', [message, bytes('0xbad')])).rejects.toRevert();

      // reads
      ({
        0: timestamp,
        1: value
      } = await call(priceData, 'get', [signatory, K]));
      expect(timestamp).numEquals(now);
      expect(value).numEquals(V * 1e6);
    }

    // 1 pair old timestamp
    signed = sign(encode('prices', now - 1, [[K, 6]]), privateKey);

    for (let {message, signature, signatory} of signed) {
      // write fails
      await send(priceData, 'put', [message, signature], {gas: 1000000});

      ({
        0: timestamp,
        1: value
      } = await call(priceData, 'get', [signatory, K]));
      expect(timestamp).numEquals(now);
      expect(value).numEquals(V * 1e6);
    }

    // 2 pairs
    signed = sign(encode('prices', now, [
      ['ABC', 100],
      ['BTC', 9000],
    ]), privateKey);

    let i = 0;
    for (let {message, signature, signatory} of signed) {
      // writes
      const wrote2a = await send(priceData, 'put', [message, signature], {gas: 1000000});
      expect(wrote2a.gasUsed).toBeLessThan(135000);

      if (i++ == 1) {
        ({
          0: timestamp,
          1: value
        } = await call(priceData, 'get', [signatory, 'BTC']));
        expect(timestamp).numEquals(now);
        expect(value).numEquals(9000e6);
      }
    }

    // 2 pairs update
    signed = sign(encode('prices', now + 1, [
      ['ABC', 100],
      ['BTC', 9000],
    ]), privateKey);

    for (let {message, signature, signatory} of signed) {
      const wrote2b = await send(priceData, 'put', [message, signature], {gas: 1000000});
      expect(wrote2b.gasUsed).toBeLessThan(75000);
    }
  }, 30000);
});
