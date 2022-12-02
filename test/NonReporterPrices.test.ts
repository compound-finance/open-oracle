import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "@nomiclabs/hardhat-waffle";
import { expect, use } from "chai";
import { ethers } from "hardhat";
import {
  MockChainlinkOCRAggregator__factory,
  UniswapAnchoredView__factory,
} from "../types";
import { smock } from "@defi-wonderland/smock";
import * as UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { address, uint, keccak256 } from "./utils";
import { getTokenAddresses } from "./utils/cTokenAddresses";

// Chai matchers for mocked contracts
use(smock.matchers);

// BigNumber type helpers
export const BigNumber = ethers.BigNumber;
export type BigNumber = ReturnType<typeof BigNumber.from>;

const PriceSource = {
  FIXED_ETH: 0,
  FIXED_USD: 1,
  REPORTER: 2,
};

describe("UniswapAnchoredView", () => {
  let signers: SignerWithAddress[];
  let deployer: SignerWithAddress;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    deployer = signers[0];
  });

  const cTokenAddresses = getTokenAddresses(["USDC", "USDT"]);

  it("handles fixed_usd prices", async () => {
    const USDC = {
      cToken: cTokenAddresses["USDC"].cToken,
      underlying: cTokenAddresses["USDC"].underlying,
      symbolHash: keccak256("USDC"),
      baseUnit: uint(1e6),
      priceSource: PriceSource.FIXED_USD,
      fixedPrice: uint(1e6),
      uniswapMarket: address(0),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    const USDT = {
      cToken: cTokenAddresses["USDT"].cToken,
      underlying: cTokenAddresses["USDT"].underlying,
      symbolHash: keccak256("USDT"),
      baseUnit: uint(1e6),
      priceSource: PriceSource.FIXED_USD,
      fixedPrice: uint(1e6),
      uniswapMarket: address(0),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    const oracle = await new UniswapAnchoredView__factory(deployer).deploy(
      0,
      60,
      [USDC, USDT]
    );
    expect(await oracle.price("USDC")).to.equal(uint(1e6));
    expect(await oracle.price("USDT")).to.equal(uint(1e6));
  });

  it("reverts fixed_eth prices if no ETH price", async () => {
    const SAI = {
      cToken: address(5),
      underlying: address(6),
      symbolHash: keccak256("SAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.FIXED_ETH,
      fixedPrice: uint(5285551943761727),
      uniswapMarket: address(0),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    const oracle = await new UniswapAnchoredView__factory(deployer).deploy(
      0,
      60,
      [SAI]
    );
    expect(oracle.price("SAI")).to.be.revertedWith("ETH price not set");
  });

  it("reverts if ETH has no uniswap market", async () => {
    // if (!coverage) {
    // This test for some reason is breaking coverage in CI, skip for now
    const ETH = {
      cToken: address(5),
      underlying: address(6),
      symbolHash: keccak256("ETH"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: address(0),
      reporter: address(1),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: true,
    };
    const SAI = {
      cToken: address(5),
      underlying: address(6),
      symbolHash: keccak256("SAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.FIXED_ETH,
      fixedPrice: uint(5285551943761727),
      uniswapMarket: address(0),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    expect(
      new UniswapAnchoredView__factory(deployer).deploy(0, 60, [ETH, SAI])
    ).to.be.revertedWith("No anchor");
    // }
  });

  it("reverts if non-reporter has a uniswap market", async () => {
    // if (!coverage) {
    const ETH = {
      cToken: address(5),
      underlying: address(6),
      symbolHash: keccak256("ETH"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.FIXED_ETH,
      fixedPrice: 14,
      uniswapMarket: address(112),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: true,
    };
    const SAI = {
      cToken: address(5),
      underlying: address(6),
      symbolHash: keccak256("SAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.FIXED_ETH,
      fixedPrice: uint(5285551943761727),
      uniswapMarket: address(0),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    expect(
      new UniswapAnchoredView__factory(deployer).deploy(0, 60, [ETH, SAI])
    ).to.be.revertedWith("Doesnt need anchor");
    // }
  });

  it("handles fixed_eth prices", async () => {
    // if (!coverage) {
    // Get USDC/ETH V3 pool (highest liquidity/highest fee) from mainnet
    const usdc_eth_pair = await ethers.getContractAt(
      UniswapV3Pool.abi,
      "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"
    );
    const ans = await usdc_eth_pair.functions.observe([3600, 0]);
    const tickCumulatives: BigNumber[] = ans[0];

    const timeWeightedAverageTick = tickCumulatives[1]
      .sub(tickCumulatives[0])
      .div("3600");
    const inverseTwap = 1.0001 ** timeWeightedAverageTick.toNumber(); // USDC/ETH
    // console.log(`${inverseTwap} <- inverse TWAP (USDC/ETH) sanity check`);
    // ETH has 1e18 precision, USDC has 1e6 precision
    const twap = 1e18 / (1e6 * inverseTwap); // ETH/USDC
    // console.log(`${twap} <- TWAP (ETH/USDC) sanity check`);
    // Sanity check ~ USDC/ETH mid price at block 13152450
    expect(3957.1861616593173 - twap).to.be.lessThanOrEqual(Number.EPSILON);

    const reporter = await new MockChainlinkOCRAggregator__factory(
      deployer
    ).deploy();

    const ETH = {
      cToken: address(5),
      underlying: address(6),
      symbolHash: keccak256("ETH"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.REPORTER,
      fixedPrice: 0,
      uniswapMarket: usdc_eth_pair.address,
      reporter: reporter.address,
      reporterMultiplier: uint(1e16),
      isUniswapReversed: true,
    };
    const SAI = {
      cToken: address(7),
      underlying: address(8),
      symbolHash: keccak256("SAI"),
      baseUnit: uint(1e18),
      priceSource: PriceSource.FIXED_ETH,
      fixedPrice: uint(5285551943761727),
      uniswapMarket: address(0),
      reporter: address(0),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    const oracle = await new UniswapAnchoredView__factory(deployer).deploy(
      uint(20e16),
      60,
      [ETH, SAI]
    );
    await reporter.setUniswapAnchoredView(oracle.address);

    await ethers.provider.send("evm_increaseTime", [30 * 60]);
    await ethers.provider.send("evm_mine", []);

    // 8 decimals posted
    const ethPrice = 395718616161;
    // 6 decimals stored
    const expectedEthPrice = BigNumber.from(ethPrice).div(100); // enforce int division
    // Feed price via mock reporter -> UAV
    await reporter.validate(ethPrice);
    // console.log(
    //   await oracle.queryFilter(oracle.filters.PriceUpdated(null, null))
    // );
    // const priceGuards = await oracle.queryFilter(
    //   oracle.filters.PriceGuarded(null, null, null)
    // );
    // const priceGuarded = priceGuards[0];
    // console.log('Guarded: reported -> ' + (priceGuarded.args[1] as BigNumber).toString());
    // console.log('Guarded: anchored -> ' + (priceGuarded.args[2] as BigNumber).toString());
    expect(await oracle.price("ETH")).to.equal(expectedEthPrice.toNumber());
    expect(await oracle.price("SAI")).to.equal(20915913);
    // }
  });
});
