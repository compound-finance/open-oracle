const { address, bytes, numToHex, time } = require('./Helpers');

const { encode, sign } = require('../sdk/javascript/.tsbuilt/reporter');

describe('OpenOracleData', () => {
  let oracleData;
  let priceData;
  const privateKey =
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';
  const signer = '0x1826265c3156c3B9b9e751DC4635376F3CD6ee06';
  
  beforeEach(async done => {
    oracleData = await deploy('OpenOracleData', []);
    priceData = await deploy('OpenOraclePriceData', []);
    done();
  });

  it('has correct default data', async () => {
    let { 0: timestamp, 1: value } = await call(priceData, 'get', [
      address(0),
      'ETH'
    ]);

    expect(timestamp).numEquals(0);
    expect(value).numEquals(0);
  });

  it('source() should ecrecover correctly', async () => {
    const [{ message, signature }] = sign(
      encode('prices', time(), [['ETH', 700]]),
      privateKey
    );
    await send(priceData, 'put', [message, signature], {
      gas: 1000000
    });

    expect(await call(oracleData, 'source', [message, signature])).toEqual(
      signer
    );
    expect(
      await call(oracleData, 'source', [bytes('bad'), signature])
    ).not.toEqual(signer);
    await expect(
      call(oracleData, 'source', [message, bytes('0xbad')])
    ).rejects.toRevert();
  });

  it('should save data from put()', async () => {
    const timestamp = time() - 1;
    const ethPrice = 700;
    const [{ message, signature }] = sign(
      encode('prices', timestamp, [['ETH', ethPrice]]),
      privateKey
    );

    const putTx = await send(priceData, 'put', [message, signature], {
      gas: 1000000
    });
    expect(putTx.gasUsed).toBeLessThan(86000);
  });


  it('sending data from before previous checkpoint should fail', async () => {
    const timestamp = time() - 1;
    let [{ message, signature }] = sign(
      encode('prices', timestamp, [['ABC', 100]]),
      privateKey
    );
    await send(priceData, 'put', [message, signature], {
      gas: 1000000
    });

    const timestamp2 = timestamp - 1;
    const [{ message: message2, signature: signature2 }] = sign(
      encode('prices', timestamp2, [['ABC', 150]]),
      privateKey
    );
    const putTx = await send(priceData, 'put', [message2, signature2], {
      gas: 1000000
    });

    expect(putTx.events.NotWritten).not.toBe(undefined);

    ({ 0: signedTimestamp, 1: value } = await call(priceData, 'get', [
      signer,
      'ABC'
    ]));
    expect(value / 1e6).toBe(100);
  });

  it('signing future timestamp should not write to storage', async () => {
    const timestamp = time() + 3601;
    const [{ message, signature }] = sign(
      encode('prices', timestamp, [['ABC', 100]]),
      privateKey
    );
    const putTx = await send(priceData, 'put', [message, signature], {
      gas: 1000000
    });
    expect(putTx.events.NotWritten).not.toBe(undefined);
    ({ 0: signedTimestamp, 1: value } = await call(priceData, 'get', [
      signer,
      'ABC'
    ]));
    expect(+value).toBe(0);
  });

  it('two pairs with update', async () => {
    const timestamp = time() - 2;
    const signed = sign(
      encode('prices', timestamp, [['ABC', 100], ['BTC', 9000]]),
      privateKey
    );

    for ({ message, signature } of signed) {
      await send(priceData, 'put', [message, signature], {
        gas: 1000000
      });
    }

    ({ 0: signedTime, 1: value } = await call(priceData, 'get', [
      signer,
      'BTC'
    ]));
    expect(value / 1e6).numEquals(9000);

    ({ 0: signedTime, 1: value } = await call(priceData, 'get', [
      signer,
      'ABC'
    ]));
    expect(value / 1e6).numEquals(100);

    //2nd tx
    const later = timestamp + 1;

    const signed2 = sign(
      encode('prices', later, [['ABC', 101], ['BTC', 9001]]),
      privateKey
    );

    for ({ message, signature } of signed2) {
      const wrote2b = await send(priceData, 'put', [message, signature], {
        gas: 1000000
      });
      expect(wrote2b.gasUsed).toBeLessThan(75000);
    }

    ({ 0: signedTime, 1: value } = await call(priceData, 'get', [
      signer,
      'BTC'
    ]));
    expect(value / 1e6).numEquals(9001);

    ({ 0: signedTime, 1: value } = await call(priceData, 'get', [
      signer,
      'ABC'
    ]));
    expect(value / 1e6).numEquals(101);
  });
});
