import { ethers } from "hardhat";
import { Contract } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import {
  MockChainlinkOCRAggregator__factory,
  MockChainlinkOCRAggregator,
  UniswapAnchoredView__factory,
  UniswapAnchoredView,
  UniswapV3SwapHelper__factory,
  UniswapV3SwapHelper,
} from "../types";
import { WETH9 } from "typechain-common-abi/types/contract-types/ethers";
import { uint, keccak256, getWeth9, resetFork } from "./utils";
import { getTokenAddresses } from "./utils/cTokenAddresses";

const BigNumber = ethers.BigNumber;
type BigNumber = ReturnType<typeof BigNumber.from>;

// @notice UniswapAnchoredView `validate` test
// Based on price data from Coingecko and Uniswap token pairs
// at block 13152450 (2021-09-03 11:23:34 UTC)
interface TestTokenPair {
  pair: Contract;
  reporter: MockChainlinkOCRAggregator;
}

type TestTokenPairs = {
  [key: string]: TestTokenPair;
};

async function setupTokenPairs(
  deployer: SignerWithAddress
): Promise<TestTokenPairs> {
  // Reversed market for ETH, read value of ETH in USDC
  // USDC/ETH V3 pool (highest liquidity/highest fee) from mainnet
  const usdc_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"
  );
  const usdc_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // DAI/ETH V3 pool from mainnet
  const dai_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8"
  );
  const dai_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // REP V3 pool from mainnet
  const rep_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xb055103b7633b61518cd806d95beeb2d4cd217e7"
  );
  const rep_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // Initialize BAT pair with values from mainnet
  const bat_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xAE614a7a56cB79c04Df2aeBA6f5dAB80A39CA78E"
  );
  const bat_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // Initialize ZRX pair with values from mainnet
  // Reversed market
  const eth_zrx_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0x14424eeecbff345b38187d0b8b749e56faa68539"
  );
  const zrx_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // WBTC/ETH (0.3%) V3 pool from mainnet
  const wbtc_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed"
  );
  const wbtc_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // Initialize COMP pair with values from mainnet
  const comp_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xea4ba4ce14fdd287f380b55419b1c5b6c3f22ab6"
  );
  const comp_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  // Initialize LINK pair with values from mainnet
  const link_eth_pair = await ethers.getContractAt(
    UniswapV3Pool.abi,
    "0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8"
  );
  const link_reporter = await new MockChainlinkOCRAggregator__factory(
    deployer
  ).deploy();

  return {
    ETH: {
      pair: usdc_eth_pair,
      reporter: usdc_reporter,
    },
    DAI: {
      pair: dai_eth_pair,
      reporter: dai_reporter,
    },
    REP: {
      pair: rep_eth_pair,
      reporter: rep_reporter,
    },
    BAT: {
      pair: bat_eth_pair,
      reporter: bat_reporter,
    },
    ZRX: {
      pair: eth_zrx_pair,
      reporter: zrx_reporter,
    },
    BTC: {
      pair: wbtc_eth_pair,
      reporter: wbtc_reporter,
    },
    COMP: {
      pair: comp_eth_pair,
      reporter: comp_reporter,
    },
    LINK: {
      pair: link_eth_pair,
      reporter: link_reporter,
    },
  };
}

