const Web3 = require('web3');

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5
}

async function loadWeb3() {
  console.log("loading development web3...");
  return new Web3(Web3.givenProvider || 'http://127.0.0.1:8545', undefined, options);
}

export default loadWeb3;
