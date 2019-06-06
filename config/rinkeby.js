const Web3 = require('web3');
const {getKeyword} = require('../.tsbuilt/config');
const HDWalletProvider = require("truffle-hdwallet-provider");

async function getProvider(network) {
  const networkProviderUrl = await getKeyword('provider', `${network}-url`) || `http://${network}.infura.io`;
  const privateKeyHex = await getKeyword('private_key', network);

  if (privateKeyHex) {
    return new HDWalletProvider(privateKeyHex, networkProviderUrl)
  } else {
    return networkProviderUrl; // http provider
  }
}

async function getWeb3() {
  // Defaults here are a bit high? But deploying contracts is expensive.
  let defaultGas = Number(await getKeyword('gas') || 4600000);
  let defaultGasPrice = Number(await getKeyword('gas_price') || 12000000000); // 12 gwei

  return new Web3(await getProvider('rinkeby'), undefined, {defaultGas, defaultGasPrice});
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
