
import Web3 from 'web3';
import { read, readMany, encode } from './util';
import { postWithRetries } from './post_with_retries';

const mainnetPairs = {
  ETH: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
  BTC: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",
  DAI: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
  REP: "0x8bd1661da98ebdd3bd080f0be4e6d9be8ce9858c",
  BAT: "0xb6909b960dbbe7392d405429eb2b3649752b4838",
  ZRX: "0xc6f348dd3b91a56d117ec0071c1e9b83c0996de4",
  LINK: "0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974",
  COMP: "0xcffdded873554f362ac02f8fb1f02e5ada10516f",
  KNC: "0xf49c43ae0faf37217bdcb00df478cf793edd6687"
}

// Hard-coded ropsten token pairs here
const testnetPairs = {
  ETH: "0x87Dc58FE11f619fD69864b6D3134448a0B719BFe",
  BTC: "0xEC067D534C3d736Bb8dD5D8bF02Bc1D895983700",
  DAI: "0x8C6046bD538Eb847829cb8f47eBC1446E214209E",
  REP: "0x778450170884687e50AdFe616f711CBBE874BFbe",
  BAT: "0xbFc921ec12D8bC1E482c2cB16f6773D506ab8056",
  ZRX: "0x170d1675E96FD71E75Ee7A6e800EA2205A54e33D",
  LINK: "0x4E95466E3EBdfE5465A8684FD0Ae80e07561872F",
  COMP: "0x22722a34684e939D3C26eE3b758b725631aa2295",
  KNC: "0x7bd6a648E1Fd4983a8f4405592bF64297eE35cb2"
}
const mainnetWeb3 = new Web3(new Web3.providers.HttpProvider('https://mainnet-eth.compound.finance/'));

async function getReserves(symbol: string) {
  return await readMany(
    mainnetPairs[symbol],
    "getReserves()",
    [],
    ["uint112","uint112","uint32"],
    mainnetWeb3
  );
}

async function getCumulativePrices(symbol: string) {
  const price0 = await read(
    mainnetPairs[symbol],
    "price0CumulativeLast()",
    [],
    "uint256",
    mainnetWeb3
  );
  const price1 = await read(
    mainnetPairs[symbol],
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

// https://mainnet-eth.compound.finance/
async function mockUniswapTokenPair(symbol: string, senderKey: string, gas: number, gasPrice: number, web3: Web3) {
  const reserves = await getReserves(symbol);
  const cumulatives = await getCumulativePrices(symbol);

  const reserve0 = reserves[0];
  const reserve1 = reserves[1];
  const blockTimestampLast = reserves[2];
  const cumulativePrice0 = cumulatives[0];
  const cumulativePrice1 = cumulatives[1];

  console.log(`Mocking uniswap token pair for ${symbol} with results--> ${reserve0} ${reserve1} ${blockTimestampLast} ${cumulativePrice0} ${cumulativePrice1}`);

  const functionSig = "update(uint256,uint256,uint256,uint256,uint256)";
  const trxData = buildTrxData(reserve0, reserve1, blockTimestampLast, cumulativePrice0, cumulativePrice1, functionSig);
  // console.log("build trx data = ", trxData);
  const trx = {
      data: trxData,
      to: testnetPairs[symbol],
      gasPrice: gasPrice,
      gas: gas
  };

  return await postWithRetries(trx, senderKey, web3);
}

export async function mockUniswapTokenPairs(assets: string[], senderKey: string, gas: number, gasPrice: number, web3: Web3) {
  for (const asset of assets) {
    await mockUniswapTokenPair(asset.toUpperCase(), senderKey, gas, gasPrice, web3);
  }
}