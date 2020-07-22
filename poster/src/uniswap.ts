import {
  bnToBigInt,
  maxUint,
  read,
  sqrt,
  write
} from './util';
import Web3 from 'web3';
import fetch from 'node-fetch';

function scale(num: bigint, exp: bigint) {
  return Number(num)/Number(10n**exp);
}

function display(num: bigint, exp: bigint=18n, symbol?: string) {
  return `${num} (${scale(num, exp)}${symbol ? ' ' + symbol : ''})`;
}
// Adopted from https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/examples/ExampleSwapToPrice.sol
export function computeProfitMaximizingTrade(
    truePriceTokenA: bigint,
    truePriceTokenB: bigint,
    reserveA: bigint,
    reserveB: bigint): { aToB: boolean, amountIn: bigint } {

  let aToB: boolean =
    ( ( reserveA * truePriceTokenB ) / reserveB ) < truePriceTokenA;

  let invariant = reserveA * reserveB;

  let leftSide = sqrt(
    invariant
      * 1000n
      * ( aToB ? truePriceTokenA : truePriceTokenB )
      / ( 997n * ( aToB ? truePriceTokenB : truePriceTokenA ) )
    );

  let rightSide = ( 1000n * ( aToB ? reserveA : reserveB ) ) / 997n;
  let amountIn = leftSide - rightSide;

  // TODO: Remove log
  console.log({
    truePriceTokenA,
    truePriceTokenB,
    reserveA,
    reserveB,
    aToB,
    amountIn
  });

  return {
    aToB,
    amountIn
  };
}

export async function getReserves(
    factory: string,
    tokenA: string,
    tokenB: string,
    web3: Web3): Promise<[bigint, bigint]> {
  let pair = await read(
    factory,
    'getPair(address,address)',
    [tokenA, tokenB],
    'address',
    web3
  );

  let {
    '0': reserves0,
    '1': reserves1
  } = await read(
    pair,
    'getReserves()',
    [],
    ['uint256','uint256'],
    web3
  );

  if (BigInt(tokenA) < BigInt(tokenB)) {
    return [
      bnToBigInt(reserves0),
      bnToBigInt(reserves1)
    ];
  } else {
    return [
      bnToBigInt(reserves1),
      bnToBigInt(reserves0)
    ];
  }
}

