
## The Open Oracle Poster

The poster is a simple application to pull prices from a set of source feeds and post them to the blockchain. The posters main job is to make sure that the requested source data is posted to the Ethereum blockchain, and thus is concerned about nonces, gas prices, etc.

## Installation

The DelFi poster can be run as a standalone process or as a module for configuration. To install as a global process:

```
yarn global add open-oracle-poster
```

Or, if you plan on customizing the poster, you can install in a project:

```
yarn add open-oracle-poster
```

## Running

The poster requires 5 arguments to run, with one optional argument.
  --sources, -s             sources to pull price messages from, a list of https endpoints created by open oracle reporters serving open oracle payloads as json
  --poster_key, -k          Private key holding enough gas to post (try: `file:<file> or env:<env>)`
  --view_function_name, -f  Function signature for the view (e.g. postPrices(bytes[],bytes[],string[]))
  --web3_provider           Web 3 provider
  --view_address            address of open oracle view to post through
  --timeout, -t             how many seconds to wait before retrying with more gas, defaults to 180

To run as standalone from this project's root, simply invoke the start script.
```
 yarn run start --view_address=0xViewAddress --poster_key=0xWalletWithGas --sources=http://localhost:3000 --view_function_name='postPrices(bytes[],bytes[],string[])' --web3_provider=http://127.0.0.1:8545
```

Otherwise, you can include the DelFi poster in an app for configuration:

```typescript
import poster from 'delfi-poster';
import Web3 from 'web3';

// sample arguments, fill these in with real data :)
// let sources = [list of sources];
// let posterKey = ...a key to a wallet holding eth for gas;
// let viewAddress = "0xOraclePriceData";
// let viewFunctionName = ...view function signature e.g. 'postPrices(bytes[],bytes[],string[])';
// let web3Provider = new Web3("web3Node.com", undefined, {transactionPollingTimeout: 180});
await poster.main(sources, posterKey, viewAddress, viewFunctionName, web3Provider);
```
