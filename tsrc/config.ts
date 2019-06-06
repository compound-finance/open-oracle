import Web3 from 'web3';
import ganache from 'ganache-core';
import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  network: string
}

export async function loadConfig(network: string): Promise<Config> {
  return {
    network: network
  };
}

export async function loadWeb3(config: Config): Promise<Web3> {
  return await import(path.join(process.cwd(), 'config', config.network));
}

export async function loadAccount(config: Config, web3: Web3): Promise<string> {
  let [account, ...accounts] = await web3.eth.getAccounts();

  return account;
}
