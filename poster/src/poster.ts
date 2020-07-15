import { postWithRetries } from './post_with_retries';
import fetch from 'node-fetch';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import {
  getDataAddress,
  getPreviousPrice,
  getSourceAddress
} from './prev_price';
import { BigNumber as BN } from 'bignumber.js';
import { readCoinbasePayload } from './sources/coinbase';
import { encode } from './util';

const GAS_PRICE_API = 'https://api.compound.finance/api/gas_prices/get_gas_price';
const DEFAULT_GAS_PRICE = 3_000_000_000; // use 3 gwei if api is unreachable for some reason

export async function main(
    sources: string[],
    senderKey: string,
    viewAddress: string,
    functionSig: string,
    gas: number,
    delta: number,
    assets: string[],
    web3: Web3) {

  const payloads = await fetchPayloads(sources);
  const filteredPayloads = await filterPayloads(payloads, viewAddress, assets, delta, web3);

  if (filteredPayloads.length > 0) {
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

export async function filterPayloads(
    payloads: OpenPriceFeedPayload[],
    viewAddress: string,
    supportedAssets: string[],
    delta: number,
    web3: Web3): Promise<OpenPriceFeedPayload[]> {

  const dataAddress = await getDataAddress(viewAddress, web3);

  let filteredPayloads = await Promise.all(payloads.map(async payload => {
    let sourceAddresses = await Promise.all(payload.messages.map((_, i) => {
      return getSourceAddress(dataAddress, payload.messages[0], payload.signatures[0], web3);
    }));

    if ([...new Set(sourceAddresses)].length !== 1) {
      throw new Error(`Invalid source addresses, got: ${JSON.stringify(sourceAddresses)}`);
    }
    const sourceAddress = sourceAddresses[0]; // We proved they all match this single address

    return await Object.entries(payload.prices).reduce<Promise<OpenPriceFeedPayload>>(async (accP, [asset, priceRaw]: [string, string], index: number) => {
      let acc = await accP;
      let price = Number(priceRaw);

      if (supportedAssets.includes(asset.toUpperCase())) {
        const prevPrice = await getPreviousPrice(sourceAddress, asset, dataAddress, web3);

        console.debug(`Previous Price Data: asset=${asset}, prev_price=${prevPrice}, new_price=${price}`);

        // Update price only if new price is different by more than delta % from the previous price
        if (!inDeltaRange(delta, price, prevPrice)) {
          console.log(`Setting Price: asset=${asset}, price=${price}, prev_price=${prevPrice}`);

          return {
            prices: {
              ...acc.prices,
              [asset]: priceRaw
            },
            messages: [...acc.messages, payload.messages[index]],
            signatures: [...acc.signatures, payload.signatures[index]]
          };
        } else {
          return acc;
        }
      } else {
        // Post only prices for supported assets, skip prices for unregistered assets
        console.debug(`Skipping ${asset} as not part of supported assets: ${JSON.stringify(supportedAssets)}`);

        return acc;
      }
    }, Promise.resolve({ prices: {}, messages: [], signatures: [] }));
  }));

  return filteredPayloads.filter(payload => payload.messages.length > 0);
}

// Checks if new price is less than delta percent different form the old price
// Note TODO: price here is uh... a number that needs to be scaled by 1e6?
export function inDeltaRange(delta: number, price: number, prevPrice: number) {
  // Always update prices if delta is set to 0 or delta is not within expected range [0..100]%
  if (delta <= 0 || delta > 100) {
    return false
  };

  const minDifference = new BN(prevPrice).multipliedBy(delta).dividedBy(100);
  const difference = new BN(prevPrice).minus(new BN(price).multipliedBy(1e6)).abs();

  return difference.isLessThanOrEqualTo(minDifference);
}

export async function fetchPayloads(sources: string[], fetchFn=fetch): Promise<OpenPriceFeedPayload[]> {
  let promises = await Promise.allSettled(sources.map(async (sourceRaw) => {
    let source = sourceRaw.includes('{') ? JSON.parse(sourceRaw) : sourceRaw;

    try {
      let response;
      if (typeof(source) === 'string') {
        response = await fetchFn(source);
      } else if (source.source === 'coinbase') {
        response = readCoinbasePayload(source, fetchFn);
      }

      return response.json();
    } catch (e) {
      // This is now just for some extra debugging messages
      console.error("Error Fetching Payload for ${source}")
      console.error(e);
      throw e;
    }
  }, []));

  return promises
    .filter((promise) => promise.status === 'fulfilled')
    .map((promise => (<PromiseFulfilledResult<OpenPriceFeedPayload>>promise).value));
}

export async function fetchGasPrice(fetchFn = fetch): Promise<number> {
  try {
    let response = await fetchFn(GAS_PRICE_API);
    let prices = await response.json();
    return Number(prices["average"]["value"]);
  } catch (e) {
    console.warn(`Failed to fetch gas price`, e);
    return DEFAULT_GAS_PRICE;
  }
}

export function buildTrxData(payloads: OpenPriceFeedPayload[], functionSig: string): string {
  let messages = payloads.reduce((a: string[], x) => [...a , ...x.messages], []);
  let signatures = payloads.reduce((a: string[], x) => [...a, ...x.signatures], []);
  let priceKeys = payloads.map(x => Object.keys(x.prices));
  let symbols = new Set(priceKeys.reduce((acc, val) => [...acc, ...val]));
  let upperCaseDeDuped = [...symbols].map((x) => x.toUpperCase());

  return encode(
    functionSig,
    [messages, signatures, [...upperCaseDeDuped]]
  );
}
