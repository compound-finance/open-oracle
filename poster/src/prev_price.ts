import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import AbiCoder from 'web3-eth-abi';
import { findTypes } from './poster';

async function getPreviousPrice(sourceAddress: string, asset: string, dataAddress: string, web3 : Web3) {
    const functionSig = 'getPrice(address,string)';
    const types = findTypes(functionSig);
  
    const callData = (<any>AbiCoder).encodeFunctionSignature(functionSig) +
           (<any>AbiCoder)
             .encodeParameters(types, [sourceAddress, asset.toUpperCase()])
             .replace('0x', '');
    const call = <TransactionConfig> {
      data: callData,
      //Price open oracle data
      to: dataAddress
    }
    const price = web3.utils.hexToNumber(await web3.eth.call(call));
    console.log(`Previous price of ${asset.toUpperCase()} for source ${sourceAddress} = ${price}`);
    return price;
  }
  
  async function getDataAddress(viewAddress: string, web3: Web3) {
    const callData = (<any>AbiCoder).encodeFunctionSignature('data()') 
    const call = <TransactionConfig> {
      data: callData,
      to: viewAddress
    }
    return web3.eth.abi.decodeParameter('address', await web3.eth.call(call)).toString();
  }
  
  async function getSourceAddress(dataAddress: string, message: string, signature: string, web3 : Web3) {
    const functionSig = 'source(bytes,bytes)';
    const types = findTypes(functionSig);
  
    const callData = (<any>AbiCoder).encodeFunctionSignature(functionSig) +
           (<any>AbiCoder)
             .encodeParameters(types, [message, signature])
             .replace('0x', '');
    const call = <TransactionConfig> {
      data: callData,
      //Price open oracle data
      to: dataAddress
    }
    return web3.eth.abi.decodeParameter('address', await web3.eth.call(call)).toString();
  }

  export {
   getPreviousPrice, 
   getSourceAddress, 
   getDataAddress
  }
  