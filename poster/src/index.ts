#! /usr/bin/env node
import { main } from './poster';
import Web3 from 'web3';
import yargs from 'yargs';

async function run() {
  const argv = yargs
    .env('POSTER')
    .option('sources', {alias: 's', description: 'Sources to pull price messages from, a list of https endpoints created by open oracle reporters serving open oracle payloads as json', type: 'string'})
    .option('poster_key', {alias: 'k', description: 'Private key holding enough gas to post (try: `file:<file> or env:<env>)`', type: 'string'})
    .option('view_address', {alias: 'a', description: 'Address of open oracle view to post through', type: 'string'})
    .option('view_function', {alias: 'f', description: 'Function signature for the view', type: 'string', default: 'postPrices(bytes[],bytes[],string[])'})
    .option('web3_provider', {description: 'Web 3 provider', type: 'string', default: 'http://127.0.0.1:8545'})
    .option('timeout', {alias: 't', description: 'how many seconds to wait before retrying with more gas', type: 'number', default: 180})
    .option('gas_limit', {alias: 'g', description: 'how much gas to send', type: 'number', default: 4000000})
    .option('price_delta', {alias: 'd', description: 'the min required difference between new and previous asset price for price update on blockchain', type: 'number', default: 1})
    .option('supported_assets', {alias: 'sa', description: 'A list of supported token names for posting prices', type: 'string', default: 'BTC,ETH,DAI,REP,ZRX,BAT,KNC,LINK,COMP'})
    .help()
    .alias('help', 'h')
    .demandOption(['poster_key', 'sources', 'view_function', 'web3_provider', 'view_address'], 'Provide all the arguments')
    .argv;

  console.log("HEEEEEEEEEEEERE");

  // posting promise will reject and retry once with higher gas after this timeout
  const web3 = await new Web3(argv.web3_provider);
  web3.eth.transactionPollingTimeout = argv.timeout;

  if (argv.web3_provider.match(/.*:8545$/)) {
    // confirm immediately in dev
    web3.eth.transactionConfirmationBlocks = 1
  } else {
    web3.eth.transactionConfirmationBlocks = 10;
  }

  try {
    console.log("BEFORE MAIN")
    await main(argv.sources, argv.poster_key, argv.view_address, argv.view_function, argv.gas_limit, argv.price_delta, argv.supported_assets, web3);
    console.log("main completed")
  } catch (e) {
    console.error(`Poster failed to run`, e);
  }
}

run().then(console.log);
