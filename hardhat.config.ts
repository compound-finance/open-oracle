import * as fs from "fs";
import * as path from "path";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import { task, HardhatUserConfig } from "hardhat/config";
require("dotenv").config();

const MAINNET_URL = process.env.MAINNET_URL!;
const MAINNET_PK = process.env.MAINNET_PK!;
const ETHERSCAN = process.env.ETHERSCAN!;
const COMP_MULTISIG = process.env.COMP_MULTISIG!;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

function ensureDirectoryExistence(filePath: string) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
  return true;
}

task(
  "manual-verify",
  "Generate the input JSON required to verify the UAV through the Etherscan UI"
).setAction(async (args, hre) => {
  const buildInfoPaths = await hre.artifacts.getBuildInfoPaths();
  const buildInfo = require(buildInfoPaths[0]);
  const localOutputPath = "/etherscan/verify.json";
  const fullOutputPath = hre.config.paths.root + localOutputPath;
  const outputData = JSON.stringify(buildInfo.input, null, 2);
  ensureDirectoryExistence(fullOutputPath);
  fs.writeFileSync(fullOutputPath, outputData);
  console.log("Etherscan verification JSON written to " + localOutputPath);
});

task("transfer-ownership", "Transfer ownership of the UAV to the COMP multisig")
  .addParam("uav", "Deployed UAV address")
  .setAction(async (args, hre) => {
    const UAV = await hre.ethers.getContractFactory("UniswapAnchoredView");
    const uav = await UAV.attach(args.uav);
    await uav.transferOwnership(COMP_MULTISIG);
  });

const hardhatUserConfig: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_URL,
        blockNumber: 13152450,
      },
      accounts: [
        {
          privateKey: MAINNET_PK,
          balance: "1000009583538498497992",
        },
      ],
    },
    mainnet: {
      url: MAINNET_URL,
      accounts: [MAINNET_PK],
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN,
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

module.exports = hardhatUserConfig;
