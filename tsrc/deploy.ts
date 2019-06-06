import {loadConfig, loadWeb3, loadAccount} from './config';
import {deployContract, saveContract} from './contract';
import yargs from 'yargs';

const argv = yargs
    .option('network', {alias: 'n', description: 'Chosen network', type: 'string', default: 'development'})
    .help()
    .alias('help', 'h')
    .argv;

const [contractName, ...contractArgs] = argv._;

if (!contractName || contractName.trim() === "") {
  throw "Please specify a contract to deploy.";
}

(async function () {
  let config = await loadConfig(argv.network);
  let web3 = await loadWeb3(config);
  console.log(web3.currentProvider);
  console.log(`Using network ${argv.network} ${web3.currentProvider.host}`);

  let account = await loadAccount(config, web3);
  console.log(`Deploying contract ${contractName} with args ${JSON.stringify(contractArgs)}`);

  let contract = await deployContract(web3, config.network, account, contractName, contractArgs);
  await saveContract(contractName, contract, config.network);

  console.log(`Deployed ${contractName} at ${contract.address}`);
})();
