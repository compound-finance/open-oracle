import AbiCoder from 'web3-eth-abi';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';

function encodeFull(sig: string, args: any[]): [string[], string] {
  const types = findTypes(sig);

  const callData =
    <string>(<any>AbiCoder).encodeFunctionSignature(sig) +
    <string>(<any>AbiCoder).encodeParameters(types, args).slice(2);

  return [types, callData];
}

export function encode(sig: string, args: any[]): string {
  let [types, callData] = encodeFull(sig, args);

  return callData;
}

export async function read(address: string, sig: string, args: any[], returns: string, web3: Web3): Promise<any> {
  let [types, callData] = encodeFull(sig, args);

  const call = <TransactionConfig>{
    data: callData,
    // Price open oracle data
    to: address
  };

  const result = await web3.eth.call(call);

  return (<any>AbiCoder).decodeParameter(returns, result);
}

// TODO: Swap with ether's own implementation of this
// e.g. findTypes("postPrices(bytes[],bytes[],string[])")-> ["bytes[]","bytes[]","string[]"]
export function findTypes(functionSig: string): string[] {
  // this unexported function from ethereumjs-abi is copy pasted from source
  // see https://github.com/ethereumjs/ethereumjs-abi/blob/master/lib/index.js#L81
  let parseSignature = function (sig) {
    var tmp = /^(\w+)\((.*)\)$/.exec(sig) || [];

    if (tmp.length !== 3) {
      throw new Error('Invalid method signature')
    }

    var args = /^(.+)\):\((.+)$/.exec(tmp[2])

    if (args !== null && args.length === 3) {
      return {
        method: tmp[1],
        args: args[1].split(','),
        retargs: args[2].split(',')
      }
    } else {
      var params = tmp[2].split(',')
      if (params.length === 1 && params[0] === '') {
        // Special-case (possibly naive) fixup for functions that take no arguments.
        // TODO: special cases are always bad, but this makes the function return
        // match what the calling functions expect
        params = []
      }
      return {
        method: tmp[1],
        args: params
      }
    }
  }

  return parseSignature(functionSig).args;
}
