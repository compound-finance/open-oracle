
## The Open Price Feed Poster

The poster is a simple application to pull prices from a set of source feeds and post them to the blockchain. The posters main job is to make sure that the requested source data is posted to the Ethereum blockchain, and thus is concerned about nonces, gas prices, etc.

## Installation

The Open Price Feed poster can be run as a standalone process or as a module for configuration. To install as a global process:

```sh
yarn global add open-oracle-poster
# npm install -g open-oracle-poster
```

Or, if you plan on customizing the poster, you can install in a project:

```sh
yarn add open-oracle-poster
# npm install open-oracle-poster
```

## Command-Line Interface

The poster is a simple CLI to post prices. The following options are available:

| Option | Description |
| ------ | ----------- |
| `--sources`, `-s` | sources to pull price messages from, a list of https endpoints created by open oracle reporters serving open oracle payloads as json. For complex sources, such as Coinbase, this can be JSON-encoded. Note: specify multiple times to specify multiple sources. |
| `--poster-key`, `-k` | Private key holding enough gas to post (try: `file:<file>` or `env:<env>`) |
| `--view-function`, `-f` | Function signature for the view (e.g. postPrices(bytes[],bytes[])) |
| `--web3-provider` | Web3 provider |
| `--view-address` | Address of open oracle view to post through |
| `--timeout`, `-t` | how many seconds to wait before retrying with more gas, defaults to 180 |
| `--asset`, `-a` | List of assets to post prices for. Pass multiple times to specify multiple assets. |

To run as standalone from this project's root, simply invoke the start script.

```sh
 yarn run start --view-address=0xViewAddress --poster-key=0xWalletWithGas --sources=http://localhost:3000/prices.json
```

You may pass sources in as JSON-encoded objects for complex sources, like Coinbase:

```sh
 yarn run start --web3-provider=https://kovan-eth.compound.finance/ --view-address=0x5265ed1e3055de9B77f007CEaBFC277F2539710A --poster-key="$(cat ~/.ethereum/kovan)" --sources="{\"source\": \"coinbase\", \"endpoint\": \"https://api.pro.coinbase.com/oracle\", \"api_key_id\": \"$COINBASE_API_KEY\", \"api_secret\": \"$COINBASE_API_SECRET\", \"api_passphrase\": \"$COINBASE_API_PASSPHRASE\"}"
```

Otherwise, you can include the Open Price Feed poster in an app for configuration:

```js
import poster from 'open-oracle-poster';
import Web3 from 'web3';

// sample arguments, fill these in with real data :)
let sources = [list of sources];
let posterKey = ...a key to a wallet holding eth for gas;
let viewAddress = "0xDelfiPriceView";
let viewFunction = ...view function signature e.g. 'postPrices(bytes[],bytes[],string[])';
let web3Provider = new Web3("web3Node.com", undefined, {transactionPollingTimeout: 180});

await poster.main(sources, posterKey, viewAddress, viewFunction, web3Provider);
```

## Testing

To run tests, simply run:

```bash
yarn test
```

To run a single test run:

```
yarn test tests/poster_test.ts
```

## Contributing

For all contributions, please open an issue or pull request to discuss. Ensure that all test cases are passing and that top-level (integration) tests also pass (see the `open-oracle` root project). See top-level README for license notice and contribution agreement.
