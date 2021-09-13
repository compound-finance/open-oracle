# UAV Configuration

`parameters.js` details the constructor parameters that are passed in when deploying the UAV.

These fields must be known prior to deployment.

- [anchorToleranceMantissa_](#anchortolerancemantissa_)
- [anchorPeriod_](#anchorperiod_)
- [configs](#configs)

# anchorToleranceMantissa_

TYPE: `uint256`

The precentage tolerance for the Uniswap anchor.

For 15%, this equals: `150000000000000000`

# anchorPeriod_

TYPE: `uint256`

Anchor window size.

For 30 minutes, this equals: `1800`

# configs

The configs parameter is an array of `TokenConfig` structs which contains the following fields:

- [cToken](#ctoken)
- [underlying](#underlying)
- [symbolHash](#symbolhash)
- [baseUnit](#baseunit)
- [priceSource](#pricesource)
- [fixedPrice](#fixedprice)
- [uniswapMarket](#uniswapmarket)
- [reporter](#reporter)
- [reporterMultiplier](#reportermultiplier)
- [isUniswapReversed](#isuniswapreversed)

## cToken

TYPE: `address`

The address of the Compound interest baring token. For the `LINK` market configuration, this would be the address of the `cLINK` token.

## underlying

TYPE: `address`

The address of the underlying market token. For this `LINK` market configuration, this would be the address of the `LINK` token.

## symbolHash

TYPE: `bytes32`

The bytes32 hash of the underlying symbol. For the `LINK` market configuration, this would be `0x921a3539bcb764c889432630877414523e7fbca00c211bc787aeae69e2e3a779`, calculated using:

```javascript
keccak256(abi.encodePacked("LINK"))
```

## baseUnit

TYPE: `uint256`

The number of smallest units of measurement in a single whole unit. For example: 1 ETH has 1e18 WEI, therefore the baseUnit of ETH is 1e18 (1,000,000,000,000,000,000)

## priceSource

TYPE: `enum PriceSource` (defined as an integer)

Options:

- 0 - FIXED_ETH - The `fixedPrice` is a constant multiple of ETH price
- 1 - FIXED_USD - The `fixedPrice` is a constant multiple of USD price, which is 1
- 2 - REPORTER - The price is set by the `reporter` (most common. CL price feed `ValidatorProxy`s are the reporters)

## fixedPrice

TYPE: `uint256`

The fixed price multiple of either ETH or USD, depending on the `priceSource`. If `priceSource` is `reporter`, this is unused.

## uniswapMarket

TYPE: `address`

The address of the pool being used as the anchor for this market.

## reporter

TYPE: `address`

The address of the `ValidatorProxy` acting as the reporter

## reporterMultiplier

TYPE: `uint256`

Prices reported by a `ValidatorProxy` must be transformed to 6 decimals for the UAV. Chainlink USD pairs are usually 8 decimals, which is two decimals too many. This field is used to transform the price, using this equation:

```javascript
price = (reportedPrice * reporterMultiplier) / 1e18
```

Using Chainlink USD pairs as an example, and `reportedPrice = 2000000000` ($20):

```javascript
20000000 = (2000000000 * reporterMultiplier) / 1e18
reporterMultiplier = 10000000000000000
```

## isUniswapReversed

TYPE: `bool`

If the `uniswapMarket` pair is X / ETH, this is `false`.
If the `uniswapMarket` pair is ETH / X, this is `true`.
