
## Open Oracle

The Open Oracle is a standard and SDK allowing reporters to sign key-value pairs (e.g. a price feed) that interested users can post to the blockchain. The system has a built-in view system that allows clients to easily share data and build aggregates (e.g. the median price from several sources).

## Contracts

First, you will need solc 0.5.9 installed. The binary package is faster, but you can use solcjs by running `yarn install solcjs@0.5.9 --dev`. Additionally, you will need TypeScript installed and will need to build the project by running `tsc`.

To compile the contracts run:

```
yarn run saddle:compile
```

To deploy the Open Oracle locally, you can run:

```
yarn run saddle:deploy --network development Oracle
```

Or you can add a view in `MyView.sol` and run:

```
yarn run saddle:deploy --network development MyView arg1 arg2 ...
```

To run tests:

```
yarn run test
```

## Reporter SDK

This repository contains a set of SDKs for reporters to easily sign "reporter" data in any supported languages. We currently support the following languages:

  * [TypeScript](./sdk/typescript/README.md) / JavaScript
  * [Elixir](./sdk/typescript/README.md)

## Poster

The poster is a simple application that reads from a given feed (or set of feeds) and posts...

## Contributing

Note: the code in this repository is held under the MIT license. Any contributors must agree to release contributed code under this same license. Please submit an issue (or create a pull request) for any issues or contributions to the project.
