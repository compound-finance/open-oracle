import {loadConfig, loadWeb3, loadAccount} from './config';
import {deployContract, saveContract} from './contract';

// TODO: Replace with real CLI parser
let network = process.env['network'];
let contractName = process.env['contract'];
if (network.trim() === "" || contractName.trim() === "") {
  throw "usage: yarn run saddle:deploy <network> <contract> ...args"
}

(async function () {
  let config = await loadConfig(network);
  let web3 = await loadWeb3(config);
  let account = await loadAccount(config, web3);

  let contract = await deployContract(web3, config.network, account, contractName, process.argv);
  await saveContract(contractName, contract, config.network);
})();
