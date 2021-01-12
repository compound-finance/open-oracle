const { encode, sign, encodeRotationMessage } = require('../sdk/javascript/.tsbuilt/reporter');
const { uint, keccak256, time, numToHex, address, sendRPC, currentBlockTimestamp, fixed } = require('./Helpers');
const BigNumber = require('bignumber.js');

const PriceSource = {
  FIXED_ETH: 0,
  FIXED_USD: 1,
  REPORTER: 2
};
const reporterPrivateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';
const FIXED_ETH_AMOUNT = 0.005e18;

async function setup({isMockedView, freeze}) {
  const reporter =
    web3.eth.accounts.privateKeyToAccount(reporterPrivateKey);
  const anchorMantissa = numToHex(1e17);
  const priceData = await deploy('OpenOraclePriceData', []);
  const anchorPeriod = 60;
  const timestamp = Math.floor(Date.now() / 1000);

  if (freeze) {
    await sendRPC(web3, 'evm_freezeTime', [timestamp]);
  } else {
    await sendRPC(web3, 'evm_mine', [timestamp]);
  }

  const mockPair = await deploy("MockUniswapTokenPair", [
    fixed(1.8e12),
    fixed(8.2e21),
    fixed(1.6e9),
    fixed(1.19e50),
    fixed(5.8e30),
  ]);

    // Initialize REP pair with values from mainnet
  const mockRepPair = await deploy("MockUniswapTokenPair", [
    fixed(4e22),
    fixed(3e21),
    fixed(1.6e9),
    fixed(1.32e39),
    fixed(3.15e41),
  ]);

  const cToken = {ETH: address(1), DAI: address(2), REP: address(3), USDT: address(4), SAI: address(5), WBTC: address(6)};
  const dummyAddress = address(0);
  const tokenConfigs = [
    {cToken: cToken.ETH, underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: true},
    {cToken: cToken.DAI, underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
    {cToken: cToken.REP, underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockRepPair._address, isUniswapReversed: false},
    {cToken: cToken.USDT, underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e6), priceSource: PriceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: address(0), isUniswapReversed: false},
    {cToken: cToken.SAI, underlying: dummyAddress, symbolHash: keccak256('SAI'), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(FIXED_ETH_AMOUNT), uniswapMarket: address(0), isUniswapReversed: false},
    {cToken: cToken.WBTC, underlying: dummyAddress, symbolHash: keccak256('BTC'), baseUnit: uint(1e8), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
  ];

  let uniswapAnchoredView;
  if (isMockedView) {
    uniswapAnchoredView = await deploy('MockUniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, anchorPeriod, tokenConfigs]);
  } else {
    uniswapAnchoredView = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, anchorPeriod, tokenConfigs]);
  }

  async function postPrices(timestamp, prices2dArr, symbols, signer=reporter) {
    let {
      messages,
      signatures
    } = prices2dArr.reduce(({messages, signatures}, prices, i) => {
      const signedMessages = sign(
        encode(
          'prices',
          timestamp,
          prices
        ),
        signer.privateKey
      );

      return signedMessages.reduce(({messages, signatures}, {message, signature}) => {
        return {
          messages: [...messages, message],
          signatures: [...signatures, signature],
        };
      }, {messages, signatures});
    }, { messages: [], signatures: [] });

    return send(uniswapAnchoredView, 'postPrices', [messages, signatures, symbols]);
  }

  return {
    anchorMantissa,
    anchorPeriod,
    cToken,
    mockPair,
    postPrices,
    priceData,
    reporter,
    timestamp,
    tokenConfigs,
    uniswapAnchoredView,
  };
}

