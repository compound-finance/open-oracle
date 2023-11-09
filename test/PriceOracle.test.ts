import { ethers } from "hardhat";
import { expect, use } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { exp, resetFork } from "./utils";
import { PriceOracle, PriceOracle__factory } from "../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployMockContract } from "ethereum-waffle";

// Chai matchers for mocked contracts
use(smock.matchers);

export const BigNumber = ethers.BigNumber;
export type BigNumber = ReturnType<typeof BigNumber.from>;

interface SetupOptions {
  isMockedView: boolean;
}

const mockAggregatorAbi = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

const configs = [
  {
    cToken: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
    baseUnit: "1000000000000000000",
    priceFeed: "", // Set in setup with mocked contract address
  },
];

async function setup({ isMockedView }: SetupOptions) {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const newOwner = signers[1];
  const other = signers[2];

  // Mock ETH aggregator and set in config
  const mockedEthAggregator = await deployMockContract(
    deployer,
    mockAggregatorAbi
  );
  mockedEthAggregator.mock.latestRoundData.returns(0, 181217576125, 0, 0, 0);
  mockedEthAggregator.mock.decimals.returns(8);
  configs[0].priceFeed = mockedEthAggregator.address;

  let priceOracle: PriceOracle | MockContract<PriceOracle>;
  if (isMockedView) {
    const mockedPriceOracle = await smock.mock<PriceOracle__factory>(
      "PriceOracle"
    );
    priceOracle = await mockedPriceOracle.deploy(configs);
  } else {
    priceOracle = await new PriceOracle__factory(deployer).deploy(configs);
  }

  return {
    priceOracle,
    signers,
    deployer,
    newOwner,
    other,
  };
}

describe("PriceOracle", () => {
  let priceOracle: PriceOracle | MockContract<PriceOracle>;
  let deployer: SignerWithAddress;
  let newOwner: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    await resetFork();
  });

  describe("Ownable", () => {
    beforeEach(async () => {
      ({ priceOracle, deployer, newOwner, other } = await setup({
        isMockedView: false,
      }));
    });

    describe("transferOwnership", () => {
      describe("when called by non owner", async () => {
        it("reverts", async () => {
          await expect(
            priceOracle.connect(other).transferOwnership(newOwner.address)
          ).to.be.revertedWith("Only callable by owner");
        });
      });

      describe("when called by owner", () => {
        describe("when transferring to self", () => {
          it("reverts", async () => {
            await expect(
              priceOracle.connect(deployer).transferOwnership(deployer.address)
            ).to.be.revertedWith("Cannot transfer to self");
          });
        });

        describe("when transferring to another address", () => {
          it("emit an event", async () => {
            expect(
              priceOracle.connect(deployer).transferOwnership(newOwner.address)
            )
              .to.emit(priceOracle, "OwnershipTransferRequested")
              .withArgs(deployer.address, newOwner.address);
          });
        });
      });
    });

    describe("acceptOwnership", () => {
      beforeEach(async () => {
        await priceOracle.connect(deployer).transferOwnership(newOwner.address);
      });

      describe("when called by an address that is not the new owner", () => {
        it("reverts", async () => {
          await expect(
            priceOracle.connect(other).acceptOwnership()
          ).to.be.revertedWith("Must be proposed owner");
        });
      });

      describe("when accepted by an address that is the new proposed owner", () => {
        it("correctly changes the contract ownership", async () => {
          await priceOracle.connect(newOwner).acceptOwnership();
          expect(await priceOracle.owner()).to.equal(newOwner.address);
        });

        it("emits an event", async () => {
          await expect(priceOracle.connect(newOwner).acceptOwnership())
            .to.emit(priceOracle, "OwnershipTransferred")
            .withArgs(deployer.address, newOwner.address);
        });
      });
    });
  });

  describe("getUnderlyingPrice", () => {
    // everything must return 1e36 - base units

    beforeEach(async () => {
      ({ priceOracle, deployer } = await setup({
        isMockedView: false,
      }));
    });

    it("should return reported ETH price", async () => {
      const ethCToken = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";
      const formattedPrice = BigNumber.from("181217576125").mul(exp(1, 10));
      expect(await priceOracle.getUnderlyingPrice(ethCToken)).to.equal(
        formattedPrice
      );
    });
    it("should revert for missing config", async () => {
      const invalidCToken = "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC";
      expect(priceOracle.getUnderlyingPrice(invalidCToken)).to.be.revertedWith(
        "ConfigNotFound"
      );
    });
  });
  describe("addConfig", () => {
    // everything must return 1e36 - base units

    beforeEach(async () => {
      ({ priceOracle, deployer } = await setup({
        isMockedView: false,
      }));
    });

    it("should return success", async () => {
      const newConfig = {
        cToken: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
        baseUnit: "1000000",
        priceFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      };
      expect(await priceOracle.addConfig(newConfig))
        .to.emit(priceOracle, "PriceOracleAssetAdded")
        .withArgs(newConfig.cToken, newConfig.baseUnit, newConfig.priceFeed);
    });
    it("should revert for duplicate config", async () => {
      const dupeConfig = {
        cToken: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
        baseUnit: "1000000000000000000",
        priceFeed: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
      };

      expect(priceOracle.addConfig(dupeConfig)).to.be.revertedWith(
        "DuplicateConfig"
      );
    });
    it("should revert for invalid config", async () => {
      const invalidConfig = {
        cToken: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
        baseUnit: "0",
        priceFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      };

      expect(priceOracle.addConfig(invalidConfig)).to.be.revertedWith(
        "InvalidBaseUnit"
      );
    });
  });
  describe("updateConfigPriceFeed", () => {
    // everything must return 1e36 - base units

    beforeEach(async () => {
      ({ priceOracle, deployer } = await setup({
        isMockedView: false,
      }));
    });

    it("should return success", async () => {
      const existingConfig = configs[0];
      const newPriceFeed = "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6";
      expect(
        await priceOracle.updateConfigPriceFeed(
          existingConfig.cToken,
          newPriceFeed
        )
      )
        .to.emit(priceOracle, "PriceOracleAssetPriceFeedUpdated")
        .withArgs(
          existingConfig.cToken,
          existingConfig.priceFeed,
          newPriceFeed
        );
    });
    it("should revert for resetting same price feed", async () => {
      const existingConfig = configs[0];

      expect(
        priceOracle.updateConfigPriceFeed(
          existingConfig.cToken,
          existingConfig.priceFeed
        )
      ).to.be.revertedWith("UnchangedPriceFeed");
    });
    it("should revert for missing config", async () => {
      const missingCToken = "0x39AA39c021dfbaE8faC545936693aC917d5E7563";
      const priceFeed = "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6";

      expect(
        priceOracle.updateConfigPriceFeed(missingCToken, priceFeed)
      ).to.be.revertedWith("ConfigNotFound");
    });
  });
  describe("removeConfig", () => {
    // everything must return 1e36 - base units

    beforeEach(async () => {
      ({ priceOracle, deployer } = await setup({
        isMockedView: false,
      }));
    });

    it("should return success", async () => {
      const existingConfig = configs[0];
      expect(await priceOracle.removeConfig(existingConfig.cToken))
        .to.emit(priceOracle, "PriceOracleAssetRemoved")
        .withArgs(
          existingConfig.cToken,
          existingConfig.baseUnit,
          existingConfig.priceFeed
        );
    });
    it("should revert for missing config", async () => {
      const missingCToken = "0x39AA39c021dfbaE8faC545936693aC917d5E7563";

      expect(priceOracle.removeConfig(missingCToken)).to.be.revertedWith(
        "ConfigNotFound"
      );
    });
  });
});
