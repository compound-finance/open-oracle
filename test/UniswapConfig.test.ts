import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { expect, use } from "chai";
import { UniswapConfig__factory } from "../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { address, keccak256, uint } from "./utils";
import { smock } from "@defi-wonderland/smock";

use(solidity);
use(smock.matchers);

describe("UniswapConfig", () => {
  let signers: SignerWithAddress[];
  let deployer: SignerWithAddress;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    deployer = signers[0];
  });

  it("basically works", async () => {
    const MockCTokenABI = [
      {
        type: "function",
        name: "underlying",
        stateMutability: "view",
        outputs: [{ type: "address", name: "underlying" }],
      },
    ];
    const unlistedButUnderlying = await smock.fake(MockCTokenABI);
    unlistedButUnderlying.underlying.returns(address(4));
    const unlistedNorUnderlying = await smock.fake(MockCTokenABI);
    unlistedNorUnderlying.underlying.returns(address(5));

    const contract = await new UniswapConfig__factory(deployer).deploy([
      {
        cToken: address(1),
        underlying: address(0),
        symbolHash: keccak256("ETH"),
        baseUnit: uint(1e18),
        priceSource: 0,
        fixedPrice: 0,
        uniswapMarket: address(6),
        reporter: address(8),
        reporterMultiplier: uint(1e16),
        isUniswapReversed: false,
      },
      {
        cToken: address(2),
        underlying: address(3),
        symbolHash: keccak256("BTC"),
        baseUnit: uint(1e18),
        priceSource: 1,
        fixedPrice: 1,
        uniswapMarket: address(7),
        reporter: address(9),
        reporterMultiplier: uint(1e16),
        isUniswapReversed: true,
      },
      {
        cToken: unlistedButUnderlying.address,
        underlying: address(4),
        symbolHash: keccak256("REP"),
        baseUnit: uint(1e18),
        priceSource: 1,
        fixedPrice: 1,
        uniswapMarket: address(7),
        reporter: address(10),
        reporterMultiplier: uint(1e16),
        isUniswapReversed: true,
      },
    ]);

    const cfg0 = await contract.getTokenConfig(0);
    const cfg1 = await contract.getTokenConfig(1);
    const cfg2 = await contract.getTokenConfig(2);
    const cfgETH = await contract.getTokenConfigBySymbol("ETH");
    const cfgBTC = await contract.getTokenConfigBySymbol("BTC");
    const cfgR8 = await contract.getTokenConfigByReporter(address(8));
    const cfgR9 = await contract.getTokenConfigByReporter(address(9));
    const cfgCT0 = await contract.getTokenConfigByCToken(address(1));
    const cfgCT1 = await contract.getTokenConfigByCToken(address(2));
    const cfgU2 = await contract.getTokenConfigByCToken(
      unlistedButUnderlying.address
    );
    expect(cfg0).to.deep.equal(cfgETH);
    expect(cfgETH).to.deep.equal(cfgR8);
    expect(cfgR8).to.deep.equal(cfgCT0);
    expect(cfg1).to.deep.equal(cfgBTC);
    expect(cfgBTC).to.deep.equal(cfgR9);
    expect(cfgR9).to.deep.equal(cfgCT1);
    expect(cfg0).not.to.deep.equal(cfg1);
    expect(cfgU2).to.deep.equal(cfg2);

    await expect(contract.getTokenConfig(3)).to.be.revertedWith(
      "token config not found"
    );
    await expect(contract.getTokenConfigBySymbol("COMP")).to.be.revertedWith(
      "token config not found"
    );
    await expect(
      contract.getTokenConfigByReporter(address(1))
    ).to.be.revertedWith("token config not found");
    await expect(
      contract.getTokenConfigByCToken(address(3))
    ).to.be.revertedWith("revert"); // not a ctoken
    await expect(
      contract.getTokenConfigByCToken(unlistedNorUnderlying.address)
    ).to.be.revertedWith("token config not found");
  });

  it("returns configs exactly as specified", async () => {
    const symbols = Array(25)
      .fill(0)
      .map((_, i) => String.fromCharCode("a".charCodeAt(0) + i));
    const configs = symbols.map((symbol, i) => {
      return {
        cToken: address(i + 1),
        underlying: address(i),
        symbolHash: keccak256(symbol),
        baseUnit: uint(i + 49),
        priceSource: 0,
        fixedPrice: 1,
        uniswapMarket: address(i + 50),
        reporter: address(i + 51),
        reporterMultiplier: uint(i + 52),
        isUniswapReversed: i % 2 == 0,
      };
    });
    const contract = await new UniswapConfig__factory(deployer).deploy(configs);

    await Promise.all(
      configs.map(async (config, i) => {
        const cfgByIndex = await contract.getTokenConfig(i);
        const cfgBySymbol = await contract.getTokenConfigBySymbol(symbols[i]);
        const cfgByCToken = await contract.getTokenConfigByCToken(
          address(i + 1)
        );
        const cfgByCReporter = await contract.getTokenConfigByReporter(
          address(i + 51)
        );
        const cfgByUnderlying = await contract.getTokenConfigByUnderlying(
          address(i)
        );
        expect({
          cToken: cfgByIndex.cToken,
          underlying: cfgByIndex.underlying,
          symbolHash: cfgByIndex.symbolHash,
          baseUnit: cfgByIndex.baseUnit,
          priceSource: cfgByIndex.priceSource,
          fixedPrice: cfgByIndex.fixedPrice.toNumber(), // enum => uint8
          uniswapMarket: cfgByIndex.uniswapMarket,
          reporter: cfgByIndex.reporter,
          reporterMultiplier: cfgByIndex.reporterMultiplier,
          isUniswapReversed: cfgByIndex.isUniswapReversed,
        }).to.deep.equal({
          cToken: config.cToken,
          underlying: config.underlying,
          symbolHash: config.symbolHash,
          baseUnit: config.baseUnit,
          priceSource: config.priceSource,
          fixedPrice: config.fixedPrice,
          uniswapMarket: config.uniswapMarket,
          reporter: config.reporter,
          reporterMultiplier: config.reporterMultiplier,
          isUniswapReversed: config.isUniswapReversed,
        });
        expect(cfgByIndex).to.deep.equal(cfgBySymbol);
        expect(cfgBySymbol).to.deep.equal(cfgByCToken);
        expect(cfgByCToken).to.deep.equal(cfgByCReporter);
        expect(cfgByUnderlying).to.deep.equal(cfgBySymbol);
      })
    );
  });

  it("checks gas", async () => {
    const configs = Array(25)
      .fill(0)
      .map((_, i) => {
        const symbol = String.fromCharCode("a".charCodeAt(0) + i);
        return {
          cToken: address(i),
          underlying: address(i + 1),
          symbolHash: keccak256(symbol),
          baseUnit: uint(i + 49),
          priceSource: 0,
          fixedPrice: 1,
          uniswapMarket: address(i + 50),
          reporter: address(i + 51),
          reporterMultiplier: uint(i + 52),
          isUniswapReversed: i % 2 == 0,
        };
      });
    const contract = await new UniswapConfig__factory(deployer).deploy(configs);

    const cfg9 = await contract.getTokenConfig(9);
    const tx9__ = await contract.populateTransaction.getTokenConfig(9);
    const tx9_ = await deployer.sendTransaction(tx9__);
    const tx9 = await tx9_.wait();
    expect(cfg9.underlying).to.equal(address(10));
    expect(tx9.gasUsed).to.equal(22979);

    const cfg25 = await contract.getTokenConfig(24);
    const tx25__ = await contract.populateTransaction.getTokenConfig(24);
    const tx25_ = await deployer.sendTransaction(tx25__);
    const tx25 = await tx25_.wait();
    expect(cfg25.underlying).to.equal(address(25));
    expect(tx25.gasUsed).to.equal(23369);

    const cfgY = await contract.getTokenConfigBySymbol("y");
    const txY__ = await contract.populateTransaction.getTokenConfigBySymbol(
      "y"
    );
    const txY_ = await deployer.sendTransaction(txY__);
    const txY = await txY_.wait();
    expect(cfgY.cToken).to.equal(address(24));
    expect(cfgY.underlying).to.equal(address(25));
    expect(txY.gasUsed).to.equal(25577);

    const cfgCT26 = await contract.getTokenConfigByCToken(address(24));
    const txCT26__ = await contract.populateTransaction.getTokenConfigByCToken(
      address(24)
    );
    const txCT26_ = await deployer.sendTransaction(txCT26__);
    const txCT26 = await txCT26_.wait();
    expect(cfgCT26.cToken).to.equal(address(24));
    expect(cfgCT26.underlying).to.equal(address(25));
    expect(txCT26.gasUsed).to.equal(25450);

    const cfgR26 = await contract.getTokenConfigByReporter(address(24 + 51));
    const txR26__ = await contract.populateTransaction.getTokenConfigByReporter(
      address(24 + 51)
    );
    const txR26_ = await deployer.sendTransaction(txR26__);
    const txR26 = await txR26_.wait();
    expect(cfgR26.cToken).to.equal(address(24));
    expect(cfgR26.underlying).to.equal(address(25));
    expect(txR26.gasUsed).to.equal(25362);

    const cfgU26 = await contract.getTokenConfigByUnderlying(address(25));
    const txU26__ =
      await contract.populateTransaction.getTokenConfigByUnderlying(
        address(25)
      );
    const txU26_ = await deployer.sendTransaction(txU26__);
    const txU26 = await txU26_.wait();
    expect(cfgU26.cToken).to.equal(address(24));
    expect(cfgU26.underlying).to.equal(address(25));
    expect(txU26.gasUsed).to.equal(25384);
  });
});
