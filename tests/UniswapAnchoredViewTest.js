const { EVENTS, decodeEvent, uint, keccak256, time, numToHex, address, sendRPC, currentBlockTimestamp, fixed, numberOfEvents } = require('./Helpers');
const BigNumber = require('bignumber.js');

const PriceSource = {
  FIXED_ETH: 0,
  FIXED_USD: 1,
  REPORTER: 2
};
const FIXED_ETH_AMOUNT = 0.005e18;

async function setup({isMockedView, freeze}) {
  const anchorMantissa = numToHex(1e17);
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
  const mockEthReporter = await deploy("MockChainlinkOCRAggregator");
  const mockDaiReporter = await deploy("MockChainlinkOCRAggregator");
  const mockRepReporter = await deploy("MockChainlinkOCRAggregator");
  const mockBtcReporter = await deploy("MockChainlinkOCRAggregator");

  const dummyAddress = address(0);
  const cToken = {
    ETH: {
      addr: address(1),
      reporter: mockEthReporter
    },
    DAI: {
      addr: address(2),
      reporter: mockDaiReporter
    },
    REP: {
      addr: address(3),
      reporter: mockRepReporter
    },
    USDT: {
      addr: address(4),
      reporter: dummyAddress
    },
    SAI: {
      addr: address(5),
      reporter: dummyAddress
    },
    WBTC: {
      addr: address(6),
      reporter: mockBtcReporter
    }
  };
  
  const tokenConfigs = [
    {cToken: cToken.ETH.addr, underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, reporter: cToken.ETH.reporter._address, isUniswapReversed: true},
    {cToken: cToken.DAI.addr, underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, reporter: cToken.DAI.reporter._address, isUniswapReversed: false},
    {cToken: cToken.REP.addr, underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockRepPair._address, reporter: cToken.REP.reporter._address, isUniswapReversed: false},
    {cToken: cToken.USDT.addr, underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e6), priceSource: PriceSource.FIXED_USD, fixedPrice: uint(1e6), uniswapMarket: dummyAddress, reporter: cToken.USDT.reporter, isUniswapReversed: false},
    {cToken: cToken.SAI.addr, underlying: dummyAddress, symbolHash: keccak256('SAI'), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: uint(FIXED_ETH_AMOUNT), uniswapMarket: dummyAddress, reporter: cToken.SAI.reporter, isUniswapReversed: false},
    {cToken: cToken.WBTC.addr, underlying: dummyAddress, symbolHash: keccak256('BTC'), baseUnit: uint(1e8), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, reporter: cToken.WBTC.reporter._address, isUniswapReversed: false},
  ];

  let uniswapAnchoredView;
  if (isMockedView) {
    uniswapAnchoredView = await deploy('MockUniswapAnchoredView', [anchorMantissa, anchorPeriod, tokenConfigs]);
  } else {
    uniswapAnchoredView = await deploy('UniswapAnchoredView', [anchorMantissa, anchorPeriod, tokenConfigs]);
  }
  await send(mockEthReporter, 'setUniswapAnchoredView', [uniswapAnchoredView._address]);
  await send(mockDaiReporter, 'setUniswapAnchoredView', [uniswapAnchoredView._address]);
  await send(mockRepReporter, 'setUniswapAnchoredView', [uniswapAnchoredView._address]);
  await send(mockBtcReporter, 'setUniswapAnchoredView', [uniswapAnchoredView._address]);

  return {
    anchorMantissa,
    anchorPeriod,
    cToken,
    mockPair,
    timestamp,
    tokenConfigs,
    uniswapAnchoredView,
  };
}

