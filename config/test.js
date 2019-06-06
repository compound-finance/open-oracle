const Web3 = require('web3');
const ganache = require('ganache-core');
const {chooseProvider} = require('../.tsbuilt/config');

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5
}

async function getWeb3() {
  return new Web3(chooseProvider(() => ganache.provider()), undefined, options);
}

async function getAccount(web3) {
  if (process.env['account']) {
    return process.env['account']
  } else {
    let [account, ...accounts] = await web3.eth.getAccounts();

    return account;
  }
}

module.exports = {
  getWeb3,
  getAccount
};
