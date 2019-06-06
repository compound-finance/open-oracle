const Web3 = require('web3');
const {chooseProvider} = require('../.tsbuilt/config');

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5
}

async function getWeb3() {
  return new Web3(chooseProvider('http://127.0.0.1:8545'), undefined, options);
}

async function getAccount(web3) {
  let [account, ...accounts] = await web3.eth.getAccounts();

  return account;
}

module.exports = {
  getWeb3,
  getAccount
};
