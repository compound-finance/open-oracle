const {
  encode,
  sign,
} = require('../sdk/javascript/.tsbuilt/reporter');

async function setup(N) {
  const sources = [
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf11',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf12',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf13',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf14',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf20',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf21',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf22',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf23',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf24',
  ].slice(0, N).map(web3.eth.accounts.privateKeyToAccount.bind(web3.eth.accounts));

  const nonSources = [
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf15',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf16',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf17',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf18',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf19',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf25',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf26',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf27',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf28',
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf29',
  ].slice(0, N).map(web3.eth.accounts.privateKeyToAccount.bind(web3.eth.accounts));

  const priceData = await deploy('OpenOraclePriceData', []);
  const delfi = await deploy('DelFiPrice', [priceData._address, sources.map(a => a.address)]);
  const now = Math.floor((+new Date) / 1000);

  async function postPrices(timestamp, priceses, symbols, signers = sources) {
    const messages = [], signatures = [];
    priceses.forEach((prices, i) => {
      const signed = sign(encode('prices', timestamp, prices.map(([symbol, price]) => [symbol, price])), signers[i].privateKey);
      for (let {message, signature, signatory} of signed) {
        expect(signatory).toEqual(signers[i].address);
        messages.push(message);
        signatures.push(signature);
      }
    });
    return send(delfi.methods.postPrices(messages, signatures, symbols), {gas: 6000000});
  }

  async function getPrice(symbol) {
    return call(delfi.methods.prices(symbol))
  }

  return {sources, nonSources, priceData, delfi, now, postPrices, getPrice};
}

describe('DelFiPrice', () => {
  it('sanity checks the delfi price view', async () => {
    const {nonSources, delfi, now, postPrices, getPrice} = await setup(5);

    // Reads a price of an asset that doesn't exist yet
    expect(await call(delfi.methods.prices('ETH'))).numEquals(0);

    /** Posts nothing **/

    const post0 = await postPrices(now, [], [])
    expect(post0.gasUsed).toBeLessThan(25000);
    expect(await getPrice('ETH')).numEquals(0);


    /** Posts a price for 1 symbol from 1 source, stores median **/

    const post1 = await postPrices(now, [
      [['ETH', 257]]
    ], ['ETH']);
    expect(post1.gasUsed).toBeLessThan(106000);
    expect(post1.events.Price.returnValues.symbol).toBe('ETH');
    expect(post1.events.Price.returnValues.price).numEquals(0);
    expect(await getPrice('ETH')).numEquals(0);


    /** Posts a price for 2 symbols from 2 sources, stores median **/

    const post2 = await postPrices(now + 1, [
      [
        ['BTC', 9000],
        ['ETH', 257]
      ],
      [
        ['BTC', 8000],
        ['ETH', 255]
      ]
    ], ['BTC', 'ETH']);
    expect(post2.gasUsed).toBeLessThan(265000);
    expect(await getPrice('BTC')).numEquals(0); // not added to list of symbols to update
    expect(await getPrice('ETH')).numEquals(0);


    /** Posts a price for 2 symbols from 3 sources, stores median **/

    const post3a = await postPrices(now + 2, [
      [
        ['BTC', 9000],
        ['ETH', 257]
      ],
      [
        ['BTC', 8500],
        ['ETH', 256]
      ],
      [
        ['BTC', 8000],
        ['ETH', 255]
      ]
    ], ['BTC', 'ETH']);
    expect(post3a.gasUsed).toBeLessThan(341000);
    expect(post3a.events.Price[0].returnValues.symbol).toBe('BTC');
    expect(post3a.events.Price[0].returnValues.price).numEquals(8000e6);
    expect(post3a.events.Price[1].returnValues.symbol).toBe('ETH');
    expect(post3a.events.Price[1].returnValues.price).numEquals(255e6);
    expect(await getPrice('BTC')).numEquals(8000e6);
    expect(await getPrice('ETH')).numEquals(255e6);


    /** Posts again with fresher timestamp, gas should still be cheaper **/

    const post3b = await postPrices(now + 3, [
      [
        ['BTC', 9000],
        ['ETH', 257]
      ],
      [
        ['BTC', 8500],
        ['ETH', 256]
      ],
      [
        ['BTC', 8000],
        ['ETH', 255]
      ]
    ], ['BTC', 'ETH']);
    expect(post3b.gasUsed).toBeLessThan(281000);
    expect(await getPrice('BTC')).numEquals(8000e6);
    expect(await getPrice('ETH')).numEquals(255e6);


    /** Posts a price from non-sources, median does not change **/

    const postNon3 = await postPrices(now + 3, [
      [
        ['BTC', 19000],
        ['ETH', 1257]
      ],
      [
        ['BTC', 18500],
        ['ETH', 1256]
      ],
      [
        ['BTC', 18000],
        ['ETH', 1255]
      ]
    ], ['BTC', 'ETH'], nonSources);

    expect(await getPrice('BTC')).numEquals(8000e6);
    expect(await getPrice('ETH')).numEquals(255e6);

    /** Does revert on invalid message **/

    await expect(send(delfi.methods.postPrices(['0xabc'], ['0x123'], []), {gas: 5000000})).rejects.toRevert();
  }, 30000);

  it.skip('quantifies the amount of gas used for a substantial set of updates', async () => {
    const {delfi, now, postPrices, getPrice} = await setup(10);

    const big = [
      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.33],
        ['BTC', 9000],
        ['DAI', 1],
        ['ETH', 257],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.33],
        ['BTC', 9000],
        ['DAI', 1],
        ['ETH', 257],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.34],
        ['BTC', 8500],
        ['DAI', 1],
        ['ETH', 256],
        ['REP', 0.34],
        ['ZRX', 0.34],
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.35],
        ['BTC', 8000],
        ['DAI', 1],
        ['ETH', 255],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.35],
        ['BTC', 8000],
        ['DAI', 1],
        ['ETH', 255],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.35],
        ['BTC', 8000],
        ['DAI', 1],
        ['ETH', 255],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.33],
        ['BTC', 9000],
        ['DAI', 1],
        ['ETH', 257],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.33],
        ['BTC', 9000],
        ['DAI', 1],
        ['ETH', 257],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.33],
        ['BTC', 9000],
        ['DAI', 1],
        ['ETH', 257],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ],

      [
        ['ABC', 0.35],
        ['DEF', 8000],
        ['GHI', 0.35],
        ['JKL', 8000],
        ['BAT', 0.33],
        ['BTC', 9000],
        ['DAI', 1],
        ['ETH', 257],
        ['REP', 0.34],
        ['ZRX', 0.34]
      ]
    ];

    const postA = await postPrices(now, big, big[0].map(([k]) => k));
    expect(postA.gasUsed).toBeLessThan(5.4e6);

    const postB = await postPrices(now + 1, big, big[0].map(([k]) => k));
    expect(postB.gasUsed).toBeLessThan(3.7e6);

    const postC = await postPrices(now + 1, big, big[0].map(([k]) => k));
    expect(postC.gasUsed).toBeLessThan(2.8e6);

  }, 120000);
});
