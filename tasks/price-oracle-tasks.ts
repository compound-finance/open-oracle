import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import parametersMainnet from "../configuration/parameters-price-oracle";

// Ignore pairs that are not configured
const IGNORED_PAIRS = ["cREP", "cFEI"];

// Prints the price returned by the UAV and Price Oracle if not equal.
// The price returned by the new contract can differ from the UAV without the Uniswap anchor
// so a manually inspection of the prices are necessary
export async function compareUavAndPriceOracle(
  arg: {
    production: string;
    proposed: string;
  },
  hre: HardhatRuntimeEnvironment
) {
  const PRODUCTION_UAV_ADDR = arg.production;
  const PROPOSED_PRICE_ORACLE_ADDR = arg.proposed;
  const RPC_URL = process.env.MAINNET_URL;

  const uavConfiguration = require("../configuration/parameters");
  const uavABI = require("../artifacts/contracts/Uniswap/UniswapAnchoredView.sol/UniswapAnchoredView.json");
  const priceOracleABI = require("../artifacts/contracts/PriceOracle/PriceOracle.sol/PriceOracle.json");

  const cTokenABI = [
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  const [_, __, tokenConfigs] = uavConfiguration;
  if (!RPC_URL) {
    throw new Error("RPC URL Cannot be empty");
  }
  const provider = new hre.ethers.providers.JsonRpcProvider(RPC_URL);
  const prodUAV = new hre.ethers.Contract(
    PRODUCTION_UAV_ADDR,
    uavABI.abi,
    provider
  );
  const proposedPriceOracle = new hre.ethers.Contract(
    PROPOSED_PRICE_ORACLE_ADDR,
    priceOracleABI.abi,
    provider
  );

  for (const { cToken: cTokenAddr } of tokenConfigs) {
    const checksumCTokenAddr = hre.ethers.utils.getAddress(cTokenAddr);
    const cToken = new hre.ethers.Contract(
      checksumCTokenAddr,
      cTokenABI,
      provider
    );
    const cTokenSymbol = await cToken.symbol();

    if (IGNORED_PAIRS.indexOf(cTokenSymbol) !== -1) {
      console.log(`Skipping check for ${cTokenSymbol}`);
      continue;
    }

    console.log(
      `Comparing prices for cToken ${cTokenSymbol} with address ${checksumCTokenAddr}`
    );
    const [prodUAVPrice, proposedPriceOraclePrice] = await Promise.all([
      fetchUnderlyingPrice(prodUAV, checksumCTokenAddr, PRODUCTION_UAV_ADDR),
      fetchUnderlyingPrice(
        proposedPriceOracle,
        checksumCTokenAddr,
        PROPOSED_PRICE_ORACLE_ADDR
      ),
    ]);

    if (!prodUAVPrice.eq(proposedPriceOraclePrice)) {
      console.log(
        `Prod UAV price: $${prodUAVPrice}. Proposed Price Oracle price: $${proposedPriceOraclePrice}`
      );
      continue;
    }
    console.log(
      `Underlying prices for ${cTokenSymbol} match: $${proposedPriceOraclePrice}`
    );
  }
}

async function fetchUnderlyingPrice(
  contract: ethers.Contract,
  cTokenAddr: string,
  proposedUAVAddr: string
) {
  try {
    return await contract.getUnderlyingPrice(cTokenAddr);
  } catch (e) {
    const label =
      contract.address === proposedUAVAddr ? "PROPOSED" : "PRODUCTION";
    throw new Error(
      `Call to getUnderlyingPrice(${cTokenAddr}) to ${label} at address ${contract.address} reverted!`
    );
  }
}

export async function deployPriceOracle(
  _: any,
  hre: HardhatRuntimeEnvironment
) {
  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  let parameters;
  if (hre.network.name === "mainnet" || hre.network.name === "hardhat") {
    parameters = parametersMainnet;
  } else {
    throw Error("Invalid network");
  }
  const priceOracle = await PriceOracle.deploy(parameters, {
    gasLimit: 9000000,
  });
  await priceOracle.deployed();
  console.log("PriceOracle deployed to: ", priceOracle.address);
}
