
## Open Oracle

The Open Oracle is a standard and SDK allowing reporters to sign key-value pairs (e.g. a price feed) that interested users can post to the blockchain. The system has a built-in view system that allows clients to easily share data and build aggregates (e.g. the median price from several sources).

## Contracts

First, you will need solc 0.5.10 installed.
Additionally, you will need TypeScript installed and will need to build the project by running `tsc`.

To compile everything run:

```
yarn run compile
```

To compile just the contracts run:

```
yarn run saddle:compile
```

To deploy the Open Oracle locally, you can run:

```
yarn run saddle:deploy --network development Oracle
```

Note: you will need to be running an Ethereum node locally in order for this to work.
E.g., start [ganache-cli](https://github.com/trufflesuite/ganache-cli) in another shell.

You can add a view in `MyView.sol` and run (default is `network=development`):

```
yarn run saddle:deploy MyView arg1 arg2 ...
```

To run tests:

```
yarn run test
```

## Reporter SDK

This repository contains a set of SDKs for reporters to easily sign "reporter" data in any supported languages. We currently support the following languages:

  * [JavaScript](./sdk/javascript/README.md) (in TypeScript)
  * [Elixir](./sdk/typescript/README.md)

## Poster

The poster is a simple application that reads from a given feed (or set of feeds) and posts...

## Contributing

Note: the code in this repository is held under the MIT license. Any contributors must agree to release contributed code under this same license. Please submit an issue (or create a pull request) for any issues or contributions to the project.