async function setupUniswapAnchoredView(
  pairs: TestTokenPairs,
  deployer: SignerWithAddress
) {
  const PriceSource = {
    FIXED_ETH: 0,
    FIXED_USD: 1,
    REPORTER: 2,
  };

  const anchorMantissa = BigNumber.from("10").pow("17"); //1e17 equates to 10% tolerance for source price to be above or below anchor
  const anchorPeriod = 30 * 60;

  const cTokenAddresses = getTokenAddresses([
    "ETH",
    "DAI",
    "REP",
    "BAT",
    "ZRX",
    "BTC",
    "COMP",
    "LINK",
  ]);

  const tokenConfigs = [
    {
      cToken: cTokenAddresses["ETH"].cToken,
      underlying: cTokenAddresses["ETH"].underlying,
      symbolHash: keccak256("ETH"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.ETH.pair.address,
      reporter: pairs.ETH.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: true,
    },
    {
      cToken: cTokenAddresses["DAI"].cToken,
      underlying: cTokenAddresses["DAI"].underlying,
      symbolHash: keccak256("DAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.DAI.pair.address,
      reporter: pairs.DAI.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cTokenAddresses["REP"].cToken,
      underlying: cTokenAddresses["REP"].underlying,
      symbolHash: keccak256("REP"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.REP.pair.address,
      reporter: pairs.REP.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cTokenAddresses["BAT"].cToken,
      underlying: cTokenAddresses["BAT"].underlying,
      symbolHash: keccak256("BAT"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.BAT.pair.address,
      reporter: pairs.BAT.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cTokenAddresses["ZRX"].cToken,
      underlying: cTokenAddresses["ZRX"].underlying,
      symbolHash: keccak256("ZRX"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.ZRX.pair.address,
      reporter: pairs.ZRX.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: true,
    },
    {
      cToken: cTokenAddresses["BTC"].cToken,
      underlying: cTokenAddresses["BTC"].underlying,
      symbolHash: keccak256("BTC"),
      baseUnit: uint(1e8),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.BTC.pair.address,
      reporter: pairs.BTC.reporter.address,
      reporterMultiplier: uint(1e6),
      isUniswapReversed: false,
    },
    {
      cToken: cTokenAddresses["COMP"].cToken,
      underlying: cTokenAddresses["COMP"].underlying,
      symbolHash: keccak256("COMP"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.COMP.pair.address,
      reporter: pairs.COMP.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
    {
      cToken: cTokenAddresses["LINK"].cToken,
      underlying: cTokenAddresses["LINK"].underlying,
      symbolHash: keccak256("LINK"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: pairs.LINK.pair.address,
      reporter: pairs.LINK.reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    },
  ];

  return new UniswapAnchoredView__factory(deployer).deploy(
    anchorMantissa,
    anchorPeriod,
    tokenConfigs
  );
}

async function configureReporters(
  uniswapAnchoredViewAddress: string,
  pairs: TestTokenPairs
) {
  for (const key of Object.keys(pairs)) {
    await pairs[key].reporter.setUniswapAnchoredView(
      uniswapAnchoredViewAddress
    );
  }
}

async function setup(deployer: SignerWithAddress) {
  const pairs = await setupTokenPairs(deployer);
  const uniswapAnchoredView = await setupUniswapAnchoredView(pairs, deployer);
  const uniswapV3SwapHelper_ = await new UniswapV3SwapHelper__factory(
    deployer
  ).deploy();
  const uniswapV3SwapHelper = await uniswapV3SwapHelper_.connect(deployer);
  const weth9 = await getWeth9(deployer);

  return {
    uniswapAnchoredView,
    pairs,
    uniswapV3SwapHelper,
    weth9,
  };
}

describe("UniswapAnchoredView", () => {
  // No data for COMP from Coinbase so far, it is not added to the oracle yet
  const prices: Array<[string, BigNumber]> = [
    ["BTC", BigNumber.from("49338784652")],
    ["ETH", BigNumber.from("3793300743")],
    ["DAI", BigNumber.from("999851")],
    ["REP", BigNumber.from("28877036")],
    ["ZRX", BigNumber.from("1119738")],
    ["BAT", BigNumber.from("851261")],
    ["LINK", BigNumber.from("30058454")],
  ];
  let deployer: SignerWithAddress;
  let uniswapAnchoredView: UniswapAnchoredView;
  let pairs: TestTokenPairs;
  let uniswapV3SwapHelper: UniswapV3SwapHelper;
  let weth9: WETH9;
  beforeEach(async () => {
    await resetFork();

    const signers = await ethers.getSigners();
    deployer = signers[0];
    ({ uniswapAnchoredView, pairs, uniswapV3SwapHelper, weth9 } = await setup(
      deployer
    ));
  });

  it("basic scenario, use real world data", async () => {
    await configureReporters(uniswapAnchoredView.address, pairs);

    for (let i = 0; i < prices.length; i++) {
      const element = prices[i];
      const reporter = pairs[element[0]].reporter;
      // *100 to conform to 8 decimals
      await reporter.validate(element[1].mul("100"));
      const updatedPrice = await uniswapAnchoredView.price(element[0]);
      expect(updatedPrice).to.equal(prices[i][1].toString());
    }
  });

  // TODO: PriceGuarded tests?!
  it("test price events - PriceUpdated", async () => {
    await configureReporters(uniswapAnchoredView.address, pairs);

    for (let i = 0; i < prices.length; i++) {
      const element = prices[i];
      const reporter = pairs[element[0]].reporter;
      // *100 to conform to 8 decimals
      const validateTx = await reporter.validate(element[1].mul("100"));
      const events = await uniswapAnchoredView.queryFilter(
        uniswapAnchoredView.filters.PriceUpdated(keccak256(prices[i][0])),
        validateTx.blockNumber
      );
      expect(events.length).to.equal(1);
      // Price was updated
      expect(events[0].args.price).to.equal(prices[i][1]);
    }
  });

  it("test ETH (USDC/ETH) pair while token reserves change", async () => {
    await configureReporters(uniswapAnchoredView.address, pairs);
    // Report new price so the UAV TWAP is initialised, and confirm it
    await pairs.ETH.reporter.validate(3950e8);
    const ethAnchorInitial = await uniswapAnchoredView.price("ETH");
    expect(ethAnchorInitial).to.equal(3950e6);

    // Record the ETH mid-price from the pool
    const ethPriceInitial = Math.ceil(
      1e12 * 1.0001 ** -(await pairs.ETH.pair.slot0()).tick
    );
    expect(ethPriceInitial).to.equal(3951);

    const ethToSell = BigNumber.from("20000").mul(String(1e18));
    // Wrap ETH, unlimited allowance to UniswapV3SwapHelper
    await weth9.deposit({ value: ethToSell });
    await weth9.approve(
      uniswapV3SwapHelper.address,
      BigNumber.from("2").pow("256").sub("1")
    );
    // Simulate a swap using the helper
    await uniswapV3SwapHelper.performSwap(
      pairs.ETH.pair.address,
      false, // zeroForOne: false -> swap token1 (ETH) for token0 (USDC)
      ethToSell,
      BigNumber.from("1461446703485210103287273052203988822378723970342").sub(
        "1"
      ) // (MAX_SQRT_RATIO - 1) -> "no price limit"
    );

    // Check that mid-price on the V3 pool has dumped
    const ethPriceAfter = Math.ceil(
      1e12 * 1.0001 ** -(await pairs.ETH.pair.slot0()).tick
    );
    expect(1 - ethPriceAfter / ethPriceInitial).to.be.greaterThan(0.1);
    // TWAP should not be severely affected
    // so try to report a price that's within anchor tolerance of TWAP.
    // UAV should emit PriceUpdated accordingly.
    const tx = await pairs.ETH.reporter.validate(3960e8);
    const emittedEvents = await uniswapAnchoredView.queryFilter(
      uniswapAnchoredView.filters.PriceUpdated(null, null),
      tx.blockNumber
    );
    expect(emittedEvents.length).to.equal(1);
    expect(emittedEvents[0].args.symbolHash).to.equal(keccak256("ETH"));
    expect(emittedEvents[0].args.price).to.equal(3960e6);
  });
});
