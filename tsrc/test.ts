import Web3 from 'web3';
import {loadConfig, loadWeb3, loadAccount} from './config';
import {deployContract} from './contract';
import {Contract} from 'web3-eth-contract';

// let web3; // share web3 amoung tests
// let account; // share primary account

let saddle;

async function configure() {
  let config = await loadConfig("test");
  let web3 = await loadWeb3(config);
  let account = loadAccount(config, web3);

  async function deploy(contract: string, args: any[]): Promise<Contract> {
    console.log(["Deploying", contract, args]);

    return deployContract(web3, config.network, await account, contract, args);
  }

  saddle = {
    account,
    deploy,
    web3
  };
}

global['beforeAll'](configure);
global['beforeEach'](() => {
  console.log("starting test");
  global['saddle'] = saddle;
});
global['afterEach'](() => {
  console.log("ending test");
});