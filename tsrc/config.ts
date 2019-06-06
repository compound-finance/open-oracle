import Web3 from 'web3';
import ganache from 'ganache-core';

export interface Config {
  network: string
}

export async function loadConfig(network: string): Promise<Config> {
  return {
    network: network
  };
}

export async function loadWeb3(config: Config): Promise<Web3> {
  if (config.network === 'test') {
    const options = {
      transactionConfirmationBlocks: 1,
      transactionBlockTimeout: 5
    }

    return new Web3(ganache.provider(), undefined, options);
  } else {
    const options = {
      transactionConfirmationBlocks: 1,
      transactionBlockTimeout: 5
    }

    return new Web3(Web3.givenProvider || 'http://127.0.0.1:8545', undefined, options);
  }
}

export async function loadAccount(config: Config, web3: Web3): Promise<string> {
  let [account, ...accounts] = await web3.eth.getAccounts();

  return account;
}