describe('UniswapAnchoredView', () => {
  let cToken;
  let reporter;
  let anchorMantissa;
  let priceData;
  let anchorPeriod;
  let uniswapAnchoredView;
  let tokenConfigs;
  let postPrices;
  let mockPair;
  let timestamp;

  describe('postPrices', () => {
    beforeEach(async () => {
      ({
        anchorMantissa,
        postPrices,
        priceData,
        reporter,
        uniswapAnchoredView,
      } = await setup({isMockedView: true}));
    });

    it('should not update view if sender is not reporter', async () => {
      const timestamp = time() - 5;
      const nonSource = web3.eth.accounts.privateKeyToAccount('0x666ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 91e6]);
      await postPrices(timestamp, [[['ETH', 91]]], ['ETH'], reporter);

      const tx = await postPrices(timestamp, [[['ETH', 95]]], ['ETH'], nonSource);
      expect(tx.events.PriceGuarded).toBe(undefined);
      expect(tx.events.PricePosted).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(91e6);
    });

    it('should update view if ETH price is within anchor bounds', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 91e6]);
      const tx = await postPrices(timestamp, [[['ETH', 91]]], ['ETH']);

      expect(tx.events.PriceGuarded).toBe(undefined);
      expect(tx.events.PriceUpdated.returnValues.price).numEquals(91e6);
      expect(tx.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(91e6);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(91e6);
    });

    it('should update view if ERC20 price is within anchor bounds', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['REP', 17e6]);
      const tx = await postPrices(timestamp, [[['REP', 17]]], ['REP']);

      expect(tx.events.PriceGuarded).toBe(undefined);
      expect(tx.events.PriceUpdated.returnValues.price).numEquals(17e6);
      expect(tx.events.PriceUpdated.returnValues.symbol).toBe('REP');
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('REP')])).numEquals(17e6);
      expect(await call(priceData, 'getPrice', [reporter.address, 'REP'])).numEquals(17e6);
    });

    it('should not update view if ETH price is below anchor bounds', async () => {
      // anchorMantissa is 1e17, so 10% tolerance
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 89.9e6]);
      const tx = await postPrices(timestamp, [[['ETH', 100]]], ['ETH']);

      expect(tx.events.PriceGuarded.returnValues.symbol).toBe('ETH');
      expect(tx.events.PriceGuarded.returnValues.reporter).numEquals(100e6);
      expect(tx.events.PriceGuarded.returnValues.anchor).numEquals(89.9e6);
      expect(tx.events.PriceUpdated).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(100e6);
    });

    it('should not update view if ERC20 price is below anchor bounds', async () => {
      const timestamp = time() - 5;
      // anchorMantissa is 1e17, so 10% tolerance
      await send(uniswapAnchoredView, 'setAnchorPrice', ['REP', 15e6]);
      const tx = await postPrices(timestamp, [[['REP', 17]]], ['REP']);

      expect(tx.events.PriceGuarded.returnValues.reporter).numEquals(17e6);
      expect(tx.events.PriceGuarded.returnValues.anchor).numEquals(15e6);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('REP')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'REP'])).numEquals(17e6);
    });

    it('should not update view if ETH price is above anchor bounds', async () => {
      // anchorMantissa is 1e17, so 10% tolerance
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 110.1e6]);
      const tx = await postPrices(timestamp, [[['ETH', 100]]], ['ETH']);

      expect(tx.events.PriceGuarded.returnValues.reporter).numEquals(100e6);
      expect(tx.events.PriceGuarded.returnValues.anchor).numEquals(110.1e6);
      expect(tx.events.PriceUpdated).toBe(undefined);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'ETH'])).numEquals(100e6);
    });

    it('should not update view if ERC20 price is above anchor bounds', async () => {
      const timestamp = time() - 5;
      // anchorMantissa is 1e17, so 10% tolerance
      await send(uniswapAnchoredView, 'setAnchorPrice', ['REP', 19e6]);
      const tx = await postPrices(timestamp, [[['REP', 17]]], ['REP']);

      expect(tx.events.PriceGuarded.returnValues.reporter).numEquals(17e6);
      expect(tx.events.PriceGuarded.returnValues.anchor).numEquals(19e6);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('REP')])).numEquals(0);
      expect(await call(priceData, 'getPrice', [reporter.address, 'REP'])).numEquals(17e6);
    });

    it('should revert on posting arrays of messages and signatures with different lengths', async () => {
      await expect(
        send(uniswapAnchoredView, 'postPrices', [['0xabc'], ['0x123', '0x123'], []])
      ).rejects.toRevert("revert messages and signatures must be 1:1");

      await expect(
        send(uniswapAnchoredView, 'postPrices', [['0xabc', '0xabc'], ['0x123'], []])
      ).rejects.toRevert("revert messages and signatures must be 1:1");
    });

    it('should revert on posting arrays with invalid symbols', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 91e6]);

      await expect(
        postPrices(timestamp, [[['ETH', 91]]], ['HOHO'])
      ).rejects.toRevert("revert token config not found");

      await expect(
        postPrices(timestamp, [[['HOHO', 91]]], ['HOHO'])
      ).rejects.toRevert("revert token config not found");

      await expect(
        postPrices(timestamp, [[['ETH', 91], ['WBTC', 1000]]], ['ETH', 'HOHO'])
      ).rejects.toRevert("revert token config not found");
    });

    it('should revert on posting arrays with invalid symbols', async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 91e6]);

      await expect(
        postPrices(timestamp, [[['ETH', 91]]], ['HOHO'])
      ).rejects.toRevert("revert token config not found");

      await expect(
        postPrices(timestamp, [[['HOHO', 91]]], ['HOHO'])
      ).rejects.toRevert("revert token config not found");

      await expect(
        postPrices(timestamp, [[['ETH', 91], ['WBTC', 1000]]], ['ETH', 'HOHO'])
      ).rejects.toRevert("revert token config not found");
    });

    it("should revert on posting FIXED_USD prices", async () => {
      await expect(
        postPrices(time() - 5, [[['USDT', 1]]], ['USDT'])
      ).rejects.toRevert("revert only reporter prices get posted");
    });

    it("should revert on posting FIXED_ETH prices", async () => {
      await expect(
        postPrices(time() - 5, [[['SAI', 1]]], ['SAI'])
      ).rejects.toRevert("revert only reporter prices get posted");
    });
});

  describe('getUnderlyingPrice', () => {
    // everything must return 1e36 - underlying units

    beforeEach(async () => {
      ({
        cToken,
        postPrices,
        uniswapAnchoredView,
      } = await setup({isMockedView: true}));
    });

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
      await send(uniswapAnchoredView, 'setAnchorPrice', ['BTC', 10000e6]);

      const tx = await postPrices(timestamp, [[['ETH', 200], ['BTC', 10000]]], ['ETH', 'BTC']);
      const btcPrice  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);

      expect(btcPrice).numEquals(10000e6);
      // priceInternal:      returns 10000e6
      // getUnderlyingPrice: 1e30 * 10000e6 / 1e8 = 1e32
      let expected = new BigNumber('1e32');
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.WBTC])).numEquals(expected.toFixed());
    });

  });

  describe('pokeWindowValues', () => {
    beforeEach(async () => {
      ({
        mockPair,
        anchorPeriod,
        uniswapAnchoredView,
        postPrices,
        tokenConfigs,
        timestamp
      } = await setup({isMockedView: false, freeze: true}));
    });

    it('should not update window values if not enough time elapsed', async () => {
      await sendRPC(web3, 'evm_freezeTime', [timestamp + anchorPeriod - 5]);
      const tx = await postPrices(timestamp, [[['ETH', 227]]], ['ETH']);
      expect(tx.events.UniswapWindowUpdated).toBe(undefined);
    });

    it('should update window values if enough time elapsed', async () => {
      const ethHash = keccak256('ETH');
      const mkt = mockPair._address;// ETH's mock market
      const newObs1 = await call(uniswapAnchoredView, 'newObservations', [ethHash]);
      const oldObs1 = await call(uniswapAnchoredView, 'oldObservations', [ethHash]);

      let timestampLater = timestamp + anchorPeriod;
      await sendRPC(web3, 'evm_freezeTime', [timestampLater]);

      const tx1 = await postPrices(timestampLater, [[['ETH', 227]]], ['ETH']);
      const updateEvent = tx1.events.AnchorPriceUpdated.returnValues;
      expect(updateEvent.newTimestamp).greaterThan(updateEvent.oldTimestamp);
      expect(tx1.events.PriceGuarded).toBe(undefined);

      // on the first update, we expect the new observation to change
      const newObs2 = await call(uniswapAnchoredView, 'newObservations', [ethHash]);
      const oldObs2 = await call(uniswapAnchoredView, 'oldObservations', [ethHash]);
      expect(newObs2.acc).greaterThan(newObs1.acc);
      expect(newObs2.timestamp).greaterThan(newObs1.timestamp);
      expect(oldObs2.acc).numEquals(oldObs1.acc);
      expect(oldObs2.timestamp).numEquals(oldObs1.timestamp);

      let timestampEvenLater = timestampLater + anchorPeriod;
      await sendRPC(web3, 'evm_freezeTime', [timestampEvenLater]);
      const tx2 = await postPrices(timestampEvenLater, [[['ETH', 201]]], ['ETH']);

      const windowUpdate = tx2.events.UniswapWindowUpdated.returnValues;
      expect(windowUpdate.symbolHash).toEqual(ethHash);
      expect(timestampEvenLater).greaterThan(windowUpdate.oldTimestamp);
      expect(windowUpdate.newPrice).greaterThan(windowUpdate.oldPrice);// accumulator should always go up

      // this time, both should change
      const newObs3 = await call(uniswapAnchoredView, 'newObservations', [ethHash]);
      const oldObs3 = await call(uniswapAnchoredView, 'oldObservations', [ethHash]);
      expect(newObs3.acc).greaterThan(newObs2.acc);
      expect(newObs3.acc).greaterThan(newObs2.timestamp);
      // old becomes last new
      expect(oldObs3.acc).numEquals(newObs2.acc);
      expect(oldObs3.timestamp).numEquals(newObs2.timestamp);

      const anchorPriceUpdated = tx2.events.AnchorPriceUpdated.returnValues;
      expect(anchorPriceUpdated.symbol).toBe("ETH");
      expect(anchorPriceUpdated.newTimestamp).greaterThan(anchorPriceUpdated.oldTimestamp);
      expect(oldObs3.timestamp).toBe(anchorPriceUpdated.oldTimestamp);
    });
  })

  describe('constructor', () => {

    it('should prevent bounds from under/overflow', async () => {
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      const priceData = await deploy('OpenOraclePriceData', []);
      const anchorPeriod = 30, configs = [];
      const UINT256_MAX = (1n<<256n) - 1n, exp = (a, b) => BigInt(a) * 10n**BigInt(b);

      const anchorMantissa1 = exp(100, 16);
      const view1 = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa1, anchorPeriod, configs]);
      expect(await call(view1, 'upperBoundAnchorRatio')).numEquals(2e18);
      expect(await call(view1, 'lowerBoundAnchorRatio')).numEquals(1);

      const anchorMantissa2 = UINT256_MAX - exp(99, 16);
      const view2 = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa2, anchorPeriod, configs]);
      expect(await call(view2, 'upperBoundAnchorRatio')).numEquals(UINT256_MAX.toString());
      expect(await call(view2, 'lowerBoundAnchorRatio')).numEquals(1);
    });

    it('should fail if baseUnit == 0', async () => {
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      const priceData = await deploy('OpenOraclePriceData', []);
      const anchorMantissa = numToHex(1e17);

      const dummyAddress = address(0);
      const mockPair = await deploy("MockUniswapTokenPair", [
        fixed(1.8e12),
        fixed(8.2e21),
        fixed(1.6e9),
        fixed(1.19e50),
        fixed(5.8e30),
      ]);
      const tokenConfigs = [
        // Set dummy address as a uniswap market address
        {cToken: address(1), underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: true},
        {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: 0, priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
        {cToken: address(3), underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false}];
      await expect(
        deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs])
      ).rejects.toRevert("revert baseUnit must be greater than zero");
    });

    it('should fail if uniswap market is not defined', async () => {
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      const priceData = await deploy('OpenOraclePriceData', []);
      const anchorMantissa = numToHex(1e17);

      const dummyAddress = address(0);
      const tokenConfigs = [
        // Set dummy address as a uniswap market address
        {cToken: address(1), underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: dummyAddress, isUniswapReversed: true},
        {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: address(4), isUniswapReversed: false},
        {cToken: address(3), underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: address(5), isUniswapReversed: false}];
      await expect(
        deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs])
      ).rejects.toRevert("revert reported prices must have an anchor");
    });

    it('should fail if non-reporter price utilizes an anchor', async () => {
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      const priceData = await deploy('OpenOraclePriceData', []);
      const anchorMantissa = numToHex(1e17);

      const dummyAddress = address(0);
      const tokenConfigs1 = [
        {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_USD, fixedPrice: 0, uniswapMarket: address(5), isUniswapReversed: false}];
      await expect(
        deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs1])
      ).rejects.toRevert("revert only reported prices utilize an anchor");

      const tokenConfigs2 = [
        {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: 0, uniswapMarket: address(5), isUniswapReversed: false}];
      await expect(
        deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs2])
      ).rejects.toRevert("revert only reported prices utilize an anchor");
    });

    it('basic scenario, successfully initialize observations initial state', async () => {
      ({reporter, anchorMantissa, priceData, anchorPeriod, uniswapAnchoredView, tokenConfigs, postPrices, cToken, mockPair} = await setup({isMockedView: true}));
      expect(await call(uniswapAnchoredView, 'reporter')).toBe(reporter.address);
      expect(await call(uniswapAnchoredView, 'anchorPeriod')).numEquals(anchorPeriod);
      expect(await call(uniswapAnchoredView, 'upperBoundAnchorRatio')).numEquals(new BigNumber(anchorMantissa).plus(1e18));
      expect(await call(uniswapAnchoredView, 'lowerBoundAnchorRatio')).numEquals(new BigNumber(1e18).minus(anchorMantissa));

      await Promise.all(tokenConfigs.map(async config => {
        const oldObservation = await call(uniswapAnchoredView, 'oldObservations', [config.uniswapMarket]);
        const newObservation = await call(uniswapAnchoredView, 'newObservations', [config.uniswapMarket]);
        expect(oldObservation.timestamp).numEquals(newObservation.timestamp);
        expect(oldObservation.acc).numEquals(newObservation.acc);
        if (config.priceSource != PriceSource.REPORTER) {
          expect(oldObservation.acc).numEquals(0);
          expect(newObservation.acc).numEquals(0);
          expect(oldObservation.timestamp).numEquals(0);
          expect(newObservation.timestamp).numEquals(0);
        }
      }))
    });
  })

  describe('invalidateReporter', () => {

    beforeEach(async done => {
      ({uniswapAnchoredView, postPrices} = await setup({isMockedView: true}));
      done();
    })

    it("reverts if given wrong message", async () => {
      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['stay still', rotationTarget]);
      const [ signed ] = sign(encoded, reporter.privateKey);

      await expect(
        send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature])
      ).rejects.toRevert("revert invalid message must be 'rotate'");
    });

    it("reverts if given wrong signature", async () => {
      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      let encoded = encodeRotationMessage(rotationTarget);
      // sign rotation message with wrong key
      const [ signed ] = sign(encoded, '0x666ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

      await expect(
        send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature])
      ).rejects.toRevert("revert invalidation message must come from the reporter");
    });

    it("basic scenario, sets reporterInvalidated and emits ReporterInvalidated event", async () => {
      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['rotate', rotationTarget]);
      const [ signed ] = sign(encoded, reporter.privateKey);

      // Check that reporterInvalidated variable is properly set
      expect(await call(uniswapAnchoredView, 'reporterInvalidated')).toBe(false);
      const tx = await send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature]);
      expect(await call(uniswapAnchoredView, 'reporterInvalidated')).toBe(true);

      // Check that event is emitted
      expect(tx.events.ReporterInvalidated).not.toBe(undefined);
      expect(tx.events.ReporterInvalidated.returnValues.reporter).toBe(reporter.address);
    });

    it("basic scenario, return anchor price after reporter is invalidated", async () => {
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
      await send(uniswapAnchoredView, 'setAnchorPrice', ['BTC', 10000e6]);

      await postPrices(timestamp, [[['ETH', 201], ['BTC', 10001]]], ['ETH', 'BTC']);

      // Check that prices = posted prices
      const wbtcPrice1  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);
      const ethPrice1  = await call(uniswapAnchoredView, 'prices', [keccak256('ETH')]);
      expect(wbtcPrice1).numEquals(10001e6);
      expect(ethPrice1).numEquals(201e6);

      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
      let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['rotate', rotationTarget]);
      const [ signed ] = sign(encoded, reporter.privateKey);

      await send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature]);
      await postPrices(timestamp, [[['ETH', 201], ['BTC', 10001]]], ['ETH', 'BTC']);

      // Check that prices = anchor prices
      const wbtcPrice2  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);
      const ethPrice2  = await call(uniswapAnchoredView, 'prices', [keccak256('ETH')]);
      expect(wbtcPrice2).numEquals(10000e6);
      expect(ethPrice2).numEquals(200e6);
    });
  })
});
