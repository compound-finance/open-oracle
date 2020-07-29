
import Web3 from 'web3';
import { read, readMany, encode } from './util';
import { postWithRetries } from './post_with_retries';

const mainnetWeb3 = new Web3(new Web3.providers.HttpProvider('https://mainnet-eth.compound.finance/'));

async function getReserves(pair: string) {
  return await readMany(
    pair,
    "getReserves()",
    [],
    ["uint112","uint112","uint32"],
    mainnetWeb3
  );
}

async function getCumulativePrices(pair: string) {
  const price0 = await read(
    pair,
    "price0CumulativeLast()",
    [],
    "uint256",
    mainnetWeb3
  );
  const price1 = await read(
    pair,
    "price1CumulativeLast()",
    [],
    "uint256",
    mainnetWeb3
  );

  return [price0, price1];
}

function buildTrxData(reserve0, reserve1, blockTimestampLast, price0, price1, functionSig){
  return encode(
    functionSig,
    [reserve0, reserve1, blockTimestampLast, price0, price1]
  );
}

async function mockUniswapTokenPair(symbol: string, senderKey: string, pairs, gas: number, gasPrice: number, web3: Web3) {
  const testnetPair = pairs.testnet[symbol];
  const mainnetPair = pairs.mainnet[symbol];
  const reserves = await getReserves(mainnetPair);
  const cumulatives = await getCumulativePrices(mainnetPair);

  const reserve0 = reserves[0];
  const reserve1 = reserves[1];
  const blockTimestampLast = reserves[2];
  const cumulativePrice0 = cumulatives[0];
  const cumulativePrice1 = cumulatives[1];

  console.log(`Mocking uniswap token pair for ${symbol} with results--> ${reserve0} ${reserve1} ${blockTimestampLast} ${cumulativePrice0} ${cumulativePrice1}`);

  const functionSig = "update(uint112,uint112,uint32,uint256,uint256)";
  const trxData = buildTrxData(reserve0, reserve1, blockTimestampLast, cumulativePrice0, cumulativePrice1, functionSig);
  const trx = {
      data: trxData,
      to: testnetPair,
      gasPrice: gasPrice,
      gas: gas
  };

  return await postWithRetries(trx, senderKey, web3);
}

export async function mockUniswapTokenPairs(assets: string[], senderKey: string, pairs, gas: number, gasPrice: number, web3: Web3) {
  for (const asset of assets) {
    await mockUniswapTokenPair(asset.toUpperCase(), senderKey, pairs, gas, gasPrice, web3);
  }
}