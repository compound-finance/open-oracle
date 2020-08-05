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
import { CoinbaseConfig, readCoinbasePayload } from './sources/coinbase';
import { decodeMessage, encode, zip } from './util';
import { mockUniswapTokenPairs } from './mainnet_uniswap_mocker';

const GAS_PRICE_API = 'https://api.compound.finance/api/gas_prices/get_gas_price';
const DEFAULT_GAS_PRICE = 3_000_000_000; // use 3 gwei if api is unreachable for some reason

export async function main(
    sources: string[],
    senderKey: string,
    viewAddress: string,
    functionSig: string,
    gas: number,
    gasPrice: number | undefined,
    deltas,
    assets: string[],
    mocked_world: boolean,
    pairs,
    web3: Web3) {

  const payloads = await fetchPayloads(sources);
  const feedItems = await filterPayloads(payloads, viewAddress, assets, deltas, web3);

  if (feedItems.length > 0) {
    // If gas price was not defined, fetch average one from Compound API
    if (!gasPrice) {
      gasPrice = await fetchGasPrice();
    }

    // mock uniswap mainnet pairs price
    if (mocked_world) {
      // Mock only pairs that will be updated
      const updateAssets = feedItems.map(item => item.symbol)
      await mockUniswapTokenPairs(updateAssets, senderKey, pairs, gas, gasPrice, web3);
    }

    const trxData = buildTrxData(feedItems, functionSig);
    const gasEstimate = await web3.eth.estimateGas({data: trxData, to: viewAddress});
    // Make gas estimate safer by 50% adjustment
    const gastEstimateAdjusted = Math.floor(gasEstimate * 1.5);
    const trx = <TransactionConfig>{
      data: trxData,
      to: viewAddress,
      gasPrice: gasPrice,
      gas: gastEstimateAdjusted
    };

    console.log(`Posting...`);
    console.log(feedItems);

    return await postWithRetries(trx, senderKey, web3);
  }
}

export async function filterPayloads(
    payloads: OpenPriceFeedPayload[],
    viewAddress: string,
    supportedAssets: string[],
    deltas,
    web3: Web3): Promise<OpenPriceFeedItem[]> {

  const dataAddress = await getDataAddress(viewAddress, web3);

  let filteredFeedItems = await Promise.all(payloads.map(async payload => {
    return await Promise.all(zip(payload.messages, payload.signatures).map(([message, signature]) => {
        const {
          dataType,
          timestamp,
          symbol,
          price
        } = decodeMessage(message, web3)

        return {
          message,
          signature,
          dataType,
          timestamp,
          symbol: symbol.toUpperCase(),
          price: Number(price)
        };
      }).filter(({message, signature, symbol}) => {
        return supportedAssets.includes(symbol.toUpperCase());
      }).map(async (feedItem) => {
        const source = await getSourceAddress(dataAddress, feedItem.message, feedItem.signature, web3);
        const prev = await getPreviousPrice(source, feedItem.symbol, dataAddress, web3);

        return {
          ...feedItem,
          source,
          prev: Number(prev) / 1e6
        };
      })).then((feedItems) => {
        return feedItems.filter(({message, signature, symbol, price, prev}) => {
          return !inDeltaRange(deltas[symbol], price, prev);
        });
      });
  }));

  let feedItems = filteredFeedItems.flat();

  feedItems
    .forEach(({source, symbol, price, prev}) => {
      console.log(`Setting Price: source=${source}, symbol=${symbol}, price=${price}, prev_price=${prev}`);
    });

  return feedItems;
}

// Checks if new price is less than delta percent different form the old price
// Note TODO: price here is uh... a number that needs to be scaled by 1e6?
export function inDeltaRange(delta: number, price: number, prevPrice: number) {
  // Always update prices if delta is set to 0 or delta is not within expected range [0..100]%
  if (delta <= 0 || delta > 100) {
    return false
  };

  const minDifference = new BN(prevPrice).multipliedBy(delta).dividedBy(100);
  const difference = new BN(prevPrice).minus(new BN(price)).abs();

  return difference.isLessThanOrEqualTo(minDifference);
}

export async function fetchPayloads(sources: string[], fetchFn=fetch): Promise<OpenPriceFeedPayload[]> {
  function parse(json): object {
    let result;
    try {
      result = JSON.parse(json);
    } catch (e) {
      console.error(`Error parsing source input: ${json}`);
      throw e;
    }
    if (!result['source']) {
      throw new Error(`Source must include \`source\` field for ${json}`);
    }
    return result;
  }

  return await Promise.all(sources.map(async (sourceRaw) => {
    let source = sourceRaw.includes('{') ? parse(sourceRaw) : sourceRaw;
    let response;

    try {
      if (typeof(source) === 'string') {
        response = await fetchFn(source);
      } else if (source['source'] === 'coinbase') {
        response = await readCoinbasePayload(<CoinbaseConfig>source, fetchFn);
      }

      return await response.json();
    } catch (e) {
      // This is now just for some extra debugging messages
      console.error(`Error Fetching Payload for ${JSON.stringify(source)}`);
      if (response) {
        console.debug({response});
      }
      console.error(e);
      throw e;
    }
  }));
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

export function buildTrxData(feedItems: OpenPriceFeedItem[], functionSig: string): string {  
  const messages = feedItems.map(({message}) => message);
  const signatures = feedItems.map(({signature}) => signature);
  const symbols = [...new Set(feedItems.map(({symbol}) => symbol.toUpperCase()))];

  return encode(
    functionSig,
    [messages, signatures, symbols]
  );
}
