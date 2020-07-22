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
  let argsEncoded = args.map((arg) => {
    return typeof(arg) === 'bigint' ? arg.toString() : arg;
  });

  let abi = {
    name: sig.split('(')[0],
    type: 'function',
    inputs: types.map((type) => ({ name: '', type }))
  };

  const callData =
    (<any>AbiCoder).encodeFunctionCall(abi, argsEncoded).slice(2);

  return [types, callData];
}

export function encode(sig: string, args: any[]): string {
  let [types, callData] = encodeFull(sig, args);

  return callData;
}

export async function read(address: string, sig: string, args: any[], returns: string | string[], web3: Web3): Promise<any> {
  let [types, callData] = encodeFull(sig, args);

  const call = <TransactionConfig>{
    data: callData,
    // Price open oracle data
    to: address
  };

  try {
    const result = await web3.eth.call(call);

    if (Array.isArray(returns)) {
      return (<any>AbiCoder).decodeParameters(returns, result);
    } else {
      return (<any>AbiCoder).decodeParameter(returns, result);
    }
  } catch (e) {
    console.error(`Error reading ${sig}:${args} at ${address}: ${e.toString()}`);
    throw e;
  }
}

export async function write(address: string, sig: string, args: any[], from: string, web3: Web3): Promise<any> {
  let [types, callData] = encodeFull(sig, args);

  const call = <TransactionConfig>{
    data: callData,
    // Price open oracle data
    to: address,
    from
  };

  try {
    const gasPrice = await web3.eth.getGasPrice();
    let gasEstimate;
    try {
      gasEstimate = Math.floor(await web3.eth.estimateGas(call) * 1.5);
    } catch (e) {
      console.error(`Error estimating gas: ${e.toString()}`);
      if (process.env['ALLOW_ERRORS']) {
        gasEstimate = 500_000; // TODO: Default gas limit?
      } else {
        throw e;
      }
    }

    return await web3.eth.sendTransaction({
      ...call,
      gasPrice,
      gas: gasEstimate
    });
  } catch (e) {
    console.error(`Error writing ${sig}:${args} at ${address}: ${e.toString()}`);
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

export function root(val: bigint, k: bigint) {
    let o = 0n; // old approx value
    let x = val;
    let limit = 100n;

    while (x ** k != k && x != o && --limit) {
      o = x;
      x = ( (k - 1n) * x + val / x ** (k - 1n) ) / k;
    }

    return x;
}

export const sqrt = (x: bigint) => root(x, 2n);

export function bnToBigInt(val: any): bigint {
  return BigInt(val.toString());
}

export const maxUint = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
