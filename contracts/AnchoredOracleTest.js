const { encode, sign } = require('../sdk/javascript/.tsbuilt/reporter');
const { address, time, numToHex } = require('./Helpers');

async function setup(N) {
  const sources = [
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10',
  ]
    .slice(0, N)
    .map(web3.eth.accounts.privateKeyToAccount.bind(web3.eth.accounts));

  const nonSources = [
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf15',
  const anchor = web3.eth.accounts.privateKeyToAccount.bind(web3.eth.accounts)(
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf40'
  );

  const anchorMantissa = numToHex(1e17); //1e17 equates to 10% tolerance for median to be above or below anchor
  const priceData = await deploy('OpenOraclePriceData', []);

  const tokenConfig = {
    cEthAddress: address(42),
    cUsdcAddress: address(43),
    cDaiAddress: address(44),
    cRepAddress: address(45),
    cWbtcAddress: address(46),
    cBatAddress: address(47),
    cZrxAddress: address(48),
    cSaiAddress: address(49),
    cUsdtAddress: address(49)
  }
  const delfi = await deploy('DelFiPrice', [
    priceData._address,
    sources[0].address,
    anchor.address,
    anchorMantissa,
    tokenConfig
  ]);

  async function postPrices(timestamp, prices2dArr, symbols, signers) {
    const messages = [],
      signatures = [];
    prices2dArr.forEach((prices, i) => {
      const signed = sign(
        encode(
          'prices',
          timestamp,
          prices.map(([symbol, price]) => [symbol, price])
        ),
        signers[i].privateKey
      );
      for (let { message, signature } of signed) {
        messages.push(message);
        signatures.push(signature);
      }
    });
    return send(delfi, 'postPrices', [messages, signatures, symbols], {
      gas: 6000000
    });
  }

  async function getPrice(symbol) {
    return call(delfi, 'prices', [symbol]);
  }

  return {
    sources,
    nonSources,
    anchor,
    anchorMantissa,
    priceData,
    delfi,
    postPrices,
    getPrice
  };
}

describe('DelFiPrice', () => {
  let sources,
    nonSources,
    anchor,
    anchorMantissa,
    priceData,
    delfi,
    postPrices,
    getPrice;

  const timestamp = time() - 5;

  describe.only('Deploy with an even # of sources', () => {
    beforeEach(async done => {
      // use 4 sources
      ({
        sources,
        nonSources,
        anchor,
        anchorMantissa,
        priceData,
        delfi,
        postPrices,
        getPrice
      } = await setup(4));
      done();
    });

    it.only('should sort even number of sources correctly', async () => {
      // post prices for the anchor and 3 / 4 sources
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 498]], [['ETH', 501]], [['ETH', 502]], [['ETH', 503]]],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post1.gasUsed).toBeLessThan(250000);
      expect(post1.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      // last unused source is saved as 0
      expect(post1.events.PriceUpdated.returnValues.price).numEquals(501.5e6);
      expect(await getPrice('ETH')).numEquals(501.5e6);
    });

    it('should sort even number of sources correctly with two assets', async () => {
      // post prices for the anchor and 4 / 4 sources
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 498], ['BTC', 9900]],
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 501], ['BTC', 9000]]
        ],
        ['ETH', 'BTC'],
        [anchor, ...sources]
      );
      expect(post1.gasUsed).toBeLessThan(550000);

      expect(post1.events.PriceUpdated[0].returnValues.symbol).toBe('ETH');
      // anchor: 498, sources: [1, 499, 501, 510], median = 500
      expect(post1.events.PriceUpdated[0].returnValues.price).numEquals(500e6);
      expect(await getPrice('ETH')).numEquals(500e6);

      expect(post1.events.PriceUpdated[1].returnValues.symbol).toBe('BTC');
      // anchor: 9900, sources: [100, 9000, 11000, 20000], median = 10000
      expect(post1.events.PriceUpdated[1].returnValues.price).numEquals(10000e6);
      expect(await getPrice('BTC')).numEquals(10000e6);
    });
  });

  describe('Deploy with an odd # of sources', () => {
    beforeEach(async done => {
      // use 5 sources
      ({
        sources,
        nonSources,
        anchor,
        anchorMantissa,
        priceData,
        delfi,
        postPrices,
        getPrice
      } = await setup(5));
      done();
    });

    it('posting single source should not record a median', async () => {
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 100]], [['ETH', 100]]],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post1.gasUsed).toBeLessThan(152000);
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('posting 0 anchor price should guard price and not revert', async () => {
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 0]], [['ETH', 91]], [['ETH', 110]], [['ETH', 110]]],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(post1.events.PricePosted).toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('posting some sources should yield correct median', async () => {
      // post prices for 3 / 5 sources, and the anchor
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 100]], [['ETH', 91]], [['ETH', 110]], [['ETH', 110]]],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post1.gasUsed).toBeLessThan(253000);
      expect(post1.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(post1.events.PriceUpdated.returnValues.price).numEquals(91e6);
      expect(await getPrice('ETH')).numEquals(91e6);

      const post2 = await postPrices(
        timestamp + 1,
        [[['ETH', 200]], [['ETH', 218]], [['ETH', 220]], [['ETH', 230]]],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post2.gasUsed).toBeLessThan(252000);
      expect(post2.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(post2.events.PriceUpdated.returnValues.price).numEquals(218e6);
      expect(await getPrice('ETH')).numEquals(218e6);
    });

    it('should not update median if anchor is much higher', async () => {
      // median is 89. anchor is 100. at 10% tolerance, this should not update median
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 100]], //anchor
          [['ETH', 80]],
          [['ETH', 85]],
          [['ETH', 89]],
          [['ETH', 100]],
          [['ETH', 110]]
        ],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('should not update median if anchor is much lower', async () => {
      // median is 111. anchor is 100. at 10% tolerance, this should not update median
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 100]], //anchor
          [['ETH', 100]],
          [['ETH', 110]],
          [['ETH', 111]],
          [['ETH', 115]],
          [['ETH', 116]]
        ],
        ['ETH'],
        [anchor, ...sources]
      );
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('posting all sources for two assets should sort correctly and yield correct median', async () => {
      // post prices for the anchor and 4 / 4 sources
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 498], ['BTC', 9900]], //anchor
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 501], ['BTC', 9000]],
          [['ETH', 502], ['BTC', 10200]]
        ],
        ['ETH', 'BTC'],
        [anchor, ...sources]
      );
      expect(post1.gasUsed).toBeLessThan(650000);

      expect(post1.events.PriceUpdated[0].returnValues.symbol).toBe('ETH');
      // anchor: 498, sources: [1, 499, 501, 502, 510], median = 501
      expect(post1.events.PriceUpdated[0].returnValues.price).numEquals(501e6);
      expect(await getPrice('ETH')).numEquals(501e6);

      expect(post1.events.PriceUpdated[1].returnValues.symbol).toBe('BTC');
      // anchor: 9900, sources: [100, 9000, 10200, 11000, 20000], median = 10000
      expect(post1.events.PriceUpdated[1].returnValues.price).numEquals(10200e6);
      expect(await getPrice('BTC')).numEquals(10200e6);
    });

    it('view should use most recent post with two sources', async () => {
      // post prices for 5 / 5 sources, and the anchor
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 498], ['BTC', 9900]], //anchor
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 501], ['BTC', 9000]],
          [['ETH', 502], ['BTC', 10200]]
        ],
        ['ETH', 'BTC'],
        [anchor, ...sources]
      );

      // anchor: 498, sources: [1, 499, 501, 502, 510], median = 501
      // anchor: 9900, sources: [100, 9000, 10200, 11000, 20000], median = 10000

      const post2 = await postPrices(
        timestamp + 1,
        [
          [['ETH', 498], ['BTC', 9900]], //anchor
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 503], ['BTC', 9000]],
          [['ETH', 502], ['BTC', 10500]]
        ],
        ['ETH', 'BTC'],
        [anchor, ...sources]
      );

      // anchor: 498, sources: [1, 499, 502, 503, 510], median = 502
      expect(post2.events.PriceUpdated[0].returnValues.price).numEquals(502e6);
      expect(await getPrice('ETH')).numEquals(502e6);

      // anchor: 99, sources: [100, 9000, 10500, 11000, 20000], median = 10500
      expect(post2.events.PriceUpdated[1].returnValues.price).numEquals(10500e6);
      expect(await getPrice('BTC')).numEquals(10500e6);
    });

    it('should revert on posting invalid message', async () => {
      await expect(
        send(delfi, 'postPrices', [['0xabc'], ['0x123'], []], { gas: 5000000 })
      ).rejects.toRevert();
    });

    it('posting from non-source should not change median or emit event', async () => {
      // set some baseline numbers
      await postPrices(
        timestamp,
        [
          [['ETH', 100]], //anchor
          [['ETH', 100]],
          [['ETH', 100]],
          [['ETH', 100]],
          [['ETH', 100]],
          [['ETH', 100]]
        ],
        ['ETH'],
        [anchor, ...sources]
      );

      const post1 = await postPrices(
        timestamp + 1,
        [[['ETH', 95]]],
        ['ETH'],
        [...nonSources]
      );
      expect(post1.events.PriceGuarded).toBe(undefined);
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(await getPrice('ETH')).numEquals(100e6);
    });
  });

  describe.skip('Deploy with many sources', () => {
    beforeEach(async done => {
      ({ delfi, timestamp, postPrices, getPrice } = await setup(10));
      done();
    });

    it('quantifies the amount of gas used for a substantial set of updates', async () => {
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

      const postA = await postPrices(timestamp, big, big[0].map(([k]) => k));
      expect(postA.gasUsed).toBeLessThan(5.4e6);

      const postB = await postPrices(timestamp + 1, big, big[0].map(([k]) => k));
      expect(postB.gasUsed).toBeLessThan(3.7e6);

      const postC = await postPrices(timestamp + 1, big, big[0].map(([k]) => k));
      expect(postC.gasUsed).toBeLessThan(2.8e6);
    }, 120000);
  });

  describe.only('ethToDollar', () => {
    it('converts eth value to a dollar value', async () => {
      const priceData = await deploy('OpenOraclePriceData', []);
      const tokenConfig = {
        cEthAddress: address(42),
        cUsdcAddress: address(43),
        cDaiAddress: address(44),
        cRepAddress: address(45),
        cWbtcAddress: address(46),
        cBatAddress: address(47),
        cZrxAddress: address(48),
        cSaiAddress: address(49),
        cUsdtAddress: address(49)
      }

      const anchorMantissa = numToHex(1e17); //1e17 equates to 10% tolerance for median to be above or below anchor

      const delfi = await deploy('DelFiPrice', [
        priceData._address,
        address(10),
        address(12),
        anchorMantissa,
        tokenConfig
      ]);

    });

  });

});
