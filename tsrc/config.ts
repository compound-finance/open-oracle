import Web3 from 'web3';
import * as fs from 'fs';
import * as path from 'path';
import {readFile} from './file';

export interface Config {
  network: string
}

export async function getKeyword(keyword, file) {
  const kwVal = process.env[keyword];
  if (kwVal) {
    return kwVal;
  }

  const kwUpperVal = process.env[keyword.toUpperCase()];
  if (kwUpperVal) {
    return kwUpperVal;
  }

  const networksHome = process.env['ETHEREUM_NETWORKS_HOME'];
  if (networksHome && file) {
    try {
      // Try to read from file
      const networkPathResolved = path.join(fs.realpathSync(networksHome), file);
      return await readFile(networkPathResolved, null, contents => contents.trim());
    } catch (e) {
      // File does not exist or is inaccessible
    }
  }

  return null;
}

export async function loadConfig(network: string): Promise<Config> {
  return {
    network: network
  };
}

export async function loadWeb3(config: Config): Promise<Web3> {
  const fn: any = await import(path.join(process.cwd(), 'config', config.network));

  return await fn.getWeb3();
}

export async function loadAccount(config: Config, web3: Web3): Promise<string> {
  const fn: any = await import(path.join(process.cwd(), 'config', config.network));

  return await fn.getAccount(web3);
}
