## Open Oracle

The Open Oracle is a standard and SDK allowing reporters to sign key-value pairs (e.g. a price feed) that interested users can post to the blockchain. The system has a built-in view system that allows clients to easily share data and build aggregates (e.g. the median price from several sources).

## Contents

- [Install](#install)
- [Deploy](#deploy)
- [Verify](#verify)
  - [Manual Verification](#manual-verification)
- [Transfer Ownership](#transfer-ownership)
- [Common Issues](#common-issues)

## Install

1. Clone the repo
2. Install dependencies

```sh
yarn install
```

3. Copy the contents of `.env.example` to `.env`

```sh
cp .env.example .env
```

4. Edit `.env` with your values

## Compiling & Testing

1. To compile:

```sh
yarn run compile
```

2. To run tests:

```sh
yarn run test
```

3. To run test coverage:

```sh
yarn run coverage
```

Note that tests run for coverage will likely fail as resetting forked mainnet is disabled under coverage testing, due to [this issue](https://github.com/sc-forks/solidity-coverage/issues/574) in the `solidity-coverage` package, which fails to report coverage when the fork is reset. However, it is kept here as an indicator of coverage.

## Deploy

The UAV is deployed using constructor parameters defined in `./configuration/parameters.js`. If new markets need to be added, they should be added to this file first. Read more about how to add new markets in the [configuration README](./configuration/).

1. Configure constructor params in `./configuration/parameters.js`
2. Test in a local fork of mainnet:

```sh
yarn deploy-test
```

3. Deploy the UAV to mainnet:

```sh
yarn deploy
```

This will output the address where the UAV was deployed. Keep this to verify on Etherscan.

## Verify

Use the address from the previous step as a positional parameter in the following command:

```sh
yarn verify <UAV_ADDRESS>
```

### Manual Verification

A known issue is that the Etherscan API has a limit on the amount of data it accepts. You may see an error like this:

`hardhat-etherscan constructor arguments exceeds max accepted (10k chars) length`

If so, it means verification must be performed through the UI manually:

1. Generate Standard JSON Input by running:

```sh
yarn verify-manual
```

This will create a file in this project at `./etherscan/verify.json`

2. Navigate to the contract in your browser `https://etherscan.io/address/<UAV_ADDRESS>`
3. Click `Contract` tab, then click `Verify and Publish`
4. In the form, the address should already be filled. Fill in the following, and submit:
5. Compiler type: `Solidity (Standard-Json-Input)`
6. Compiler Version: `v0.8.7+...`
7. License: `GNU GPLv3`
8. Upload `etherscan/verify.json` and submit.

## Transfer Ownership

Use the UAV address as a positional parameter in the same way as the verify step. The COMP_MULTISIG address from .env will be the new proposed owner. Run the following command:

```sh
yarn transfer <UAV_ADDRESS>
```

## Verify Proposed UAV Prices

We need to verify that the newly deployed UAV is functioning correctly before a new proposal is submitted to upgrade the existing UAV. A simple
way to do this is to verify that both the existing and new UAVs returns the same price when the `getUnderlyingPrice` function is called for each of the configured cTokens. This verification
can be done by running the following command.

```
yarn verify-uav --production PRODUCTION_UAV_ADDR --proposed PROPOSED_UAV_ADDR
```

Sample successful verification output

```
Proposed UAV at 0x50ce56A3239671Ab62f185704Caedf626352741e passed all checks with the production UAV at 0x65c816077c29b557bee980ae3cc2dce80204a0c5!
```

The script will fail if the proposed UAV contract either reverts or returns a different price from the production UAV contract.

## Common Issues

### Failure to deploy

If deployment fails with an unhelpful GAS error, it usually means that something failed during the UAV's complex construction. The most common problem is incorrect uniswap config. If the `uniswapMarket` address is not a Uniswap V2 pool, construction will fail. Double check the address, and whether the pool needs to be reversed. More info on this in the [configuration README](./configuration/).

## Reporter SDK

This repository contains a set of SDKs for reporters to easily sign "reporter" data in any supported languages. We currently support the following languages:

- [JavaScript](./sdk/javascript/README.md) (in TypeScript)
- [Elixir](./sdk/typescript/README.md)

## Poster

The poster is a simple application that reads from a given feed (or set of feeds) and posts...

## Contributing

Note: all code contributed to this repository must be licensed under each of 1. MIT, 2. BSD-3, and 3. GPLv3. By contributing code to this repository, you accept that your code is allowed to be released under any or all of these licenses or licenses in substantially similar form to these listed above.

Please submit an issue (or create a pull request) for any issues or contributions to the project. Make sure that all test cases pass, including the integration tests in the root of this project.
