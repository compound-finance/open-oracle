import {main} from './poster';
import Web3 from 'web3';
import yargs from 'yargs';

async function run() {
  const argv = yargs
    .option('sources', {alias: 's', description: 'Sources to pull price messages from, a list of https endpoints created by open oracle reporters serving open oracle payloads as json', type: 'string'})
    .option('poster_key', {alias: 'k', description: 'Private key holding enough gas to post (try: `file:<file> or env:<env>)`', type: 'string'})
    .option('view_address', {alias: 'a', description: 'Address of open oracle view to post through', type: 'string'})
    .option('view_function', {alias: 'f', description: 'Function signature for the view', type: 'string', default: 'postPrices(bytes[],bytes[],string[])'})
    .option('web3_provider', {description: 'Web 3 provider', type: 'string', default: 'http://127.0.0.1:8545'})
    .option('timeout', {alias: 't', description: 'How many seconds to wait before retrying with more gas', type: 'number', default: 180})
    .help()
    .alias('help', 'h')
    .demandOption(['poster_key', 'sources', 'view_function', 'web3_provider', 'view_address'], 'Provide all the arguments')
    .argv;

  // posting promise will reject and retry once with higher gas after this timeout
  const web3 = await new Web3(argv.web3_provider, undefined, {transactionPollingTimeout: argv.timeout});

  if (argv.web3_provider.match(/.*:8545$/)) {
    // confirm immediately in dev
    web3.eth.transactionConfirmationBlocks = 1

    // monkey patch web3 since ganache does not implement eth_chainId
    // https://github.com/trufflesuite/ganache-core/issues/339
    // https://github.com/tcichowicz/ganache-core/commit/15d740cc5bdca86c87c3c9fd79bbce5f785b105e
    const originalSend = web3.eth.currentProvider.send;
    web3.eth.currentProvider.send = async function (method, parameters) {
      if (method === "eth_chainId") {
        return "0x" + Number(1337).toString(16)
      } else {
        return originalSend.call(web3.eth.currentProvider, method, parameters);
      }
    }
  }

  try {
    await main(argv.sources, argv.poster_key, argv.view_address, argv.view_function, web3);
  } catch (e) {
    console.error(`Poster failed to run`, e);
  }
}

run()
