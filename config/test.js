const Web3 = require('web3');
const ganache = require('ganache-core');

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5
}

async function getWeb3() {
  console.log("loading test web3...");
  return new Web3(ganache.provider(), undefined, options);
}

module.exports = {
	getWeb3
};
