const hre = require("hardhat");
const params = require("../configuration/parameters");

async function main() {
  const UAV = await hre.ethers.getContractFactory("UniswapAnchoredView");
  const uav = await UAV.deploy(params[0], params[1], params[2], {gasLimit: 9000000})
  await uav.deployed();
  console.log("UAV deployed to: ", uav.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });