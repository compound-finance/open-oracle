import { ethers, network, config } from "hardhat";
import { expect, use } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { address, uint, keccak256 } from "./utils";
import {
  MockChainlinkOCRAggregator,
  MockChainlinkOCRAggregator__factory,
  UniswapAnchoredView,
  UniswapAnchoredView__factory,
} from "../types";
import * as UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { BigNumberish } from "ethers";

// Chai matchers for mocked contracts
use(smock.matchers);

const BigNumber = ethers.BigNumber;
type BigNumber = ReturnType<typeof BigNumber.from>;

const PriceSource = {
  FIXED_ETH: 0,
  FIXED_USD: 1,
  REPORTER: 2,
};
const FIXED_ETH_AMOUNT = 0.005e18;

interface CTokenConfig {
  [key: string]: {
    addr: string;
    reporter: MockChainlinkOCRAggregator;
  };
}

interface SetupOptions {
  isMockedView: boolean;
  freeze: boolean;
}

async function setup({ isMockedView, freeze }: SetupOptions) {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  const anchorMantissa = BigNumber.from("10").pow("17"); // 1e17
  const anchorPeriod = 60;
  const timestamp = Math.floor(Date.now() / 1000);

  if (freeze) {
    await ethers.provider.send("evm_freezeTime", [timestamp]);
  } else {
    await ethers.provider.send("evm_mine", []);
  }

  const usdcEthPair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"
  );

  const daiEthPair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8"
  );

  // Initialize REPv2 pair with values from mainnet
  const repEthPair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xb055103b7633b61518cd806d95beeb2d4cd217e7"
  );

  const wbtcEthPair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed"
  );

  const mockEthReporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();
  const mockDaiReporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();
  const mockRepReporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();
  const mockBtcReporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  const dummyReporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();
  const cToken: CTokenConfig = {
    ETH: {
      addr: address(1),
      reporter: mockEthReporter,
    },
    DAI: {
      addr: address(2),
      reporter: mockDaiReporter,
    },
    REP: {
      addr: address(3),
      reporter: mockRepReporter,
    },
    USDT: {
      addr: address(4),
      reporter: dummyReporter,
    },
    SAI: {
      addr: address(5),
      reporter: dummyReporter,
    },
    WBTC: {
      addr: address(6),
      reporter: mockBtcReporter,
    },
  };

  const dummyAddress = address(0);
  const tokenConfigs = [
    {
      cToken: cToken.ETH.addr,
      underlying: dummyAddress,
      symbolHash: keccak256("ETH"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: usdcEthPair.address,
      reporter: cToken.ETH.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: true,
    },
    {
      cToken: cToken.DAI.addr,
      underlying: dummyAddress,
      symbolHash: keccak256("DAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: daiEthPair.address,
      reporter: cToken.DAI.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cToken.REP.addr,
      underlying: dummyAddress,
      symbolHash: keccak256("REPv2"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: repEthPair.address,
      reporter: cToken.REP.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cToken.USDT.addr,
      underlying: dummyAddress,
      symbolHash: keccak256("USDT"),
      baseUnit: uint(1e6),
      priceSource: PriceSource.FIXED_USD,
      fixedPrice: uint(1e6),
      uniswapMarket: dummyAddress,
      reporter: cToken.USDT.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cToken.SAI.addr,
      underlying: dummyAddress,
      symbolHash: keccak256("SAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.FIXED_ETH,
      fixedPrice: uint(FIXED_ETH_AMOUNT),
      uniswapMarket: dummyAddress,
      reporter: cToken.SAI.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cToken.WBTC.addr,
      underlying: dummyAddress,
      symbolHash: keccak256("BTC"),
      baseUnit: uint(1e8),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: wbtcEthPair.address,
      reporter: cToken.WBTC.reporter.address,
      reporterMultiplier: uint(1e6),
      isUniswapReversed: false,
    },
  ];

  let uniswapAnchoredView:
    | UniswapAnchoredView
    | MockContract<UniswapAnchoredView>;
  if (isMockedView) {
    const mockedUniswapAnchoredView =
      await smock.mock<UniswapAnchoredView__factory>("UniswapAnchoredView");
    uniswapAnchoredView = await mockedUniswapAnchoredView.deploy(
      anchorMantissa,
      anchorPeriod,
      tokenConfigs
    );
  } else {
    uniswapAnchoredView = await new UniswapAnchoredView__factory(
      deployer
    ).deploy(anchorMantissa, anchorPeriod, tokenConfigs);
  }

  // Set the UAV to validate against for each mock reporter
  const mockReporters = [
    mockEthReporter,
    mockDaiReporter,
    mockRepReporter,
    mockBtcReporter,
  ];
  await Promise.all(
    mockReporters.map((reporter) =>
      reporter.setUniswapAnchoredView(uniswapAnchoredView.address)
    )
  );

  // TODO: This function is really unnecessary indirection
  async function validate(
    reporter: MockChainlinkOCRAggregator,
    price: BigNumberish
  ) {
    return reporter.validate(price);
  }

  return {
    anchorMantissa,
    anchorPeriod,
    cToken,
    timestamp,
    tokenConfigs,
    uniswapAnchoredView,
    validate,
  };
}

describe("UniswapAnchoredView", () => {
  let cToken: CTokenConfig;
  let reporter;
  let anchorMantissa;
  let anchorPeriod: number;
  let uniswapAnchoredView:
    | UniswapAnchoredView
    | MockContract<UniswapAnchoredView>;
  let tokenConfigs;
  let timestamp: number;

  beforeEach(async () => {
    // Reset the fork for each test
    const { url, blockNumber } = config.networks.hardhat.forking!;
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: url,
            blockNumber,
          },
        },
      ],
    });
  });

  describe("validate", () => {
    beforeEach(async () => {
      ({ anchorMantissa, cToken, tokenConfigs, uniswapAnchoredView } =
        await setup({ isMockedView: true, freeze: false }));

      // Temp: shh
      anchorMantissa;
      anchorPeriod;
      tokenConfigs;
      timestamp;
    });

    it("should update view if ETH price is within anchor bounds", async () => {
      const ethSymbol = keccak256("ETH");
      // Price to report (8 decimals of precision)
      const price = BigNumber.from(3950e8); // ETH/USDC = ~$3950
      // Expected price from UAV (6 decimals of precision)
      const expectedPrice = BigNumber.from(3950e6);
      reporter = cToken.ETH.reporter;
      // TODO: Figure out this issue
      // This doesn't seem to work (@defi-wonderland/smock)
      // so instead we are using real mainnet values from block 13152450
      // await (
      //   uniswapAnchoredView as MockContract<UniswapAnchoredView>
      // ).setVariable("prices", {
      //   [ethSymbol]: {
      //     price: expectedPrice,
      //     failoverActive: false,
      //   },
      // });

      // Try to report new price
      const tx_ = await reporter.validate(price);
      const tx = await tx_.wait(1);

      // Check event log and make sure the PriceUpdated event was emitted correctly
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceUpdated(null, null),
        tx.blockNumber,
        tx.blockNumber
      );
      expect(events.length).to.equal(1);
      expect(events[0].args.symbolHash).to.equal(ethSymbol);
      expect(events[0].args.price).to.equal(expectedPrice);
      const updatedEthPriceData = await uniswapAnchoredView.prices(ethSymbol);
      expect(updatedEthPriceData.price).to.equal(expectedPrice);
    });

    it("should update view if ERC20 price is within anchor bounds", async () => {
      // Same as above test but for an ERC-20 / ETH pair (REPv2/ETH)
      const repSymbol = keccak256("REPv2");
      const price = BigNumber.from(28e8);
      const expectedPrice = BigNumber.from(28e6);
      reporter = cToken.REP.reporter;
      // Try to report new price
      const tx_ = await reporter.validate(price);
      const tx = await tx_.wait(1);

      // Check event log and make sure the PriceUpdated event was emitted correctly
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceUpdated(null, null),
        tx.blockNumber,
        tx.blockNumber
      );
      expect(events.length).to.equal(1);
      expect(events[0].args.symbolHash).to.equal(repSymbol);
      expect(events[0].args.price).to.equal(expectedPrice);
      const updatedEthPriceData = await uniswapAnchoredView.prices(repSymbol);
      expect(updatedEthPriceData.price).to.equal(expectedPrice);
    });

    it("should not update view if ETH price is below anchor bounds", async () => {
      const ethSymbol = keccak256("ETH");
      const anchorPrice = 3950860042; // ~UniV3 ETH-USDC TWAP at block 13152450
      // anchorMantissa is 1e17, so 10% tolerance - test with a value outside of this tolerance range
      const postedPrice = 4400e8;
      const convertedPostedPrice = 4400e6;
      reporter = cToken.ETH.reporter;
      // The internal price should be initialised with a value of 1
      expect(await uniswapAnchoredView.price("ETH")).to.equal(1);
      // Try to report new price
      // This validates against the ETH-USDC UniV3 pool's TWAP at block 13152450
      await reporter.validate(postedPrice);
      expect(await uniswapAnchoredView.price("ETH")).to.equal(1);

      // Check event log and make sure the PriceGuarded event was emitted correctly
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceGuarded(null, null)
      );
      expect(events.length).to.equal(1);
      expect(events[0].args.symbolHash).to.equal(ethSymbol);
      expect(events[0].args.reporter).to.equal(convertedPostedPrice);
      expect(events[0].args.anchor).to.equal(anchorPrice);
      const updatedPrice = await uniswapAnchoredView.price("ETH");
      expect(updatedPrice).to.equal(1);
    });

    it("should not update view if ERC20 price is below anchor bounds", async () => {
      const repSymbol = keccak256("REPv2");
      const anchorPrice = 29578072;
      const postedPrice = 33e8; // Outside of the anchor tolerance
      const convertedPrice = 33e6;
      reporter = cToken.REP.reporter;

      // The internal price should be initialised with a value of 1
      expect(await uniswapAnchoredView.price("REPv2")).to.equal(1);
      // Try to report new price
      // This validates against the REPv2-USDC UniV3 pool's TWAP at block 13152450
      await reporter.validate(postedPrice);
      expect(await uniswapAnchoredView.price("REPv2")).to.equal(1);

      // Check event log and make sure the PriceGuarded event was emitted correctly
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceGuarded(null, null)
      );
      expect(events.length).to.equal(1);
      expect(events[0].args.symbolHash).to.equal(repSymbol);
      expect(events[0].args.reporter).to.equal(convertedPrice);
      expect(events[0].args.anchor).to.equal(anchorPrice);
      const updatedPrice = await uniswapAnchoredView.price("REPv2");
      expect(updatedPrice).to.equal(1);
    });

    it("should not update view if ETH price is above anchor bounds", async () => {
      const ethSymbol = keccak256("ETH");
      const anchorPrice = 3950860042; // ~UniV3 ETH-USDC TWAP at block 13152450
      // anchorMantissa is 1e17, so 10% tolerance - test with a value outside of this tolerance range
      const postedPrice = 3550e8;
      const convertedPostedPrice = 3550e6;
      reporter = cToken.ETH.reporter;
      // The internal price should be initialised with a value of 1
      expect(await uniswapAnchoredView.price("ETH")).to.equal(1);
      // Try to report new price
      // This validates against the ETH-USDC UniV3 pool's TWAP at block 13152450
      await reporter.validate(postedPrice);
      expect(await uniswapAnchoredView.price("ETH")).to.equal(1);

      // Check event log and make sure the PriceGuarded event was emitted correctly
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceGuarded(null, null)
      );
      expect(events.length).to.equal(1);
      expect(events[0].args.symbolHash).to.equal(ethSymbol);
      expect(events[0].args.reporter).to.equal(convertedPostedPrice);
      expect(events[0].args.anchor).to.equal(anchorPrice);
      const updatedPrice = await uniswapAnchoredView.price("ETH");
      expect(updatedPrice).to.equal(1);
    });

    it("should not update view if ERC20 price is above anchor bounds", async () => {
      const repSymbol = keccak256("REPv2");
      const anchorPrice = 29578072;
      const postedPrice = 26e8; // Outside of the anchor tolerance
      const convertedPrice = 26e6;
      reporter = cToken.REP.reporter;

      // The internal price should be initialised with a value of 1
      expect(await uniswapAnchoredView.price("REPv2")).to.equal(1);
      // Try to report new price
      // This validates against the REPv2-USDC UniV3 pool's TWAP at block 13152450
      await reporter.validate(postedPrice);
      expect(await uniswapAnchoredView.price("REPv2")).to.equal(1);

      // Check event log and make sure the PriceGuarded event was emitted correctly
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceGuarded(null, null)
      );
      expect(events.length).to.equal(1);
      expect(events[0].args.symbolHash).to.equal(repSymbol);
      expect(events[0].args.reporter).to.equal(convertedPrice);
      expect(events[0].args.anchor).to.equal(anchorPrice);
      const updatedPrice = await uniswapAnchoredView.price("REPv2");
      expect(updatedPrice).to.equal(1);
    });

    it("should revert reporter is not associated with a token config", async () => {
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      reporter = await new MockChainlinkOCRAggregator__factory(
        deployer
      ).deploy();
      await reporter.setUniswapAnchoredView(uniswapAnchoredView.address);

      await expect(reporter.validate(95)).to.be.revertedWith(
        "token config not found"
      );
    });
  });

  // describe("getUnderlyingPrice", () => {
  //   // everything must return 1e36 - underlying units

  //   beforeEach(async () => {
  //     ({ cToken, uniswapAnchoredView, validate } = await setup({
  //       isMockedView: true,
  //       freeze: false,
  //     }));
  //   });

  //   it("should work correctly for USDT fixed USD price source", async () => {
  //     // 1 * (1e(36 - 6)) = 1e30
  //     let expected = new BigNumber("1e30");
  //     expect(
  //       await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //         cToken.USDT.addr,
  //       ])
  //     ).numEquals(expected.toFixed());
  //   });

  //   it("should return fixed ETH amount if SAI", async () => {
  //     reporter = cToken.ETH.reporter;
  //     const expectedPrice = 200e6;
  //     const price = 200e8;
  //     await send(uniswapAnchoredView, "setAnchorPrice", ["ETH", expectedPrice]);
  //     const tx = await validate(reporter, price);
  //     // priceInternal:      returns 200e6 * 0.005e18 / 1e18 = 1e6
  //     // getUnderlyingPrice:         1e30 * 1e6 / 1e18 = 1e18
  //     expect(
  //       await call(uniswapAnchoredView, "getUnderlyingPrice", [cToken.SAI.addr])
  //     ).numEquals(1e18);
  //   });

  //   it("should return reported ETH price", async () => {
  //     reporter = cToken.ETH.reporter;
  //     await send(uniswapAnchoredView, "setAnchorPrice", ["ETH", 200e6]);
  //     const tx = await validate(reporter, 200e8);
  //     // priceInternal:      returns 200e6
  //     // getUnderlyingPrice: 1e30 * 200e6 / 1e18 = 200e18
  //     expect(
  //       await call(uniswapAnchoredView, "getUnderlyingPrice", [cToken.ETH.addr])
  //     ).numEquals(200e18);
  //   });

  //   it("should return reported WBTC price", async () => {
  //     await send(uniswapAnchoredView, "setAnchorPrice", ["ETH", 200e6]);
  //     await send(uniswapAnchoredView, "setAnchorPrice", ["BTC", 10000e6]);

  //     reporter = cToken.ETH.reporter;
  //     const tx1 = await validate(reporter, 200e8);
  //     reporter = cToken.WBTC.reporter;
  //     const tx2 = validate(reporter, 10000e8);

  //     const btcPrice = await call(uniswapAnchoredView, "prices", [
  //       keccak256("BTC"),
  //     ]);
  //     expect(btcPrice.price).numEquals(10000e6);
  //     // priceInternal:      returns 10000e6
  //     // getUnderlyingPrice: 1e30 * 10000e6 / 1e8 = 1e32
  //     let expected = new BigNumber("1e32");
  //     expect(
  //       await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //         cToken.WBTC.addr,
  //       ])
  //     ).numEquals(expected.toFixed());
  //   });
  // });

  // describe("pokeWindowValues", () => {
  //   beforeEach(async () => {
  //     ({ anchorPeriod, uniswapAnchoredView, cToken, tokenConfigs, timestamp } =
  //       await setup({ isMockedView: false, freeze: true }));
  //   });

  //   it("should not update window values if not enough time elapsed", async () => {
  //     reporter = cToken.ETH.reporter;
  //     await sendRPC(web3, "evm_freezeTime", [timestamp + anchorPeriod - 5]);
  //     const tx = await validate(reporter, 227e6);

  //     expect(numberOfEvents(tx)).toBe(2);
  //     let anchorPriceUpdatedLog = decodeEvent(EVENTS.AnchorPriceUpdated, tx, 0);
  //     let priceUpdatedLog = decodeEvent(EVENTS.PriceUpdated, tx, 1);
  //     expect(anchorPriceUpdatedLog.symbolHash).toBe(keccak256("ETH"));
  //     expect(priceUpdatedLog.symbolHash).toBe(keccak256("ETH"));
  //   });

  //   it("should update window values if enough time elapsed", async () => {
  //     reporter = cToken.ETH.reporter;
  //     const ethHash = keccak256("ETH");
  //     const newObs1 = await call(uniswapAnchoredView, "newObservations", [
  //       ethHash,
  //     ]);
  //     const oldObs1 = await call(uniswapAnchoredView, "oldObservations", [
  //       ethHash,
  //     ]);

  //     let timestampLater = timestamp + anchorPeriod;
  //     await sendRPC(web3, "evm_freezeTime", [timestampLater]);

  //     const tx1 = await validate(reporter, 227e6);
  //     const updateEvent = decodeEvent(EVENTS.AnchorPriceUpdated, tx1, 0);
  //     expect(updateEvent.newTimestamp).greaterThan(updateEvent.oldTimestamp);

  //     // on the first update, we expect the new observation to change
  //     const newObs2 = await call(uniswapAnchoredView, "newObservations", [
  //       ethHash,
  //     ]);
  //     const oldObs2 = await call(uniswapAnchoredView, "oldObservations", [
  //       ethHash,
  //     ]);
  //     expect(newObs2.acc).greaterThan(newObs1.acc);
  //     expect(newObs2.timestamp).greaterThan(newObs1.timestamp);
  //     expect(oldObs2.acc).numEquals(oldObs1.acc);
  //     expect(oldObs2.timestamp).numEquals(oldObs1.timestamp);

  //     let timestampEvenLater = timestampLater + anchorPeriod;
  //     await sendRPC(web3, "evm_freezeTime", [timestampEvenLater]);
  //     const tx2 = await validate(reporter, 201e6);

  //     const windowUpdate = decodeEvent(EVENTS.UniswapWindowUpdated, tx2, 0);
  //     expect(windowUpdate.symbolHash).toEqual(ethHash);
  //     expect(timestampEvenLater).greaterThan(windowUpdate.oldTimestamp);
  //     expect(windowUpdate.newPrice).greaterThan(windowUpdate.oldPrice); // accumulator should always go up

  //     // this time, both should change
  //     const newObs3 = await call(uniswapAnchoredView, "newObservations", [
  //       ethHash,
  //     ]);
  //     const oldObs3 = await call(uniswapAnchoredView, "oldObservations", [
  //       ethHash,
  //     ]);
  //     expect(newObs3.acc).greaterThan(newObs2.acc);
  //     expect(newObs3.acc).greaterThan(newObs2.timestamp);
  //     // old becomes last new
  //     expect(oldObs3.acc).numEquals(newObs2.acc);
  //     expect(oldObs3.timestamp).numEquals(newObs2.timestamp);

  //     const anchorPriceUpdated = decodeEvent(EVENTS.AnchorPriceUpdated, tx2, 1);
  //     expect(anchorPriceUpdated.symbolHash).toBe(ethHash);
  //     expect(anchorPriceUpdated.newTimestamp).greaterThan(
  //       anchorPriceUpdated.oldTimestamp
  //     );
  //     expect(oldObs3.timestamp).toBe(anchorPriceUpdated.oldTimestamp);
  //   });
  // });

  // describe("constructor", () => {
  //   beforeEach(async () => {
  //     ({ cToken } = await setup({ isMockedView: false, freeze: true }));
  //   });

  //   it("should prevent bounds from under/overflow", async () => {
  //     const anchorPeriod = 30,
  //       configs = [];
  //     const UINT256_MAX = (1n << 256n) - 1n,
  //       exp = (a, b) => BigInt(a) * 10n ** BigInt(b);

  //     const anchorMantissa1 = exp(100, 16);
  //     const view1 = await deploy("UniswapAnchoredView", [
  //       anchorMantissa1,
  //       anchorPeriod,
  //       configs,
  //     ]);
  //     expect(await call(view1, "upperBoundAnchorRatio")).numEquals(2e18);
  //     expect(await call(view1, "lowerBoundAnchorRatio")).numEquals(1);

  //     const anchorMantissa2 = UINT256_MAX - exp(99, 16);
  //     const view2 = await deploy("UniswapAnchoredView", [
  //       anchorMantissa2,
  //       anchorPeriod,
  //       configs,
  //     ]);
  //     expect(await call(view2, "upperBoundAnchorRatio")).numEquals(
  //       UINT256_MAX.toString()
  //     );
  //     expect(await call(view2, "lowerBoundAnchorRatio")).numEquals(1);
  //   });

  //   it("should fail if baseUnit == 0", async () => {
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
  //       {
  //         cToken: address(1),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("ETH"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.REPORTER,
  //         fixedPrice: 0,
  //         uniswapMarket: mockPair.address,
  //         reporter: cToken.ETH.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: true,
  //       },
  //       {
  //         cToken: address(2),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("DAI"),
  //         baseUnit: 0,
  //         priceSource: PriceSource.REPORTER,
  //         fixedPrice: 0,
  //         uniswapMarket: mockPair.address,
  //         reporter: cToken.DAI.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: false,
  //       },
  //       {
  //         cToken: address(3),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("REP"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.REPORTER,
  //         fixedPrice: 0,
  //         uniswapMarket: mockPair.address,
  //         reporter: cToken.REP.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: false,
  //       },
  //     ];
  //     await expect(
  //       deploy("UniswapAnchoredView", [anchorMantissa, 30, tokenConfigs])
  //     ).rejects.toRevert("revert baseUnit must be greater than zero");
  //   });

  //   it("should fail if uniswap market is not defined", async () => {
  //     const anchorMantissa = numToHex(1e17);

  //     const dummyAddress = address(0);
  //     const tokenConfigs = [
  //       // Set dummy address as a uniswap market address
  //       {
  //         cToken: address(1),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("ETH"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.REPORTER,
  //         fixedPrice: 0,
  //         uniswapMarket: dummyAddress,
  //         reporter: cToken.ETH.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: true,
  //       },
  //       {
  //         cToken: address(2),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("DAI"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.REPORTER,
  //         fixedPrice: 0,
  //         uniswapMarket: address(4),
  //         reporter: cToken.DAI.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: false,
  //       },
  //       {
  //         cToken: address(3),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("REP"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.REPORTER,
  //         fixedPrice: 0,
  //         uniswapMarket: address(5),
  //         reporter: cToken.REP.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: false,
  //       },
  //     ];
  //     await expect(
  //       deploy("UniswapAnchoredView", [anchorMantissa, 30, tokenConfigs])
  //     ).rejects.toRevert("revert reported prices must have an anchor");
  //   });

  //   it("should fail if non-reporter price utilizes an anchor", async () => {
  //     const anchorMantissa = numToHex(1e17);

  //     const dummyAddress = address(0);
  //     const tokenConfigs1 = [
  //       {
  //         cToken: address(2),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("USDT"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.FIXED_USD,
  //         fixedPrice: 0,
  //         uniswapMarket: address(5),
  //         reporter: cToken.ETH.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: false,
  //       },
  //     ];
  //     await expect(
  //       deploy("UniswapAnchoredView", [anchorMantissa, 30, tokenConfigs1])
  //     ).rejects.toRevert("revert only reported prices utilize an anchor");

  //     const tokenConfigs2 = [
  //       {
  //         cToken: address(2),
  //         underlying: dummyAddress,
  //         symbolHash: keccak256("USDT"),
  //         baseUnit: uint(1e18),
  //         priceSource: PriceSource.FIXED_ETH,
  //         fixedPrice: 0,
  //         uniswapMarket: address(5),
  //         reporter: cToken.DAI.reporter.address,
  //         reporterMultiplier: uint(1e16),
  //         isUniswapReversed: false,
  //       },
  //     ];
  //     await expect(
  //       deploy("UniswapAnchoredView", [anchorMantissa, 30, tokenConfigs2])
  //     ).rejects.toRevert("revert only reported prices utilize an anchor");
  //   });

  //   it("basic scenario, successfully initialize observations initial state", async () => {
  //     ({
  //       anchorMantissa,
  //       anchorPeriod,
  //       uniswapAnchoredView,
  //       tokenConfigs,
  //       validate,
  //       cToken,
  //       mockPair,
  //     } = await setup({ isMockedView: true }));
  //     expect(await call(uniswapAnchoredView, "anchorPeriod")).numEquals(
  //       anchorPeriod
  //     );
  //     expect(
  //       await call(uniswapAnchoredView, "upperBoundAnchorRatio")
  //     ).numEquals(new BigNumber(anchorMantissa).plus(1e18));
  //     expect(
  //       await call(uniswapAnchoredView, "lowerBoundAnchorRatio")
  //     ).numEquals(new BigNumber(1e18).minus(anchorMantissa));

  //     await Promise.all(
  //       tokenConfigs.map(async (config) => {
  //         const oldObservation = await call(
  //           uniswapAnchoredView,
  //           "oldObservations",
  //           [config.uniswapMarket]
  //         );
  //         const newObservation = await call(
  //           uniswapAnchoredView,
  //           "newObservations",
  //           [config.uniswapMarket]
  //         );
  //         expect(oldObservation.timestamp).numEquals(newObservation.timestamp);
  //         expect(oldObservation.acc).numEquals(newObservation.acc);
  //         if (config.priceSource != PriceSource.REPORTER) {
  //           expect(oldObservation.acc).numEquals(0);
  //           expect(newObservation.acc).numEquals(0);
  //           expect(oldObservation.timestamp).numEquals(0);
  //           expect(newObservation.timestamp).numEquals(0);
  //         }
  //       })
  //     );
  //   });
  // });

  // describe("activateFailover", () => {
  //   let accounts;

  //   beforeEach(async (done) => {
  //     accounts = await web3.eth.getAccounts();
  //     ({ uniswapAnchoredView, validate, cToken } = await setup({
  //       isMockedView: true,
  //     }));
  //     done();
  //   });

  //   it("reverts if called by a non-owner", async () => {
  //     await expect(
  //       send(uniswapAnchoredView, "activateFailover", [keccak256("ETH")], {
  //         from: accounts[1],
  //       })
  //     ).rejects.toRevert("revert Only callable by owner");
  //   });

  //   it("basic scenario, sets failoverActive and emits FailoverActivated event", async () => {
  //     // Check that failoverActive variable is properly set
  //     const response1 = await call(uniswapAnchoredView, "prices", [
  //       keccak256("ETH"),
  //     ]);
  //     expect(response1.failoverActive).toBe(false);
  //     const tx = await send(
  //       uniswapAnchoredView,
  //       "activateFailover",
  //       [keccak256("ETH")],
  //       { from: accounts[0] }
  //     );
  //     const response2 = await call(uniswapAnchoredView, "prices", [
  //       keccak256("ETH"),
  //     ]);
  //     expect(response2.failoverActive).toBe(true);

  //     // Check that event is emitted
  //     expect(tx.events.FailoverActivated.returnValues.symbolHash).toBe(
  //       keccak256("ETH")
  //     );
  //   });

  //   it("basic scenario, return failover price after failover is activated", async () => {
  //     await send(uniswapAnchoredView, "setAnchorPrice", ["ETH", 200e6]);

  //     reporter = cToken.ETH.reporter;
  //     await validate(reporter, 201e8);

  //     // Check that prices = posted prices
  //     const ethPrice1 = await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //       cToken.ETH.addr,
  //     ]);
  //     // priceInternal:      returns 201e6
  //     // getUnderlyingPrice: 1e30 * 201e6 / 1e18 = 201e18
  //     const expectedEth1 = new BigNumber("201e18");
  //     expect(ethPrice1).numEquals(expectedEth1.toFixed());

  //     // Failover ETH
  //     await sendRPC(web3, "evm_increaseTime", [30 * 60]);
  //     await send(uniswapAnchoredView, "activateFailover", [keccak256("ETH")], {
  //       from: accounts[0],
  //     });
  //     await send(uniswapAnchoredView, "pokeFailedOverPrice", [
  //       keccak256("ETH"),
  //     ]);

  //     // Check that ETH (which was failed over) = uniswap TWAP prices
  //     const ethPrice2 = await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //       cToken.ETH.addr,
  //     ]);
  //     // failover price:      returns 200e6
  //     // getUnderlyingPrice:  1e30 * 200e6 / 1e18 = 200e18
  //     const expectedEth2 = new BigNumber("200e18");
  //     expect(ethPrice2).numEquals(expectedEth2.toFixed());
  //   });
  // });

  // describe("deactivateFailover", () => {
  //   let accounts;

  //   beforeEach(async (done) => {
  //     accounts = await web3.eth.getAccounts();
  //     ({ uniswapAnchoredView, validate, cToken } = await setup({
  //       isMockedView: true,
  //     }));
  //     done();
  //   });

  //   it("reverts if called by a non-owner", async () => {
  //     await expect(
  //       send(uniswapAnchoredView, "activateFailover", [keccak256("ETH")], {
  //         from: accounts[1],
  //       })
  //     ).rejects.toRevert("revert Only callable by owner");
  //   });

  //   it("basic scenario, sets failoverActive and emits FailoverDeactivated event", async () => {
  //     // Check that failoverActive variable is properly set
  //     const response1 = await call(uniswapAnchoredView, "prices", [
  //       keccak256("ETH"),
  //     ]);
  //     expect(response1.failoverActive).toBe(false);
  //     await send(uniswapAnchoredView, "activateFailover", [keccak256("ETH")], {
  //       from: accounts[0],
  //     });
  //     const response2 = await call(uniswapAnchoredView, "prices", [
  //       keccak256("ETH"),
  //     ]);
  //     expect(response2.failoverActive).toBe(true);
  //     const tx = await send(
  //       uniswapAnchoredView,
  //       "deactivateFailover",
  //       [keccak256("ETH")],
  //       { from: accounts[0] }
  //     );
  //     const response3 = await call(uniswapAnchoredView, "prices", [
  //       keccak256("ETH"),
  //     ]);
  //     expect(response3.failoverActive).toBe(false);

  //     // Check that event is emitted
  //     expect(tx.events.FailoverDeactivated.returnValues.symbolHash).toBe(
  //       keccak256("ETH")
  //     );
  //   });

  //   it("basic scenario, return reporter price after failover is deactivated", async () => {
  //     await send(uniswapAnchoredView, "setAnchorPrice", ["ETH", 200e6]);

  //     reporter = cToken.ETH.reporter;
  //     await validate(reporter, 201e8);

  //     // Check that prices = posted prices
  //     const ethPrice1 = await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //       cToken.ETH.addr,
  //     ]);
  //     // priceInternal:      returns 201e6
  //     // getUnderlyingPrice: 1e30 * 201e6 / 1e18 = 201e18
  //     const expectedEth1 = new BigNumber("201e18");
  //     expect(ethPrice1).numEquals(expectedEth1.toFixed());

  //     // Failover ETH
  //     await sendRPC(web3, "evm_increaseTime", [30 * 60]);
  //     await send(uniswapAnchoredView, "activateFailover", [keccak256("ETH")], {
  //       from: accounts[0],
  //     });
  //     await send(uniswapAnchoredView, "pokeFailedOverPrice", [
  //       keccak256("ETH"),
  //     ]);

  //     // Check that ETH (which was failed over) = uniswap TWAP prices
  //     const ethPrice2 = await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //       cToken.ETH.addr,
  //     ]);
  //     // failover price:      returns 200e6
  //     // getUnderlyingPrice:  1e30 * 200e6 / 1e18 = 200e18
  //     const expectedEth2 = new BigNumber("200e18");
  //     expect(ethPrice2).numEquals(expectedEth2.toFixed());

  //     // deactivate failover for eth
  //     await send(
  //       uniswapAnchoredView,
  //       "deactivateFailover",
  //       [keccak256("ETH")],
  //       { from: accounts[0] }
  //     );
  //     await validate(reporter, 201e8);

  //     const ethPrice3 = await call(uniswapAnchoredView, "getUnderlyingPrice", [
  //       cToken.ETH.addr,
  //     ]);
  //     expect(ethPrice3).numEquals(expectedEth1.toFixed());
  //   });
  // });
});
