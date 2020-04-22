const { encode, sign } = require('../sdk/javascript/.tsbuilt/reporter');
const { time, numToBigNum, numToHex, address } = require('./Helpers');

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
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf24'
  ]
    .slice(0, N)
    .map(web3.eth.accounts.privateKeyToAccount.bind(web3.eth.accounts));

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
    '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf29'
  ]
    .slice(0, N)
    .map(web3.eth.accounts.privateKeyToAccount.bind(web3.eth.accounts));

  // CToken contracts addresses
  const ctokens = {
    cEthAddress: address(1),
    cUsdcAddress: address(2),
    cDaiAddress: address(3),
    cRepAddress: address(4),
    cWbtcAddress: address(5),
    cBatAddress: address(6),
    cZrxAddress: address(7),
    cSaiAddress: address(8), 
    cUsdtAddress: address(9)
  }

  const anchorMantissa = numToHex(1e17); //1e17 equates to 10% tolerance for median to be above or below anchor
  const priceData = await deploy('OpenOraclePriceData', []);
  const proxyPriceOracle = await deploy('ProxyPriceOracle');
  const anchor = proxyPriceOracle._address;
  const delfi = await deploy('DelFiPrice', [
    priceData._address,
    sources.map(a => a.address),
    anchor,
    anchorMantissa, 
    {cEthAddress: ctokens.cEthAddress,
     cUsdcAddress: ctokens.cUsdcAddress,
     cDaiAddress: ctokens.cDaiAddress,
     cRepAddress: ctokens.cRepAddress,
     cWbtcAddress: ctokens.cWbtcAddress,
     cBatAddress: ctokens.cBatAddress,
     cZrxAddress: ctokens.cZrxAddress, 
     cSaiAddress: ctokens.cSaiAddress, 
     cUsdtAddress: ctokens.cUsdtAddress}
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
    proxyPriceOracle,
    ctokens,
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
    proxyPriceOracle,
    ctokens,
    postPrices,
    getPrice;

  const timestamp = time() - 5;

  describe('Deploy with an even # of sources', () => {
    beforeEach(async done => {
      // use 4 sources
      ({
        sources,
        nonSources,
        anchor,
        anchorMantissa,
        priceData,
        delfi,
        proxyPriceOracle,
        ctokens,
        postPrices,
        getPrice
      } = await setup(4));
      done();
    });

    it('should sort even number of sources correctly', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 498e6], {
        gas: 43000
      });
      // post prices for the anchor and 3 / 4 sources
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 501]], [['ETH', 502]], [['ETH', 503]]],
        ['ETH'],
        sources
      );

      expect(post1.gasUsed).toBeLessThan(250000);
      expect(post1.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      // last unused source is saved as 0
      expect(post1.events.PriceUpdated.returnValues.price).numEquals(501.5e6);
      expect(await getPrice('ETH')).numEquals(501.5e6);
    });

    it('should sort even number of sources correctly with two assets', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 498e6], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cWbtcAddress, 9900e6], {
        gas: 43000
      });
      // post prices for the anchor and 4 / 4 sources
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 501], ['BTC', 9000]]
        ],
        ['ETH', 'BTC'],
        sources
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
        proxyPriceOracle,
        ctokens,
        postPrices,
        getPrice
      } = await setup(5));
      done();
    });

    it('posting single source should not record a median', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 100e6], {
        gas: 43000
      });
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 100]]],
        ['ETH'],
        sources
      );
      expect(post1.gasUsed).toBeLessThan(152000);
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('posting 0 anchor price should guard price and not revert', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 0], {
        gas: 43000
      });
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 91]], [['ETH', 110]], [['ETH', 110]]],
        ['ETH'],
        sources
      );
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(post1.events.PricePosted).toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('posting some sources should yield correct median', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 100e6], {
        gas: 43000
      });
      // post prices for 3 / 5 sources, and the anchor
      const post1 = await postPrices(
        timestamp,
        [[['ETH', 91]], [['ETH', 110]], [['ETH', 110]]],
        ['ETH'],
        sources
      );
      expect(post1.gasUsed).toBeLessThan(253000);
      expect(post1.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(post1.events.PriceUpdated.returnValues.price).numEquals(91e6);
      expect(await getPrice('ETH')).numEquals(91e6);

      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 200e6], {
        gas: 43000
      });
      const post2 = await postPrices(
        timestamp + 1,
        [[['ETH', 218]], [['ETH', 220]], [['ETH', 230]]],
        ['ETH'],
        sources
      );
      expect(post2.gasUsed).toBeLessThan(252000);
      expect(post2.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(post2.events.PriceUpdated.returnValues.price).numEquals(218e6);
      expect(await getPrice('ETH')).numEquals(218e6);
    });

    it('should not update median if anchor is much higher', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 100e6], {
        gas: 43000
      });
      // median is 89. anchor is 100. at 10% tolerance, this should not update median
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 80]],
          [['ETH', 85]],
          [['ETH', 89]],
          [['ETH', 100]],
          [['ETH', 110]]
        ],
        ['ETH'],
        sources
      );
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('should not update median if anchor is much lower', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 100e6], {
        gas: 43000
      });
      // median is 111. anchor is 100. at 10% tolerance, this should not update median
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 100]],
          [['ETH', 110]],
          [['ETH', 111]],
          [['ETH', 115]],
          [['ETH', 116]]
        ],
        ['ETH'],
        sources
      );
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await getPrice('ETH')).numEquals(0);
    });

    it('posting all sources for two assets should sort correctly and yield correct median', async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 498e6], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cWbtcAddress, 9900e6], {
        gas: 43000
      });
      // post prices for the anchor and 4 / 4 sources
      const post1 = await postPrices(
        timestamp,
        [
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 501], ['BTC', 9000]],
          [['ETH', 502], ['BTC', 10200]]
        ],
        ['ETH', 'BTC'],
        sources
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
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 498e6], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cWbtcAddress, 9900e6], {
        gas: 43000
      });
      // post prices for 5 / 5 sources, and the anchor
      await postPrices(
        timestamp,
        [
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 501], ['BTC', 9000]],
          [['ETH', 502], ['BTC', 10200]]
        ],
        ['ETH', 'BTC'],
        sources
      );

      // anchor: 498, sources: [1, 499, 501, 502, 510], median = 501
      // anchor: 9900, sources: [100, 9000, 10200, 11000, 20000], median = 10000
      const post2 = await postPrices(
        timestamp + 1,
        [
          [['ETH', 510], ['BTC', 11000]],
          [['ETH', 499], ['BTC', 20000]],
          [['ETH', 1], ['BTC', 100]],
          [['ETH', 503], ['BTC', 9000]],
          [['ETH', 502], ['BTC', 10500]]
        ],
        ['ETH', 'BTC'],
        sources
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
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, 1], {
        gas: 43000
      });
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, 100e6], {
        gas: 43000
      });
      // set some baseline numbers
      await postPrices(
        timestamp,
        [
          [['ETH', 100]],
          [['ETH', 100]],
          [['ETH', 100]],
          [['ETH', 100]],
          [['ETH', 100]]
        ],
        ['ETH'],
        sources
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

  describe("getAnchorPrice", () => {
    beforeEach(async () => {
      ({
        sources,
        priceData,
        delfi,
        proxyPriceOracle,
        ctokens,
        postPrices
      } = await setup(1));
    });

    it("returns one with 6 decimals when given usd or usdt", async () => {

      let usdcPrice = "5812601720530109000000000000";
      const converted_usdc_price = await call(delfi,'getAnchorPrice',["USDC", usdcPrice]);
      expect(converted_usdc_price).toEqual(1e6.toString());

      const converted_usdt_price = await call(delfi,'getAnchorPrice',["USDT", usdcPrice]);
      expect(converted_usdt_price).toEqual(1e6.toString());

    });

    it("converts eth price through proxy usdc, with 6 decimals", async () => {
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, numToHex(1e18)]);
      // ~ $172 eth
      let usdcPrice = "5812601720530109000000000000";
      const converted_eth_price = await call(delfi,'getAnchorPrice',["ETH", usdcPrice]);
      expect(converted_eth_price).toEqual(172.04e6.toString());
    });

    // [open oracle symbol, proxy price in ether, open oracle price in usd]
    [
      ["ETH", 1e18, 172.04e6],
      ["SAI", 5905879257418508, 1.016047e6],
      ["DAI", 5905879257418508, 1.016047e6],

      ["BAT", 931592500000000, 0.160271e6],
      ["REP", 56128970000000000, 9.656427e6],
      ["ZRX", 985525000000000, 0.169549e6],
      ["BTC", "399920015996800660000000000000", 6880.223955e6] // 8 decimals underlying -> 10 extra decimals on proxy 
    ].forEach( ([openOracleKey, proxyPrice, expectedOpenOraclePrice ]) => {
      it(`converts  ${openOracleKey} price through proxy usdc, with 6 decimals`, async () => {
        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        await send(proxyPriceOracle, 'setUnderlyingPrice', [tokenAddress, numToHex(proxyPrice)]);
        // ~ $172 eth
        let usdcPrice = "5812601720530109000000000000";
        const converted_price = await call(delfi,'getAnchorPrice',[openOracleKey, usdcPrice]);
        expect(converted_price).toEqual(expectedOpenOraclePrice.toString());
      });
    });

  });

  describe("getUnderlyingPrice", () => {
    beforeEach(async () => {
      ({
        sources,
        priceData,
        delfi,
        proxyPriceOracle,
        ctokens,
        postPrices
      } = await setup(1));

      // set usdc price so anchoring can use it
      let usdcPrice = "5812601720530109000000000000";
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cUsdcAddress, numToHex(usdcPrice)]);
    });


    ["USDC", "USDT"].forEach( (openOracleKey) => {
      it(`returns 1 with 18 + 12 decimals for ${openOracleKey}`, async () => {
        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        const underlying_price = await call(delfi,'getUnderlyingPrice',[tokenAddress]);

        expect(underlying_price).toEqual("1000000000000000000000000000000");
      });
    });

    it("returns proxy price with 18 decimals for SAI, converted through Open Oracle Eth price", async () => {
      // ["SAI", 5905879257418508, 1.016047],
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cSaiAddress, numToHex(5905879257418508)]);
      await send(proxyPriceOracle, 'setUnderlyingPrice', [ctokens.cEthAddress, numToHex(1e18)]);
      // TODO: set sai price and usdc price for conversion

      const post1 = await postPrices(
        time() - 5,
        [[['ETH', 172.04]]],
        ['ETH'],
        sources
      );

      const underlying_price = await call(delfi,'getUnderlyingPrice',[ctokens.cSaiAddress]);

      expect(underlying_price).toEqual("1016047000000000000");
    });

    it("returns source price with 18 + 10 decimals for BTC", async () =>{
      let tokenAddress = await call(delfi, 'getCTokenAddress', ["BTC"]);
      await send(proxyPriceOracle, 'setUnderlyingPrice', [tokenAddress, numToHex("399920015996800660000000000000")]);
      const post1 = await postPrices(
        time() - 5,
        [[["BTC", 6880.223955]]],
        ["BTC"],
        sources
      );

      const underlying_price = await call(delfi,'getUnderlyingPrice',[tokenAddress]);

      const actualOpenOraclePrice = await call(delfi, 'prices', [ "BTC" ]);

      expect(underlying_price).toEqual( numToBigNum(actualOpenOraclePrice).mul(numToBigNum("10000000000000000000000")).toString(10));
    });

    [
      ["ETH", 1e18, 172.04],
      ["DAI", 5905879257418508, 1.016047],

      ["BAT", 931592500000000, 0.160271],
      ["REP", 56128970000000000, 9.656427],
      ["ZRX", 985525000000000, 0.169549],
    ].forEach( ([openOracleKey, anchorPrice, openOraclePrice]) => {
      it(`returns source price with 18 decimals for ${openOracleKey}`, async () => {
        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        await send(proxyPriceOracle, 'setUnderlyingPrice', [tokenAddress, numToHex(anchorPrice)]);
        const post1 = await postPrices(
          time() - 5,
          [[[openOracleKey, openOraclePrice]]],
          [openOracleKey],
          sources
        );

        const underlying_price = await call(delfi,'getUnderlyingPrice',[tokenAddress]);

        const actualOpenOraclePrice = await call(delfi, 'prices', [ openOracleKey ]);

        expect(underlying_price).toEqual( numToBigNum(actualOpenOraclePrice).mul(numToBigNum("1000000000000")).toString(10));
      });
    });
  });
});
