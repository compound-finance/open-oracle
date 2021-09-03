import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "@nomiclabs/hardhat-waffle";
import { expect } from "chai";
import { ethers } from "hardhat";
import { UniswapAnchoredView__factory } from "../types";

const BigNumber = ethers.BigNumber;
type BigNumber = ReturnType<typeof BigNumber.from>;

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

  it("handles fixed_usd prices", async () => {
    const USDC = {
      cToken: address(1),
      underlying: address(2),
      symbolHash: keccak256("USDC"),
      baseUnit: uint(1e6),
      priceSource: PriceSource.FIXED_USD,
      fixedPrice: uint(1e6),
      uniswapMarket: address(0),
      reporter: address(5),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    const USDT = {
      cToken: address(3),
      underlying: address(4),
      symbolHash: keccak256("USDT"),
      baseUnit: uint(1e6),
      priceSource: PriceSource.FIXED_USD,
      fixedPrice: uint(1e6),
      uniswapMarket: address(0),
      reporter: address(6),
      reporterMultiplier: uint(1e16),
      isUniswapReversed: false,
    };
    const oracle = await new UniswapAnchoredView__factory(deployer).deploy(
      0,
      0,
      [USDC, USDT]
    );
    expect(await oracle.price("USDC")).to.equal(uint(1e6));
    expect(await oracle.price("USDT")).to.equal(uint(1e6));
  });
});

function address(n: number) {
  return `0x${n.toString(16).padStart(40, "0")}`;
}

function keccak256(str: string) {
  return ethers.utils.solidityKeccak256(["string"], [str]);
}

function uint(n: any) {
  if (typeof n === "number") {
    n = String(n);
  }
  return BigNumber.from(n);
}
