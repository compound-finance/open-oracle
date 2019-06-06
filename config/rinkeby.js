const Web3 = require('web3');
const {getKeyword} = require('../.tsbuilt/config');

async function getProvider(network) {
  const networkProviderUrl = await getKeyword('provider', `${network}-url`) || `http://${network}.infura.io`;
  const privateKeyHex = await getKeyword('private_key', network);
  console.log([networkProviderUrl, privateKeyHex]);

  if (privateKeyHex) {
    return new WalletProvider(privateKeyHex, networkProviderUrl)
  } else {
    return networkProviderUrl; // http provider
  }
}

async function getWeb3() {
  // Defaults here are a bit high? But deploying contracts is expensive.
  let defaultGas = Number(await getKeyword('gas') || 6600000);
  let defaultGasPrice = Number(await getKeyword('gas_price') || 15000000000); // 15 gwei

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
