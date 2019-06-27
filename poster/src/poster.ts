import {postWithRetries} from './postWithRetries';
import fetch from 'node-fetch';
import Web3 from 'web3';
import {AbiCoder} from 'web3-eth-abi';
import {TransactionConfig} from 'web3-core';

async function main(sources : string,
                    senderKey : string,
                    viewAddress : string,
                    functionSig : string,
                    web3 : Web3) {
  const payloads = await fetchPayloads(sources.split(","));
  const gasPrice = await fetchGasPrice();
  const trxData = buildTrxData(payloads, functionSig);

  const trx = <TransactionConfig> {
    data: trxData,
    to: viewAddress,
    gasPrice: gasPrice,
    gas: 1_000_000
  }

  return await postWithRetries(trx, senderKey, web3);
}

async function fetchPayloads(sources : string[]) : Promise<DelFiReporterPayload[]> {
  let sourcePromises = sources.map(async (source) => {
    try {
      let response = await fetch(source);
      return response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  return (await Promise.all(sourcePromises)).filter(x => x != null);
}

async function fetchGasPrice() : Promise<number> {
  try {
    let source = "https://api.compound.finance/api/gas_prices/get_gas_price";
    let response = await fetch(source);
    let prices = await response.json();
    let averagePrice = Number(prices["average"]["value"]);
    return averagePrice;
  } catch (e) {
    // use 3 gwei if api is unreachable for some reason
    console.warn(`Failed to fetch gas price`, e);
    return 3_000_000_000;
  }
}

function buildTrxData(payloads : DelFiReporterPayload[], functionSig : string) : string {
  const types = findTypes(functionSig);

  let messages = payloads.map(x => x.message);
  let signatures = payloads.map(x => x.signature);
  let priceKeys = payloads.map(x => Object.keys(x.prices));
  let symbols = new Set(priceKeys.reduce((acc, val) => acc.concat(val)));

  // see https://github.com/ethereum/web3.js/blob/2.x/packages/web3-eth-abi/src/AbiCoder.js#L112
  const coder = new AbiCoder();
  return coder.encodeFunctionSignature(functionSig) +
    coder
    .encodeParameters(types, [messages, signatures, [...symbols]])
    .replace('0x', '');
}

// e.g. findTypes("postPrices(bytes[],bytes[],string[])")-> ["bytes[]","bytes[]","string[]"]
function findTypes(functionSig : string) : string[] {
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

function getEnvVar(name : string): string {
  const result: string | undefined = process.env[name];

  if (result) {
    return result;
  } else {
    throw `Missing required env var: ${name}`;
  }
}

export {
  buildTrxData,
  findTypes,
  fetchGasPrice,
  fetchPayloads,
  main
}