export async function swapToPrice(
    tokenSymbolA: string,
    tokenA: string,
    decimalsA: bigint,
    tokenSymbolB: string,
    tokenB: string,
    decimalsB: bigint,
    truePriceTokenB: bigint,
    truePriceTokenA: bigint,
    maxSpendTokenA: bigint,
    maxSpendTokenB: bigint,
    factory: string,
    router: string,
    account: string,
    web3: Web3): Promise<void> {

  // if (BigInt(tokenA) > BigInt(tokenB)) {
  //   // Mr Reverso
  //   [ tokenSymbolA, tokenA, decimalsA, tokenSymbolB, tokenB, decimalsB, truePriceTokenA, truePriceTokenB, maxSpendTokenA, maxSpendTokenB ]
  //     = [ tokenSymbolB, tokenB, decimalsB, tokenSymbolA, tokenA, decimalsA, truePriceTokenB, truePriceTokenA, maxSpendTokenB, maxSpendTokenA ];
  // }
  // if (BigInt(tokenA) < BigInt(tokenB)) {
  //   [truePriceTokenA, truePriceTokenB] = 
  //     [truePriceTokenB, truePriceTokenA];
  // }

  console.log(`swapToPrice
    tokenSymbolA: ${tokenSymbolA}
    tokenA: ${tokenA}
    decimalsA: ${decimalsA}
    tokenSymbolB: ${tokenSymbolB}
    tokenB: ${tokenB}
    decimalsB: ${decimalsB}
    truePriceTokenA: ${truePriceTokenA}
    truePriceTokenB: ${truePriceTokenB}
    maxSpendTokenA: ${maxSpendTokenA}
    maxSpendTokenB: ${maxSpendTokenB}
    factory: ${factory}
    router: ${router}
    account: ${account}`);

  if (truePriceTokenA == 0n || truePriceTokenB == 0n) {
    console.error(`SwapToPrice: ZERO_PRICE`);
    return;
  }

  if (maxSpendTokenA == 0n && maxSpendTokenB == 0n) {
    console.error(`SwapToPrice: ZERO_SPEND`);
    return;
  }

  let [
    reserveA,
    reserveB
  ] = await getReserves(factory, tokenA, tokenB, web3);

  let {
    aToB,
    amountIn
  } = computeProfitMaximizingTrade(
    truePriceTokenA,
    truePriceTokenB,
    reserveA,
    reserveB
  );

  if (amountIn < 0) {
    console.error(`Amount in less than zero!`);
    return; // For now, skip
  }

  let tokenIn: string = aToB ? tokenA : tokenB;
  let tokenInSymbol: string = aToB ? tokenSymbolA : tokenSymbolB;
  let tokenInDecimals: bigint = aToB ? decimalsA : decimalsB;
  let tokenOut: string = !aToB ? tokenA : tokenB;
  let tokenOutSymbol: string = !aToB ? tokenSymbolA : tokenSymbolB;
  let tokenOutDecimals: bigint = !aToB ? decimalsA : decimalsB;
  let [reserveIn, reserveOut] = aToB ? [reserveA, reserveB] : [reserveB, reserveA];

  let pair = await read(factory, 'getPair(address,address)', [tokenIn, tokenOut], 'address', web3);
  let [amountOut0, amountOut1] = (await read(router, 'getAmountsOut(uint256,address[])', [amountIn, [tokenIn, tokenOut]], 'uint256[]', web3)).map(bnToBigInt);
  let tokenInBalance = bnToBigInt(await read(tokenIn, 'balanceOf(address)', [pair], 'uint256', web3));
  let tokenOutBalance = bnToBigInt(await read(tokenOut, 'balanceOf(address)', [pair], 'uint256', web3));
  let nextReserveIn = reserveIn + amountIn;
  let nextReserveOut = reserveOut - amountOut1;

  console.debug(`** Commencing Uniswap Trade **

    tokenInSymbol=${tokenInSymbol}
    amountIn=${display(amountIn, tokenInDecimals, tokenInSymbol)}
    amountOut[0]=${display(amountOut0, tokenInDecimals, tokenInSymbol)}
    amountOut=${display(amountOut1, tokenOutDecimals, tokenOutSymbol)}
    tokenOutSymbol=${tokenOutSymbol}
    currentExchangeRate=${display(reserveIn, tokenInDecimals, tokenInSymbol)} = ${display(reserveOut, tokenOutDecimals, tokenOutSymbol)} (${scale(reserveIn, tokenInDecimals)/scale(reserveOut, tokenOutDecimals)} ${tokenInSymbol}/${tokenOutSymbol})
    nextExchangeRate=${display(nextReserveIn, tokenInDecimals, tokenInSymbol)} = ${display(nextReserveOut, tokenOutDecimals, tokenOutSymbol)} (${scale(nextReserveIn, tokenInDecimals)/scale(nextReserveOut, tokenOutDecimals)} ${tokenInSymbol}/${tokenOutSymbol})
  `);

  // TODO: Hm?
  let maxSpend = aToB ? maxSpendTokenA : maxSpendTokenB;
  if (amountIn > maxSpend) {
    console.log(`Spend greater than max: amountIn=${amountIn} maxSpend=${maxSpend}`);
    // amountIn = maxSpend;
    return;
  }

  

  if (amountOut1 > tokenOutBalance) {
    throw new Error(`Token out requires more tokens out than available (${display(amountOut1, tokenOutDecimals)} expected, only has ${display(tokenOutBalance)})`)
  }

  if (!process.env['DRY_RUN']) {
    await write(
      tokenIn,
      "approve(address,uint256)",
      [router, amountIn],
      account,
      web3
    );

    await write(
      router,
      'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
      [
        amountIn,
        0, // amountOutMin: we can skip computing this number because the math is tested
        [tokenIn, tokenOut],
        account,
        maxUint
      ],
      account,
      web3
    );
  }
}

