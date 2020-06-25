import { postWithRetries } from './post_with_retries';
import fetch from 'node-fetch';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import AbiCoder from 'web3-eth-abi';
import { getDataAddress, getPreviousPrice, getSourceAddress } from './prev_price';
import { BigNumber as BN } from 'bignumber.js';

async function main(sources : string,
                    senderKey : string,
                    viewAddress : string,
                    functionSig : string,
                    gas: number,
                    delta: number,
                    assets: string,
                    web3 : Web3) {
  const payloads = await fetchPayloads(sources.split(","));
  const dataAddress = await getDataAddress(viewAddress, web3);
  const supportedAssets = assets.split(",");

  await Promise.all(payloads.map(async payload => {
    const sourceAddress = await getSourceAddress(dataAddress, payload.messages[0], payload.signatures[0], web3);
    
    const filteredPrices = {};
    const filteredMessages: string[] = [];
    const filteredSignatures: string[] = [];
    let index = 0;
    for (const [asset, price] of Object.entries(payload.prices)) {
      // Post only prices for supported assets
      if (!supportedAssets.includes(asset)) continue;
      const prev_price = await getPreviousPrice(sourceAddress, asset, dataAddress, web3);
      console.log(`For asset ${asset}: prev price = ${prev_price}, new price = ${price}`);

      // Update price if new price is different by more than delta % from previous price
      // Update all asset prices if only 1 asset price is different
      if (!inDeltaRange(delta, Number(price), prev_price)) {
        filteredPrices[asset] = price;
        filteredMessages.push(payload.messages[index]);
        filteredSignatures.push(payload.signatures[index]);
      }
      index++;
    }
    payload.prices = filteredPrices;
    payload.messages = filteredMessages;
    payload.signatures = filteredSignatures;
  }))

  // Filter payloads with no prices for an update
  const filteredPayloads = payloads.filter(payload => payload.messages.length > 0);
  if (filteredPayloads.length != 0) {
    const gasPrice = await fetchGasPrice();
    const trxData = buildTrxData(filteredPayloads, functionSig);

    const trx = <TransactionConfig>{
      data: trxData,
      to: viewAddress,
      gasPrice: gasPrice,
      gas: gas
    }

    return await postWithRetries(trx, senderKey, web3);
  }
}

// If new price is less that delta percent different form the old price, do not post new price
function inDeltaRange(delta:number, price: number, prev_price: number) {
  // Always update prices if delta is set to 0 or delta is not within expected range [0..100]%
   if (delta <= 0 || delta > 100) return false;

   const minDifference = new BN(prev_price).multipliedBy(delta).dividedBy(100);
   const difference = new BN(prev_price).minus(new BN(price).multipliedBy(1e6)).abs();
   return difference.isLessThanOrEqualTo(minDifference);
}

async function fetchPayloads(sources : string[], fetchFn=fetch) : Promise<DelFiReporterPayload[]> {
  let sourcePromises = sources.map(async (source) => {
    try {
      let response;
      if(source == "https://api.pro.coinbase.com/oracle") {
        const crypto = require('crypto');

        const key_id = <string>process.env.API_KEY_ID;
        const secret = <string>process.env.API_SECRET;
        const passphrase = <string>process.env.API_PASSPHRASE;


        let timestamp = Date.now() / 1000;

        let method = 'GET';

        // create the prehash string by concatenating required parts
        let what = timestamp + method + "/oracle";

        // decode the base64 secret
        let key =  Buffer.from(secret, 'base64');

        // create a sha256 hmac with the secret
        let hmac = crypto.createHmac('sha256', key);

        // sign the require message with the hmac
        // and finally base64 encode the result
        let signature = hmac.update(what).digest('base64');
        let headers = {
          'CB-ACCESS-KEY': key_id,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'CB-ACCESS-PASSPHRASE': passphrase,
          'Content-Type': 'application/json'
        }

        response = await fetchFn(source, {
          headers: headers
        })

      } else {
        response = await fetchFn(source);
      }
      return response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  return (await Promise.all(sourcePromises)).filter(x => x != null);
}

async function fetchGasPrice(fetchFn=fetch) : Promise<number> {
  try {
    let source = "https://api.compound.finance/api/gas_prices/get_gas_price";
    let response = await fetchFn(source);
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

  console.log("payloads = ", payloads);
  let messages = payloads.reduce((a: string[], x) => a.concat(x.messages), []);
  let signatures = payloads.reduce((a: string[], x) => a.concat(x.signatures), []);
  let priceKeys = payloads.map(x => Object.keys(x.prices));
  let symbols = new Set(priceKeys.reduce((acc, val) => acc.concat(val)));
  let upperCaseDeDuped = [...symbols].map((x) => x.toUpperCase())

  // see https://github.com/ethereum/web3.js/blob/2.x/packages/web3-eth-abi/src/AbiCoder.js#L112
  return (<any>AbiCoder).encodeFunctionSignature(functionSig) +
         (<any>AbiCoder)
           .encodeParameters(types, [messages, signatures, [...upperCaseDeDuped]])
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
  main,
  inDeltaRange
}