describe('UniswapAnchoredView', () => {
  let cToken;
  let reporter;
  let anchorMantissa;
  let anchorPeriod;
  let uniswapAnchoredView;
  let tokenConfigs;
  let mockPair;
  let timestamp;

  describe('validate', () => {
    beforeEach(async () => {
      ({
        anchorMantissa,
        cToken,
        tokenConfigs,
        uniswapAnchoredView,
      } = await setup({isMockedView: true}));
    });

    it('should update view if ETH price is within anchor bounds', async () => {
      const price = 91e6;
      reporter = cToken.ETH.reporter;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', price]);
      const tx = await send(reporter, 'validate', [price]);

      expect(numberOfEvents(tx)).toBe(1)

      let priceUpdatedLog = decodeEvent(EVENTS.PriceUpdated, tx, 0);
      expect(priceUpdatedLog.symbolHash).toBe(keccak256('ETH'))
      expect(priceUpdatedLog.price).numEquals(price);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(price);
    });

    it('should update view if ERC20 price is within anchor bounds', async () => {
      const price = 17e6;
      reporter = cToken.REP.reporter;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['REP', price]);
      const tx = await send(reporter, 'validate', [price]);

      expect(numberOfEvents(tx)).toBe(1)

      let priceUpdatedLog = decodeEvent(EVENTS.PriceUpdated, tx, 0);
      expect(priceUpdatedLog.symbolHash).toBe(keccak256('REP'))
      expect(priceUpdatedLog.price).numEquals(price);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('REP')])).numEquals(price);
    });

    it('should not update view if ETH price is below anchor bounds', async () => {
      const anchorPrice = 89.9e6;
      const postedPrice = 100e6;
      reporter = cToken.ETH.reporter;
      // anchorMantissa is 1e17, so 10% tolerance
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', anchorPrice]);
      const tx = await send(reporter, 'validate', [postedPrice]);

      expect(numberOfEvents(tx)).toBe(1)

      let priceGuardedLog = decodeEvent(EVENTS.PriceGuarded, tx, 0);
      expect(priceGuardedLog.symbolHash).toBe(keccak256('ETH'))
      expect(priceGuardedLog.reporter).numEquals(postedPrice);
      expect(priceGuardedLog.anchor).numEquals(anchorPrice);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
    });

    it('should not update view if ERC20 price is below anchor bounds', async () => {
      const anchorPrice = 15e6;
      const postedPrice = 17e6;
      reporter = cToken.REP.reporter;
      // anchorMantissa is 1e17, so 10% tolerance
      await send(uniswapAnchoredView, 'setAnchorPrice', ['REP', anchorPrice]);
      const tx = await send(reporter, 'validate', [postedPrice]);

      expect(numberOfEvents(tx)).toBe(1)

      let priceGuardedLog = decodeEvent(EVENTS.PriceGuarded, tx, 0);
      expect(priceGuardedLog.symbolHash).toBe(keccak256('REP'))
      expect(priceGuardedLog.reporter).numEquals(postedPrice);
      expect(priceGuardedLog.anchor).numEquals(anchorPrice);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('REP')])).numEquals(0);
    });

    it('should not update view if ETH price is above anchor bounds', async () => {
      const anchorPrice = 110.1e6;
      const postedPrice = 100e6;
      reporter = cToken.ETH.reporter;
      // anchorMantissa is 1e17, so 10% tolerance
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', anchorPrice]);
      const tx = await send(reporter, 'validate', [postedPrice]);

      expect(numberOfEvents(tx)).toBe(1)

      let priceGuardedLog = decodeEvent(EVENTS.PriceGuarded, tx, 0);
      expect(priceGuardedLog.symbolHash).toBe(keccak256('ETH'))
      expect(priceGuardedLog.reporter).numEquals(postedPrice);
      expect(priceGuardedLog.anchor).numEquals(anchorPrice);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('ETH')])).numEquals(0);
    });

    it('should not update view if ERC20 price is above anchor bounds', async () => {
      const anchorPrice = 19e6;
      const postedPrice = 17e6;
      reporter = cToken.REP.reporter;
      // anchorMantissa is 1e17, so 10% tolerance
      await send(uniswapAnchoredView, 'setAnchorPrice', ['REP', anchorPrice]);
      const tx = await send(reporter, 'validate', [postedPrice]);

      expect(numberOfEvents(tx)).toBe(1)

      let priceGuardedLog = decodeEvent(EVENTS.PriceGuarded, tx, 0);
      expect(priceGuardedLog.symbolHash).toBe(keccak256('REP'))
      expect(priceGuardedLog.reporter).numEquals(postedPrice);
      expect(priceGuardedLog.anchor).numEquals(anchorPrice);
      expect(await call(uniswapAnchoredView, 'prices', [keccak256('REP')])).numEquals(0);
    });

    it('should revert reporter is not associated with a token config', async () => {
      reporter = await deploy("MockChainlinkOCRAggregator")
      await send(reporter, 'setUniswapAnchoredView', [uniswapAnchoredView._address]);

      await expect(
        send(reporter, 'validate', [95])
      ).rejects.toRevert("revert token config not found")
    });
});

  // describe('getUnderlyingPrice', () => {
  //   // everything must return 1e36 - underlying units

  //   beforeEach(async () => {
  //     ({
  //       cToken,
  //       postPrices,
  //       uniswapAnchoredView,
  //     } = await setup({isMockedView: true}));
  //   });

  //   it('should work correctly for USDT fixed USD price source', async () => {
  //     // 1 * (1e(36 - 6)) = 1e30
  //     let expected = new BigNumber('1e30');
  //     expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.USDT])).numEquals(expected.toFixed());
  //   });

  //   it('should return fixed ETH amount if SAI', async () => {
  //     const timestamp = time() - 5;
  //     await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
  //     const tx = await postPrices(timestamp, [[['ETH', 200]]], ['ETH']);
  //     // priceInternal:      returns 200e6 * 0.005e18 / 1e18 = 1e6
  //     // getUnderlyingPrice:         1e30 * 1e6 / 1e18 = 1e18
  //     expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.SAI])).numEquals(1e18);
  //   });

  //   it('should return reported ETH price', async () => {
  //     const timestamp = time() - 5;
  //     await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
  //     const tx = await postPrices(timestamp, [[['ETH', 200]]], ['ETH']);
  //     // priceInternal:      returns 200e6
  //     // getUnderlyingPrice: 1e30 * 200e6 / 1e18 = 200e18
  //     expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.ETH])).numEquals(200e18);
  //   });

  //   it('should return reported WBTC price', async () => {
  //     const timestamp = time() - 5;
  //     await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
  //     await send(uniswapAnchoredView, 'setAnchorPrice', ['BTC', 10000e6]);

  //     const tx = await postPrices(timestamp, [[['ETH', 200], ['BTC', 10000]]], ['ETH', 'BTC']);
  //     const btcPrice  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);

  //     expect(btcPrice).numEquals(10000e6);
  //     // priceInternal:      returns 10000e6
  //     // getUnderlyingPrice: 1e30 * 10000e6 / 1e8 = 1e32
  //     let expected = new BigNumber('1e32');
  //     expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.WBTC])).numEquals(expected.toFixed());
  //   });

  // });

  // describe('pokeWindowValues', () => {
  //   beforeEach(async () => {
  //     ({
  //       mockPair,
  //       anchorPeriod,
  //       uniswapAnchoredView,
  //       postPrices,
  //       tokenConfigs,
  //       timestamp
  //     } = await setup({isMockedView: false, freeze: true}));
  //   });

  //   it('should not update window values if not enough time elapsed', async () => {
  //     await sendRPC(web3, 'evm_freezeTime', [timestamp + anchorPeriod - 5]);
  //     const tx = await postPrices(timestamp, [[['ETH', 227]]], ['ETH']);
  //     expect(tx.events.UniswapWindowUpdated).toBe(undefined);
  //   });

  //   it('should update window values if enough time elapsed', async () => {
  //     const ethHash = keccak256('ETH');
  //     const mkt = mockPair._address;// ETH's mock market
  //     const newObs1 = await call(uniswapAnchoredView, 'newObservations', [ethHash]);
  //     const oldObs1 = await call(uniswapAnchoredView, 'oldObservations', [ethHash]);

  //     let timestampLater = timestamp + anchorPeriod;
  //     await sendRPC(web3, 'evm_freezeTime', [timestampLater]);

  //     const tx1 = await postPrices(timestampLater, [[['ETH', 227]]], ['ETH']);
  //     const updateEvent = tx1.events.AnchorPriceUpdated.returnValues;
  //     expect(updateEvent.newTimestamp).greaterThan(updateEvent.oldTimestamp);
  //     expect(tx1.events.PriceGuarded).toBe(undefined);

  //     // on the first update, we expect the new observation to change
  //     const newObs2 = await call(uniswapAnchoredView, 'newObservations', [ethHash]);
  //     const oldObs2 = await call(uniswapAnchoredView, 'oldObservations', [ethHash]);
  //     expect(newObs2.acc).greaterThan(newObs1.acc);
  //     expect(newObs2.timestamp).greaterThan(newObs1.timestamp);
  //     expect(oldObs2.acc).numEquals(oldObs1.acc);
  //     expect(oldObs2.timestamp).numEquals(oldObs1.timestamp);

  //     let timestampEvenLater = timestampLater + anchorPeriod;
  //     await sendRPC(web3, 'evm_freezeTime', [timestampEvenLater]);
  //     const tx2 = await postPrices(timestampEvenLater, [[['ETH', 201]]], ['ETH']);

  //     const windowUpdate = tx2.events.UniswapWindowUpdated.returnValues;
  //     expect(windowUpdate.symbolHash).toEqual(ethHash);
  //     expect(timestampEvenLater).greaterThan(windowUpdate.oldTimestamp);
  //     expect(windowUpdate.newPrice).greaterThan(windowUpdate.oldPrice);// accumulator should always go up

  //     // this time, both should change
  //     const newObs3 = await call(uniswapAnchoredView, 'newObservations', [ethHash]);
  //     const oldObs3 = await call(uniswapAnchoredView, 'oldObservations', [ethHash]);
  //     expect(newObs3.acc).greaterThan(newObs2.acc);
  //     expect(newObs3.acc).greaterThan(newObs2.timestamp);
  //     // old becomes last new
  //     expect(oldObs3.acc).numEquals(newObs2.acc);
  //     expect(oldObs3.timestamp).numEquals(newObs2.timestamp);

  //     const anchorPriceUpdated = tx2.events.AnchorPriceUpdated.returnValues;
  //     expect(anchorPriceUpdated.symbol).toBe("ETH");
  //     expect(anchorPriceUpdated.newTimestamp).greaterThan(anchorPriceUpdated.oldTimestamp);
  //     expect(oldObs3.timestamp).toBe(anchorPriceUpdated.oldTimestamp);
  //   });
  // })

  // describe('constructor', () => {

  //   it('should prevent bounds from under/overflow', async () => {
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     const priceData = await deploy('OpenOraclePriceData', []);
  //     const anchorPeriod = 30, configs = [];
  //     const UINT256_MAX = (1n<<256n) - 1n, exp = (a, b) => BigInt(a) * 10n**BigInt(b);

  //     const anchorMantissa1 = exp(100, 16);
  //     const view1 = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa1, anchorPeriod, configs]);
  //     expect(await call(view1, 'upperBoundAnchorRatio')).numEquals(2e18);
  //     expect(await call(view1, 'lowerBoundAnchorRatio')).numEquals(1);

  //     const anchorMantissa2 = UINT256_MAX - exp(99, 16);
  //     const view2 = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa2, anchorPeriod, configs]);
  //     expect(await call(view2, 'upperBoundAnchorRatio')).numEquals(UINT256_MAX.toString());
  //     expect(await call(view2, 'lowerBoundAnchorRatio')).numEquals(1);
  //   });

  //   it('should fail if baseUnit == 0', async () => {
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     const priceData = await deploy('OpenOraclePriceData', []);
  //     const anchorMantissa = numToHex(1e17);

  //     const dummyAddress = address(0);
  //     const mockPair = await deploy("MockUniswapTokenPair", [
  //       fixed(1.8e12),
  //       fixed(8.2e21),
  //       fixed(1.6e9),
  //       fixed(1.19e50),
  //       fixed(5.8e30),
  //     ]);
  //     const tokenConfigs = [
  //       // Set dummy address as a uniswap market address
  //       {cToken: address(1), underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: true},
  //       {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: 0, priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false},
  //       {cToken: address(3), underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: mockPair._address, isUniswapReversed: false}];
  //     await expect(
  //       deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs])
  //     ).rejects.toRevert("revert baseUnit must be greater than zero");
  //   });

  //   it('should fail if uniswap market is not defined', async () => {
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     const priceData = await deploy('OpenOraclePriceData', []);
  //     const anchorMantissa = numToHex(1e17);

  //     const dummyAddress = address(0);
  //     const tokenConfigs = [
  //       // Set dummy address as a uniswap market address
  //       {cToken: address(1), underlying: dummyAddress, symbolHash: keccak256('ETH'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: dummyAddress, isUniswapReversed: true},
  //       {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('DAI'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: address(4), isUniswapReversed: false},
  //       {cToken: address(3), underlying: dummyAddress, symbolHash: keccak256('REP'), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: address(5), isUniswapReversed: false}];
  //     await expect(
  //       deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs])
  //     ).rejects.toRevert("revert reported prices must have an anchor");
  //   });

  //   it('should fail if non-reporter price utilizes an anchor', async () => {
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     const priceData = await deploy('OpenOraclePriceData', []);
  //     const anchorMantissa = numToHex(1e17);

  //     const dummyAddress = address(0);
  //     const tokenConfigs1 = [
  //       {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_USD, fixedPrice: 0, uniswapMarket: address(5), isUniswapReversed: false}];
  //     await expect(
  //       deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs1])
  //     ).rejects.toRevert("revert only reported prices utilize an anchor");

  //     const tokenConfigs2 = [
  //       {cToken: address(2), underlying: dummyAddress, symbolHash: keccak256('USDT'), baseUnit: uint(1e18), priceSource: PriceSource.FIXED_ETH, fixedPrice: 0, uniswapMarket: address(5), isUniswapReversed: false}];
  //     await expect(
  //       deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, 30, tokenConfigs2])
  //     ).rejects.toRevert("revert only reported prices utilize an anchor");
  //   });

  //   it('basic scenario, successfully initialize observations initial state', async () => {
  //     ({reporter, anchorMantissa, priceData, anchorPeriod, uniswapAnchoredView, tokenConfigs, postPrices, cToken, mockPair} = await setup({isMockedView: true}));
  //     expect(await call(uniswapAnchoredView, 'reporter')).toBe(reporter.address);
  //     expect(await call(uniswapAnchoredView, 'anchorPeriod')).numEquals(anchorPeriod);
  //     expect(await call(uniswapAnchoredView, 'upperBoundAnchorRatio')).numEquals(new BigNumber(anchorMantissa).plus(1e18));
  //     expect(await call(uniswapAnchoredView, 'lowerBoundAnchorRatio')).numEquals(new BigNumber(1e18).minus(anchorMantissa));

  //     await Promise.all(tokenConfigs.map(async config => {
  //       const oldObservation = await call(uniswapAnchoredView, 'oldObservations', [config.uniswapMarket]);
  //       const newObservation = await call(uniswapAnchoredView, 'newObservations', [config.uniswapMarket]);
  //       expect(oldObservation.timestamp).numEquals(newObservation.timestamp);
  //       expect(oldObservation.acc).numEquals(newObservation.acc);
  //       if (config.priceSource != PriceSource.REPORTER) {
  //         expect(oldObservation.acc).numEquals(0);
  //         expect(newObservation.acc).numEquals(0);
  //         expect(oldObservation.timestamp).numEquals(0);
  //         expect(newObservation.timestamp).numEquals(0);
  //       }
  //     }))
  //   });
  // })

  // describe('invalidateReporter', () => {

  //   beforeEach(async done => {
  //     ({uniswapAnchoredView, postPrices} = await setup({isMockedView: true}));
  //     done();
  //   })

  //   it("reverts if given wrong message", async () => {
  //     const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['stay still', rotationTarget]);
  //     const [ signed ] = sign(encoded, reporter.privateKey);

  //     await expect(
  //       send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature])
  //     ).rejects.toRevert("revert invalid message must be 'rotate'");
  //   });

  //   it("reverts if given wrong signature", async () => {
  //     const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
  //     let encoded = encodeRotationMessage(rotationTarget);
  //     // sign rotation message with wrong key
  //     const [ signed ] = sign(encoded, '0x666ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

  //     await expect(
  //       send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature])
  //     ).rejects.toRevert("revert invalidation message must come from the reporter");
  //   });

  //   it("basic scenario, sets reporterInvalidated and emits ReporterInvalidated event", async () => {
  //     const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['rotate', rotationTarget]);
  //     const [ signed ] = sign(encoded, reporter.privateKey);

  //     // Check that reporterInvalidated variable is properly set
  //     expect(await call(uniswapAnchoredView, 'reporterInvalidated')).toBe(false);
  //     const tx = await send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature]);
  //     expect(await call(uniswapAnchoredView, 'reporterInvalidated')).toBe(true);

  //     // Check that event is emitted
  //     expect(tx.events.ReporterInvalidated).not.toBe(undefined);
  //     expect(tx.events.ReporterInvalidated.returnValues.reporter).toBe(reporter.address);
  //   });

  //   it("basic scenario, return anchor price after reporter is invalidated", async () => {
  //     const timestamp = time() - 5;
  //     await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
  //     await send(uniswapAnchoredView, 'setAnchorPrice', ['BTC', 10000e6]);

  //     await postPrices(timestamp, [[['ETH', 201], ['BTC', 10001]]], ['ETH', 'BTC']);

  //     // Check that prices = posted prices
  //     const wbtcPrice1  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);
  //     const ethPrice1  = await call(uniswapAnchoredView, 'prices', [keccak256('ETH')]);
  //     expect(wbtcPrice1).numEquals(10001e6);
  //     expect(ethPrice1).numEquals(201e6);

  //     const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
  //     const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  //     let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['rotate', rotationTarget]);
  //     const [ signed ] = sign(encoded, reporter.privateKey);

  //     await send(uniswapAnchoredView, 'invalidateReporter', [encoded, signed.signature]);
  //     await postPrices(timestamp, [[['ETH', 201], ['BTC', 10001]]], ['ETH', 'BTC']);

  //     // Check that prices = anchor prices
  //     const wbtcPrice2  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);
  //     const ethPrice2  = await call(uniswapAnchoredView, 'prices', [keccak256('ETH')]);
  //     expect(wbtcPrice2).numEquals(10000e6);
  //     expect(ethPrice2).numEquals(200e6);
  //   });
  // })
});
