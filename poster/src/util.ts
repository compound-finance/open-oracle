import AbiCoder from 'web3-eth-abi';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';

export function decodeMessage(message: string, web3: Web3): DecodedMessage {
  // TODO: Consider using `decode` from `reporter.ts`
  let {
    '0': dataType,
    '1': timestamp,
    '2': symbol,
    '3': price
  } = web3.eth.abi.decodeParameters(['string', 'uint64', 'string', 'uint64'], message);

  return {
    dataType,
    timestamp,
    symbol,
    price: price / 1e6
  };
}

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

  try {
    const result = await web3.eth.call(call);

    return (<any>AbiCoder).decodeParameter(returns, result);
  } catch (e) {
    console.error(`Error reading ${sig}:${args} at ${address}: ${e.toString()}`);
    throw e;
  }
}

export async function readMany(address: string, sig: string, args: any[], returns: string[], web3: Web3): Promise<any> {
  let [_, callData] = encodeFull(sig, args);

  const call = <TransactionConfig>{
    data: callData,
    // Price open oracle data
    to: address
  };

  try {
    const result = await web3.eth.call(call);

    return (<any>AbiCoder).decodeParameters(returns, result);
  } catch (e) {
    console.error(`Error reading ${sig}:${args} at ${address}: ${e.toString()}`);
    throw e;
  }
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

export function zip<T,U>(arr1: T[], arr2: U[]): [T, U][] {
  return arr1.map((k, i) => [k, arr2[i]])
}

export async function asyncFilter<T>(arr: T[], f: ((T) => Promise<boolean>)): Promise<T[]> {
  let tests: boolean[] = await Promise.all(arr.map(f));

  return tests.reduce<T[]>((acc, el, i) => {
    if (el) {
      return [...acc, arr[i]];
    } else {
      return acc;
    }
  }, []);
}

export async function allSuccesses<T>(promises: Promise<T>[]): Promise<T[]> {
  let settled = await Promise.allSettled(promises);

  return settled
    .filter((promise) => promise.status === 'fulfilled')
    .map((promise => (<PromiseFulfilledResult<T>>promise).value));
}