export async function matchPrices(view: string, router: string, privateKey: string, priceSource: string, web3: Web3): Promise<void> {
  // TODO: Maybe clone `web3` instead of adding wallet to mutable var?
  let sender = web3.eth.accounts.wallet.add(privateKey).address;

  let pricesJson = await fetch(priceSource);
  let prices = await pricesJson.json();

  const symbolMap = {
    'BTC': 'WBTC'
  };
  const tokenMap = {
    'WBTC': 'BTC',
    'USDC': 'USD',
    'WETH': 'ETH'
  }
  const priceMap = {
    'USDC': 1.0
  }
  const underlyingMap = {
    'ETH': '0xd0a1e359811322d97991e03f863a0c30c2cf029c' // WETH
  }
  const skipTokens = ['XTZ', 'BTC', 'ETH'];

  for (let [configSymbol, price] of Object.entries(prices['prices'])) {
    if (skipTokens.includes(configSymbol)) {
      continue;
    }

    let trueSymbol = symbolMap[configSymbol] || configSymbol;

    let {
      '0': cToken,
      '1': tokenA,
      '2': symbolHash,
      '3': baseUnit,
      '4': priceSource,
      '5': fixedPrice,
      '6': uniswapMarket,
      '7': isUniswapReversed
    } = await read(view, 'getTokenConfigBySymbol(string)', [trueSymbol], ['address', 'address', 'bytes32', 'uint256', 'uint256', 'uint256', 'address', 'bool'], web3);

    if (Number(fixedPrice) !== 0 || priceSource !== '2' /* Reported */) {
      console.log("Skipping ${configSymbol}...");
      continue;
    }
    tokenA = underlyingMap[configSymbol] || tokenA;

    let factory = await read(uniswapMarket, 'factory()', [], 'address', web3);
    let tokenSymbolA = await read(tokenA, 'symbol()', [], 'string', web3);
    let tokenB = await read(uniswapMarket, isUniswapReversed ? 'token1()' : 'token0()', [], 'address', web3);
    let tokenSymbolB = await read(tokenB, 'symbol()', [], 'string', web3);
    let tokenDecimalsA = bnToBigInt(await read(tokenA, 'decimals()', [], 'uint256', web3));
    let tokenDecimalsB = bnToBigInt(await read(tokenB, 'decimals()', [], 'uint256', web3));
    
    let tokenBalanceA = bnToBigInt(await read(tokenA, 'balanceOf(address)', [sender], 'uint256', web3));
    let tokenBalanceB = bnToBigInt(await read(tokenB, 'balanceOf(address)', [sender], 'uint256', web3));

    let truePriceTokenA = BigInt(
      Math.floor(<number>price * 1000 * ( 10 ** ( 18 - Number(tokenDecimalsA) ) ) )
    );

    let priceB = priceMap[tokenSymbolB] || prices['prices'][tokenMap[tokenSymbolB] || tokenSymbolB];
    if (!priceB) {
      throw new Error(`Missing price for tokenB: ${tokenSymbolB}`);
    }
    let truePriceTokenB = BigInt(
      Math.floor(<number>priceB * 1000 * ( 10 ** ( 18 - Number(tokenDecimalsB) ) ) )
    );

    await swapToPrice(
      tokenSymbolA,
      tokenA,
      tokenDecimalsA,
      tokenSymbolB,
      tokenB,
      tokenDecimalsB,
      truePriceTokenA,
      truePriceTokenB,
      tokenBalanceA,
      tokenBalanceB,
      factory,
      router,
      sender,
      web3
    );

    throw 'bail';
  }
}