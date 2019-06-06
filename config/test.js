const Web3 = require('web3');

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5
}

async function loadWeb3() {
  console.log("loading test web3...");
  return new Web3(ganache.provider(), undefined, options);
}

export default loadWeb3;
