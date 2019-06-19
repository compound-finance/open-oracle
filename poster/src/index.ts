import {postWithRetries} from './postWithRetries';
import fetch from 'node-fetch';
import AbiCoder from 'web3-eth-abi';

async function main () {
  const viewAddress = getEnvVar("view-address");
  const senderKey = getEnvVar("poster-key");
  const sources = getEnvVar("sources").split(",");
  const functionName = getEnvVar("view-function-name");

  const payloads = await fetchPayloads(sources);
  const gasPrice = await fetchGasPrice();
  const trxData = buildTrxData(payloads, functionName);

  const trx = <Trx> {
    data: trxData,
    to: viewAddress,
    gasPrice: gasPrice,
    gas: 1_000_000
  }

  return postWithRetries(trx, senderKey);
}

async function fetchPayloads(sources : string[]) : Promise<OpenOraclePayload[]> {
  let sourcePromises = sources.map(async (source) => {
    let response = await fetch(source);
    return response.json();
  });

  return await Promise.all(sourcePromises)
}

async function fetchGasPrice() : Promise<number> {
  let source = "https://api.compound.finance/api/gas_prices/get_gas_price";
  let response = await fetch(source);
  let prices = await response.json();
  let averagePrice = Number(prices["average"]["value"]);
  return averagePrice;
}

function buildTrxData(payloads : OpenOraclePayload[], functionName : string) : string {
  const types = findTypes(functionName);

  let messages = payloads.map(x => x.message);
  let signatures = payloads.map(x => x.signature);

  // see https://github.com/ethereum/web3.js/blob/2.x/packages/web3-eth-abi/src/AbiCoder.js#L112
  return AbiCoder.encodeFunctionSignature(functionName) +
    AbiCoder
    .encodeParameters(types, [messages, signatures])
    .replace('0x', '');
}

function findTypes(functionName : string) : string[] {
  let start = functionName.indexOf("(") + 1;
  let types = functionName
    .slice(start, functionName.lastIndexOf(")"))
    .split(",");
  return types
}

function getEnvVar(name : string, env? : Env): string {
  const theEnv = env !== undefined ? env : process.env;

  const result: string | undefined = theEnv[name];

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
  fetchPayloads
}
