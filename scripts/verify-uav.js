const hre = require("hardhat");
const uavConfiguration = require("../configuration/parameters");
const uavABI = require("../artifacts/contracts/Uniswap/UniswapAnchoredView.sol/UniswapAnchoredView.json");
const { ethers } = require("hardhat");

const RPC_URL = process.env.RPC_URL;
const PRODUCTION_UAV_ADDR = "0x65c816077c29b557bee980ae3cc2dce80204a0c5";
const PROPOSED_UAV_ADDR = "0xAd47d5A59B6d1Ca4DC3EbD53693fdA7d7449f165";
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
const proposedUAV = new hre.ethers.Contract(
  PROPOSED_UAV_ADDR,
  uavABI.abi,
  provider
);

async function main() {
  for (const { cToken: cTokenAddr } of tokenConfigs) {
    const checksumCTokenAddr = ethers.utils.getAddress(cTokenAddr);
    const cToken = new hre.ethers.Contract(
      checksumCTokenAddr,
      cTokenABI,
      provider
    );
    const cTokenSymbol = await cToken.symbol();

    console.log(
      `Comparing prices for cToken ${cTokenSymbol} with address ${checksumCTokenAddr}`
    );
    const prodUAVPrice = await fetchUnderlyingPrice(
      prodUAV,
      checksumCTokenAddr,
      cTokenSymbol
    );
    const proposedUAVPrice = await fetchUnderlyingPrice(
      proposedUAV,
      checksumCTokenAddr,
      cTokenSymbol
    );

    if (!prodUAVPrice.eq(proposedUAVPrice)) {
      const errorMsg = `Price mismatch for ${cTokenSymbol}!  Prod UAV Price: ${prodUAVPrice.toString()} Proposed UAV Price: ${proposedUAVPrice.toString()}`;
      throw new Error(errorMsg);
    }
  }

  console.log(
    `New UAV deployment at ${PROPOSED_UAV_ADDR} passed all checks with the production UAV at ${PRODUCTION_UAV_ADDR}!`
  );
}

async function fetchUnderlyingPrice(uavContract, cTokenAddr, cTokenSymbol) {
  try {
    return await uavContract.getUnderlyingPrice(cTokenAddr);
  } catch (e) {
    const label =
      uavContract.address === PROPOSED_UAV_ADDR ? "PROPOSED" : "PRODUCTION";
    throw new Error(
      `Call to getUnderlyingPrice(${cTokenAddr}) for cToken ${cTokenSymbol} to ${label} UAV at address ${uavContract.address} reverted!`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
