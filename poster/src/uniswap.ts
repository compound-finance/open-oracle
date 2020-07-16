import { sqrt } from './util';
import Web3 from 'web3';

// Adopted from https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/examples/ExampleSwapToPrice.sol
export function computeProfitMaximizingTrade(
    truePriceTokenA: bigint,
    truePriceTokenB: bigint,
    reserveA: bigint,
    reserveB): { aToB: boolean, amountIn: bigint } {
  
  let aToB: boolean =
    reserveA * truePriceTokenA / reserveB < truePriceTokenB;

  let invariant = reserveA * reserveB;
  let leftSide = sqrt(
    invariant
      * 1000n
      * ( aToB ? truePriceTokenA : truePriceTokenB )
      / ( 997n * ( aToB ? truePriceTokenB : truePriceTokenA ) )
    );

  let rightSide = 1000n * ( aToB ? reserveA : reserveB ) / 997n;
  let amountIn = leftSide - rightSide;

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
  return [0n, 0n];
}

export async function swapToPrice(
    tokenSymbolA: string,
    tokenA: string,
    tokenSymbolB: string,
    tokenB: string,
    truePriceTokenA: bigint,
    truePriceTokenB: bigint,
    maxSpendTokenA: bigint,
    maxSpendTokenB: bigint,
    factory: string,
    to: string,
    web3: Web3): Promise<void> {

  if (truePriceTokenA == 0n || truePriceTokenB == 0n) {
    throw new Error(`SwapToPrice: ZERO_PRICE`);
  }

  if (maxSpendTokenA == 0n && maxSpendTokenB == 0n) {
    throw new Error(`SwapToPrice: ZERO_SPEND`);
  }

  let [reserveA, reserveB] = await getReserves(factory, tokenA, tokenB, web3);
  let {
    aToB,
    amountIn
  } = computeProfitMaximizingTrade(truePriceTokenA, truePriceTokenB, reserveA, reserveB);

  let maxSpend = aToB ? maxSpendTokenA : maxSpendTokenB;
  if (amountIn > maxSpend) {
    console.log(`Spend greater than max: amountIn=${amountIn} maxSpend=${maxSpend}`);

    amountIn = maxSpend;
  }

  let tokenIn: string = aToB ? tokenA : tokenB;
  let tokenInSymbol: string = aToB ? tokenSymbolA : tokenSymbolB

  console.log(`tokenInSymbol=${tokenInSymbol}, amountIn=${amountIn}`)

  // TODO: The rest
  // TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
  // TransferHelper.safeApprove(tokenIn, address(router), amountIn);

  // address[] memory path = new address[](2);
  // path[0] = tokenIn;
  // path[1] = tokenOut;

  // router.swapExactTokensForTokens(
  //     amountIn,
  //     0, // amountOutMin: we can skip computing this number because the math is tested
  //     path,
  //     to,
  //     deadline
  // );
}
