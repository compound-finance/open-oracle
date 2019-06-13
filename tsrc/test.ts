import Web3 from 'web3';
import {loadConfig, loadWeb3, loadAccount} from './config';
import {deployContract} from './contract';
import {Contract} from 'web3-eth-contract';

import expect from 'expect';

export async function configure(network = 'test') {
  let config = await loadConfig(network);
  let web3 = await loadWeb3(config);
  console.log(`Using network ${network} ${web3.currentProvider.host}`);

  let account = await loadAccount(config, web3);

  function address(n) {
    return `0x${(n).toString(16).padStart(40, '0')}`;
  }

  function bytes(str) {
    return web3.eth.abi.encodeParameter('string', str);
  }

  function uint256(int) {
    return web3.eth.abi.encodeParameter('uint256', int);
  }

  // XXX shared lib?
  function encode(timestamp, pairs) {
    return web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [timestamp, pairs.map(([k, v]) => {
      return web3.eth.abi.encodeParameters(['bytes', 'bytes'], [k, v])
    })]);
  }

  // XXX maybe want to import signing here, shared with sdk, define there or at top level?
  function sign(message, privateKey) {
    const hash = web3.utils.keccak256(message);
    const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
    const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
    const signatory = web3.eth.accounts.recover(hash, v, r, s);
    return {hash, message, signature, signatory};
  }

  expect.extend({
    numEquals(actual, expected) {
      return {
        pass: actual.toString() == expected.toString(),
        message: () => `expected ${JSON.stringify(actual)} == ${JSON.stringify(expected)}`
      }
    }
  });

  async function deploy(contract: string, args: any[]): Promise<Contract> {
    console.log(["Deploying", contract, args]);

    return deployContract(web3, config.network, account, contract, args);
  }

  return global['saddle'] = {
    account,
    address,
    bytes,
    uint256,
    deploy,
    encode,
    sign,
    web3
  };
}

if (global['beforeAll']) {
  global['beforeAll'](configure);
}