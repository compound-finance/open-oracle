#! /usr/bin/env node
import { main } from './poster';
import Web3 from 'web3';
import yargs from 'yargs';

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
    .option('price-deltas', {alias: 'd', description: 'the min required difference between new and previous asset price for the update on blockchain', type: 'string'})
    .option('testnet-world', {alias: 'tw', description: 'An option to use mocked uniswap token pairs with data from mainnet', type: 'boolean', default: false})
    .option('testnet-uniswap-pairs', {alias: 'tup', description: 'A list of uniswap testnet pairs for all assets', type: 'string'})
    .option('mainnet-uniswap-pairs', {alias: 'mup', description: 'A list of uniswap mainnet pairs for all assets', type: 'string'})

    .help()
    .alias('help', 'h')
    .demandOption(['poster-key', 'sources', 'view-function', 'web3-provider', 'view-address', 'price-deltas'], 'Provide all the arguments')
    .argv;

  const sources = Array.isArray(parsed['sources']) ? parsed['sources'] : [ parsed['sources'] ];
  const poster_key = parsed['poster-key'];
  const view_address = parsed['view-address'];
  const view_function = parsed['view-function'];
  const web3_provider = parsed['web3-provider'];
  const timeout = parsed['timeout'];
  const gas_limit = parsed['gas-limit'];
  const gas_price = parsed['gas-price'];
  const price_deltas = JSON.parse(parsed['price-deltas']);
  const assets = <string[]>parsed['asset'];

  // check that price deltas are set up for all assets
  assets.forEach(asset => {
    if (price_deltas[asset] == undefined) {
      throw new TypeError(`For each asset price delta should be provided, ${asset} asset is not properly configured`)
    }
  });

  console.log(`Posting with price deltas = `, price_deltas);

  // parameters only for testnets that mock uniswap mainnet
  const mocked_world = parsed['testnet-world'];
  const testnet_pairs = JSON.parse(parsed['testnet-uniswap-pairs'] || '{}');
  const mainnet_pairs = JSON.parse(parsed['mainnet-uniswap-pairs'] || '{}');
  console.log(`Configuring using testnet and mainnet uniswap pairs:`, testnet_pairs, mainnet_pairs);
  const pairs = {testnet: {}, mainnet: {}};
  if (mocked_world) {
    assets.forEach(asset => {
      if (!testnet_pairs[asset] || !mainnet_pairs[asset]) {
        throw new TypeError(`For each asset mainnet and testnet pairs should be provided, ${asset} asset is not properly configured`)
      }
      pairs['testnet'][asset] = testnet_pairs[asset];
      pairs['mainnet'][asset] = mainnet_pairs[asset];
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

  await main(sources, poster_key, view_address, view_function, gas_limit, gas_price, price_deltas, assets, mocked_world, pairs, web3);

  let success_log = {
    message: "Price Feed Poster run completed successfully",
    metric_name: 'PriceFeed-PosterHealth',
    labels: {
      price_feed_poster_healthy: 1
    }
  };

  process.stderr.write(JSON.stringify(success_log) + "\n", () => {
    process.exit(0);
  });
}

run().catch((e) => {
  console.error(`Error encountered: ${e}`);
  console.error(e);
  console.log(e.stack)
  console.log

  let error_log = {
    message: "Price run failed",
    metric_name: 'PriceFeed-PosterHealth',
    labels: {
      price_feed_poster_healthy: 0,
      error: e.toString()
    }
  };

  process.stderr.write(JSON.stringify(error_log) + "\n", () => {
    process.exit(1);
  })
});
