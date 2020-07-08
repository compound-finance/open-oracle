const { encode, sign } = require('../sdk/javascript/.tsbuilt/reporter');
const { uint, keccak256, time, numToHex, address, sendRPC, currentBlockTimestamp } = require('./Helpers');
const BigNumber = require('bignumber.js');

async function setup(opts)  {
  ({isMockedView} = opts);
  const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  const anchorMantissa = numToHex(1e17);
  const priceData = await deploy('OpenOraclePriceData', []);
  const anchorPeriod = 60;

  const FIXED_ETH_AMOUNT = 0.005e18;

  const mockPair = await deploy("MockUniswapTokenPair", [
    "157323115357569242624896",
    "10627310410144389510631",
    "1592425041",
    "819360504021542874838907395123146706291",
    "221435982014902761159721791828816348231935",
  ]);

  const priceSource = {FIXED_ETH: 0, FIXED_USD: 1, REPORTER: 2};
  const cToken = {ETH: address(1), DAI: address(2), REP: address(3), USDT: address(4), SAI: address(5), WBTC: address(6)};
  const dummyAddress = address(0);
  const tokenConfigs = [
    {cToken: cToken.ETH, underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: true},
    {cToken: cToken.DAI, underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: uint(1e18), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
    {cToken: cToken.REP, underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
    {cToken: cToken.USDT, underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e6), priceSource: priceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: address(0), isUniswapReversed: false},
    {cToken: cToken.SAI, underlying: dummyAddress, symbolHash: keccak256('SAI'), baseUnit: uint(1e18), priceSource: priceSource.FIXED_ETH, fixedPrice: uint(FIXED_ETH_AMOUNT), uniswapMarket: address(0), isUniswapReversed: false},
    {cToken: cToken.WBTC, underlying: dummyAddress, symbolHash: keccak256('WBTC'), baseUnit: uint(1e8), priceSource: priceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
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
  return {reporter, anchorMantissa, priceData, anchorPeriod, uniswapAnchoredView, tokenConfigs, postPrices, cToken, mockPair};
}

describe('UniswapAnchoredView', () => {
  let cToken, reporter, anchorMantissa, priceData, anchorPeriod, uniswapAnchoredView, tokenConfigs, postPrices, mockPair;

  describe('postPrices Unit Test', () => {
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

    it('should update view if ETH price is within anchor bounds', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 91e6]);
      const tx = await postPrices(timestamp, [[['ETH', 91]]], ['ETH']);

      expect(tx.events.PriceGuarded).toBe(undefined);
      expect(tx.events.PriceUpdated).not.toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(91e6);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(91e6);
    });

    it('should not update view if ETH price is below anchor bounds', async () => {
      // anchorMantissa is 1e17, so 10% tolerance
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 89.9e6]);
      const tx = await postPrices(timestamp, [[['ETH', 100]]], ['ETH']);

      expect(tx.events.PriceGuarded).not.toBe(undefined);
      expect(tx.events.PriceUpdated).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(100e6);
    });

    it('should not update view if ETH price is above anchor bounds', async () => {
      // anchorMantissa is 1e17, so 10% tolerance
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 110.1e6]);
      const tx = await postPrices(timestamp, [[['ETH', 100]]], ['ETH']);

      expect(tx.events.PriceGuarded).not.toBe(undefined);
      expect(tx.events.PriceUpdated).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(100e6);
    });

    it.todo('test anchor with non-eth prices')

    it.todo('should invalidate reporter');

  });

  describe('getUnderlyingPrice', () => {
    // everything must return 1e36 - underlying units

    beforeEach(async done => {
      ({cToken, uniswapAnchoredView, postPrices} = await setup({isMockedView: true}));
      done();
    })

    it('should work correctly for USDT fixed USD price source', async () => {
      // 1 * (1e(36 - 6)) = 1e30
      let expected = new BigNumber('1e30');
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.USDT])).numEquals(expected.toFixed());
    });

    it('should return fixed ETH amount if SAI', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
      const tx = await postPrices(timestamp, [[['ETH', 200]]], ['ETH']);
      // priceInternal:      returns 200e6 * 0.005e18 / 1e18 = 1e6
      // getUnderlyingPrice:         1e30 * 1e6 / 1e18 = 1e18
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.SAI])).numEquals(1e18);
    });

    it('should return reported ETH price', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
      const tx = await postPrices(timestamp, [[['ETH', 200]]], ['ETH']);
      // priceInternal:      returns 200e6
      // getUnderlyingPrice: 1e30 * 200e6 / 1e18 = 200e18
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.ETH])).numEquals(200e18);
    });

    it('should return reported WBTC price', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
      await send(uniswapAnchoredView, 'setAnchorPrice', ['WBTC', 10000e6]);

      const tx = await postPrices(timestamp, [[['ETH', 200], ['WBTC', 10000]]], ['ETH', 'WBTC']);
      const wbtcPrice  = await call(uniswapAnchoredView, 'prices', [keccak256('WBTC')]);

      expect(wbtcPrice).numEquals(10000e6);
      // priceInternal:      returns 10000e6
      // getUnderlyingPrice: 1e30 * 10000e6 / 1e8 = 1e32
      let expected = new BigNumber('1e32');
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.WBTC])).numEquals(expected.toFixed());
    });

  });

  describe('pokeWindowValues', () => {
    beforeEach(async done => {
      ({mockPair, anchorPeriod, uniswapAnchoredView, postPrices, tokenConfigs} = await setup({isMockedView: false}));
      // random new vals
      await send(mockPair, 'update', ["157323115357569242629000" , "10627310410144389510900", "1592429000", "819360504021542874838907395123146709000", "221435982014902761159721791828816348239900"]);
      done();
    });

    it('should not update window values if not enough time elapsed', async () => {
      const timestamp = Number(await currentBlockTimestamp(web3)) + anchorPeriod - 3;
      await sendRPC(web3, 'evm_increaseTime', [anchorPeriod - 5]);
      const tx = await postPrices(timestamp, [[['ETH', 200]]], ['ETH']);
      expect(tx.events.UniswapWindowUpdate).toBe(undefined);
    });

    it('should update window values if enough time elapsed', async () => {
      let timestamp;
      const mkt = mockPair._address;// ETH's mock market
      const newObs1 = await call(uniswapAnchoredView, 'newObservations', [mkt]);
      const oldObs1 = await call(uniswapAnchoredView, 'oldObservations', [mkt]);

      timestamp = Number(await currentBlockTimestamp(web3)) + anchorPeriod;
      await sendRPC(web3, 'evm_increaseTime', [anchorPeriod]);

      const tx1 = await postPrices(timestamp, [[['ETH', 200]]], ['ETH']);
      expect(tx1.events.UniswapWindowUpdate).not.toBe(undefined);

      // on the first update, we expect on the new observation to change
      const newObs2 = await call(uniswapAnchoredView, 'newObservations', [mkt]);
      const oldObs2 = await call(uniswapAnchoredView, 'oldObservations', [mkt]);
      expect(newObs2.acc).not.numEquals(newObs1.acc);
      expect(newObs2.timestamp).not.numEquals(newObs1.timestamp);
      expect(oldObs2.acc).numEquals(oldObs1.acc);
      expect(oldObs2.timestamp).numEquals(oldObs1.timestamp);

      // random new vals
      await send(mockPair, 'update', ["157323115357569242629001" , "10627310410144389510901", "1592429001", "819360504021542874838907395123146709001", "221435982014902761159721791828816348239901"]);
      timestamp = Number(await currentBlockTimestamp(web3)) + anchorPeriod;
      await sendRPC(web3, 'evm_mine', [timestamp]);
      const tx2 = await postPrices(timestamp, [[['ETH', 201]]], ['ETH']);
      expect(tx2.events.UniswapWindowUpdate).not.toBe(undefined);

      // this time, both should change
      const newObs3 = await call(uniswapAnchoredView, 'newObservations', [mkt]);
      const oldObs3 = await call(uniswapAnchoredView, 'oldObservations', [mkt]);
      expect(newObs3.acc).not.numEquals(newObs2.acc);
      expect(newObs3.acc).not.numEquals(newObs2.timestamp);
      //old becomes last new
      expect(oldObs3.acc).numEquals(newObs2.acc);
      expect(oldObs3.timestamp).numEquals(newObs2.timestamp);
    });
  })
});
