#! /usr/bin/env node
import { main } from './poster';
import Web3 from 'web3';
import yargs from 'yargs';

// default price delta triggering an update for the supported asset in %
const defaultDeltas = {
  'ETH': 1,
  'BTC': 1,
  'DAI': 0.5,
  'REP': 1.5,
  'ZRX': 1.5,
  'BAT': 1.5,
  'KNC': 1.5,
  'LINK': 1.5,
  'COMP': 1.5
}

async function run() {
  const parsed = yargs
    .env('POSTER')
    .option('sources', {alias: 's', description: 'Sources to pull price messages from, a list of https endpoints created by open oracle reporters serving open oracle payloads as json', type: 'string'})
    .option('poster-key', {alias: 'k', description: 'Private key holding enough gas to post (try: `file:<file> or env:<env>)`', type: 'string'})
    .option('view-address', {alias: 'v', description: 'Address of open oracle view to post through', type: 'string'})
    .option('view-function', {alias: 'f', description: 'Function signature for the view', type: 'string', default: 'postPrices(bytes[],bytes[],string[])'})
    .option('web3-provider', {description: 'Web 3 provider', type: 'string', default: 'http://127.0.0.1:8545'})
    .option('timeout', {alias: 't', description: 'how many seconds to wait before retrying with more gas', type: 'number', default: 180})
    .option('gas-limit', {alias: 'g', description: 'how much gas to send', type: 'number', default: 4000000})
    .option('gas-price', {alias: 'gp', description: 'gas price', type: 'number'})
    .option('asset', {alias: 'a', description: 'A list of supported token names for posting prices', type: 'array', default: ['BTC', 'ETH', 'DAI', 'REP', 'ZRX', 'BAT', 'KNC', 'LINK', 'COMP']})
    // order of `asset` and `price-deltas` should match
    .option('price-deltas', {
      alias: 'd', description: 'the min required difference between new and previous asset price for the update on blockchain', type: 'array',
      default: [defaultDeltas['BTC'], defaultDeltas['ETH'], defaultDeltas['DAI'], defaultDeltas['REP'], defaultDeltas['ZRX'], defaultDeltas['BAT'], defaultDeltas['KNC'], defaultDeltas['LINK'], defaultDeltas['COMP']]
    })
    .option('testnet-world', {alias: 'tw', description: 'An option to use mocked uniswap token pairs with data from mainnet', type: 'boolean', default: false})
    // order of `asset` and `testnet-uniswap-pairs` and `mainnet-uniswap-pairs` should match
    .option('testnet-uniswap-pairs', {alias: 'tup', description: 'A list of uniswap testnet pairs for all assets', type: 'array'})
    .option('mainnet-uniswap-pairs', {alias: 'mup', description: 'A list of uniswap mainnet pairs for all assets', type: 'array'})

    .help()
    .alias('help', 'h')
    .demandOption(['poster-key', 'sources', 'view-function', 'web3-provider', 'view-address'], 'Provide all the arguments')
    .argv;

  const sources = Array.isArray(parsed['sources']) ? parsed['sources'] : [ parsed['sources'] ];
  const poster_key = parsed['poster-key'];
  const view_address = parsed['view-address'];
  const view_function = parsed['view-function'];
  const web3_provider = parsed['web3-provider'];
  const timeout = parsed['timeout'];
  const gas_limit = parsed['gas-limit'];
  const gas_price = parsed['gas-price'];
  const price_deltas = <number[]>parsed['price-deltas'];
  const assets = <string[]>parsed['asset'];

  let deltas = {};
  // if length of submitted deltas array does not match assets array length, pick default deltas
  // otherwise set submitted delta for each asset
  if (price_deltas.length != assets.length) {
    deltas = defaultDeltas;
  } else {
    assets.forEach((asset, index) => {
      deltas[asset] = price_deltas[index];
    });
  }
  console.log(`Posting with price deltas = `, deltas);


  // parameters for testnets only
  const mocked_world = parsed['testnet-world'];
  const testnet_pairs = <string[]>parsed['testnet-uniswap-pairs'];
  const mainnet_pairs = <string[]>parsed['mainnet-uniswap-pairs'];
  const pairs = {testnet: {}, mainnet: {}};
  if (mocked_world) {
    if (testnet_pairs.length != mainnet_pairs.length || testnet_pairs.length != assets.length) {
      throw new TypeError("For each asset mainnet and testnet pairs should be provided, all lengths should match")
    }
    assets.forEach((asset, index) => {
      pairs['testnet'][asset] = testnet_pairs[index];
      pairs['mainnet'][asset] = mainnet_pairs[index];
    });
  }

  // posting promise will reject and retry once with higher gas after this timeout
  const web3 = await new Web3(web3_provider);
  web3.eth.transactionPollingTimeout = timeout;

  // TODO: We should probably just have a `network` var here, or
  //       pass this in as an option.
  if (web3_provider.match(/.*:8545$/)) {
    // confirm immediately in dev
    web3.eth.transactionConfirmationBlocks = 1
  } else {
    web3.eth.transactionConfirmationBlocks = 10;
  }

  try {
    await main(sources, poster_key, view_address, view_function, gas_limit, gas_price, deltas, assets, mocked_world, pairs, web3);
    console.log('Poster run completed successfully');
  } catch (e) {
    console.error(`Poster failed to run`, e);
  }
}

run();
