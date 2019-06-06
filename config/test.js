const Web3 = require('web3');
const ganache = require('ganache-core');

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5
}

async function getWeb3() {
  console.log("loading test web3...");
  return new Web3(process.env['provider'] || Web3.givenProvider || ganache.provider(), undefined, options);
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
