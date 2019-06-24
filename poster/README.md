
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

To run as a standalone:

```
TODO: make this more clear, as these are just notes from starting to integrate
# start reporter
 yarn run start --private_key=0x5763aa1cb4c9cd141a1b409d92e5c5b967a28e18c70eb4cd965374ad75bff356 --script="examples/fixed.js"

 yarn run start --view_address=0xa543d9701bb291E8F75CE2747A8E094bF042009A --poster_key=0x5763aa1cb4c9cd141a1b409d92e5c5b967a28e18c70eb4cd965374ad75bff356 --sources=http://localhost:3000 --view_function_name='postPrices(bytes[],bytes[],string[])' --web3_provider=http://localhost:8545
```

Otherwise, you can include the DelFi poster in an app for configuration:

```typescript
import poster from 'delfi-poster';

// sources = [list of reporter urls]
poster.main();
```
