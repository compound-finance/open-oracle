const { encode, sign } = require('../sdk/javascript/.tsbuilt/reporter');
const { uint, keccak256, time, numToHex, address } = require('./Helpers');

async function setupTokenPairs() {
  const usdc_eth_pair = await deploy("MockUniswapTokenPair", [
    "813725491531",
    "3528370026596436015330",
    "1592425065",
    "89787367080567803087602061047487264867725350639236",
    "4227331029917950029016325075489",
  ]);

  // Initialize DAI_ETH pair with values from mainnet
  const dai_eth_pair = await deploy("MockUniswapTokenPair", [
    "3819295813913808439597752",
    "16827762284444122963188",
    "1592424969",
    "70542767013453060453249113968571452619",
    "3489726182379184118152186925401931467229632",
  ]);

  // Initialize REP_ETH pair with values from mainnet
  const rep_eth_pair = await deploy("MockUniswapTokenPair", [
    "157323115357569242624896",
    "10627310410144389510631",
    "1592425041",
    "819360504021542874838907395123146706291",
    "221435982014902761159721791828816348231935",
  ]);

  return {
    USDC_ETH: usdc_eth_pair._address,
    DAI_ETH: dai_eth_pair._address,
    REP_ETH: rep_eth_pair._address,
  }
}


async function setup(opts)  {
  ({isMockedView} = opts);
  const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  const anchorMantissa = numToHex(1e17);
  const priceData = await deploy('OpenOraclePriceData', []);
  const anchorPeriod = 60;


  const pairs = await setupTokenPairs();
  const priceSource = {FIXED_ETH: 0, FIXED_USD: 1, REPORTER: 2};
  const cToken = {ETH: address(1), DAI: address(2), REP: address(3), USDT: address(4), SAI: address(5)};
  const tokenConfigs = [
    {cToken: cToken.ETH, underlying: address(1), symbolHash: keccak256('ETH'), baseUnit: uint(1e6), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.USDC_ETH, isUniswapReversed: true},
    {cToken: cToken.DAI, underlying: address(2), symbolHash: keccak256('DAI'), baseUnit: uint(1e18), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.DAI_ETH, isUniswapReversed: false},
    {cToken: cToken.REP, underlying: address(3), symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.REP_ETH, isUniswapReversed: false},
    // NOTE CHANGE MARKET PAIR
    {cToken: cToken.USDT, underlying: address(4), symbolHash: keccak256('USDT'), baseUnit: uint(1e18), priceSource: priceSource.FIXED_USD, fixedPrice: uint(1e18), uniswapMarket: pairs.REP_ETH, isUniswapReversed: false},
    {cToken: cToken.SAI, underlying: address(5), symbolHash: keccak256('SAI'), baseUnit: uint(1e18), priceSource: priceSource.FIXED_ETH, fixedPrice: uint(0.05e18), uniswapMarket: pairs.REP_ETH, isUniswapReversed: false},
  ];

  let uniswapAnchoredView;
  if (isMockedView) {
    uniswapAnchoredView = await deploy('MockUniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, anchorPeriod, tokenConfigs]);
  } else {
    uniswapAnchoredView = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, anchorPeriod, tokenConfigs]);
  }

  async function postPrices(timestamp, prices2dArr, symbols, signer = reporter) {
      const messages = [],
            signatures = [];

      prices2dArr.forEach((prices, i) => {
        const signed = sign(
          encode(
            'prices',
            timestamp,
            prices
          ),
          signer.privateKey
        );
        for (let { message, signature } of signed) {
          messages.push(message);
          signatures.push(signature);
        }
      });
      return send(uniswapAnchoredView, 'postPrices', [messages, signatures, symbols]);
  }
  return {reporter, anchorMantissa, priceData, anchorPeriod, pairs, uniswapAnchoredView, tokenConfigs, postPrices, cToken};
}


describe('UniswapAnchoredView', () => {
  let cToken, reporter, anchorMantissa, priceData, anchorPeriod, pairs, uniswapAnchoredView, tokenConfigs, postPrices;

  describe('Post Prices Unit Test', () => {
    beforeEach(async done => {
      ({reporter, anchorMantissa, priceData, uniswapAnchoredView, postPrices} = await setup({isMockedView: true}));
      done();
    })

    it('should not update view if sender is not reporter', async () => {
      const timestamp = time() - 5;
      const nonSource = web3.eth.accounts.privateKeyToAccount('0x666ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      const tx = await postPrices(timestamp, [[['ETH', 91]]], ['ETH'], nonSource);
      expect(tx.events.PriceGuarded).toBe(undefined);
      expect(tx.events.PricePosted).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
    });

    it('should update view if price is within anchor bounds', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 91e6]);
      const tx = await postPrices(timestamp, [[['ETH', 91]]], ['ETH']);

      expect(tx.events.PriceGuarded).toBe(undefined);
      expect(tx.events.PriceUpdated).not.toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(91e6);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(91e6);
    });

    it('should not update view if price is below anchor bounds', async () => {
      // anchorMantissa is 1e17, so 10% tolerance
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 89.9e6]);
      const tx = await postPrices(timestamp, [[['ETH', 100]]], ['ETH']);

      expect(tx.events.PriceGuarded).not.toBe(undefined);
      expect(tx.events.PriceUpdated).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(100e6);
    });

    it('should not update view if price is above anchor bounds', async () => {
      // anchorMantissa is 1e17, so 10% tolerance
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 110.1e6]);
      const tx = await postPrices(timestamp, [[['ETH', 100]]], ['ETH']);

      expect(tx.events.PriceGuarded).not.toBe(undefined);
      expect(tx.events.PriceUpdated).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(100e6);
    });

    it.todo('should invalidate reporter');

  });

  describe('getUnderlyingPrice', () => {
    beforeEach(async done => {
      ({cToken, uniswapAnchoredView, postPrices} = await setup({isMockedView: true}));
      done();
    })

    it('should work w/ fixed USD', async () => {
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.USDT])).numEquals(1e18);
    });
  });

  })
