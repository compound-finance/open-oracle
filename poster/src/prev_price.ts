import Web3 from 'web3';
import { read } from './util';

export async function getPreviousPrice(sourceAddress: string, asset: string, dataAddress: string, web3: Web3) {
  return await read(
    dataAddress,
    'getPrice(address,string)',
    [sourceAddress, asset.toUpperCase()],
    'uint256',
    web3
  );
}

export async function getDataAddress(viewAddress: string, web3: Web3) {
  return await read(
    viewAddress,
    'priceData()',
    [],
    'address',
    web3
  );
}

export async function getSourceAddress(dataAddress: string, message: string, signature: string, web3 : Web3) {
  return await read(
    dataAddress,
    'source(bytes,bytes)',
    [message, signature],
    'address',
    web3
  );
}
