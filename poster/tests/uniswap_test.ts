import {
  computeProfitMaximizingTrade,
  getReserves,
  swapToPrice
} from '../src/uniswap';
import { Whit } from './whit';

function e(n: number | bigint, exp: number | bigint) {
  return BigInt(n) * 10n ** BigInt(exp);
}

describe('computeProfitMaximizingTrade', () => {
  [
    {
      name: "simple",
      truePriceTokenA: e(100, 6),
      truePriceTokenB: e(200, 6),
      reserveA: e(10, 18),
      reserveB: e(21, 18),
      expect: {
        aToB: true,
        amountIn: 20n
      }
    }
  ].forEach((conf) => {
    test(conf.name, async () => {
      let result = computeProfitMaximizingTrade(
        conf.truePriceTokenA,
        conf.truePriceTokenB,
        conf.reserveA,
        conf.reserveB
      );

      expect(result).toEqual(conf.expect);


    });
  });
});

describe('swapToPrice', () => {
  [
    {
      name: "simple",
      reserveA: e(10, 18),
      reserveB: e(10, 18),
      priceA: e(100, 6),
      priceB: e(200, 6),
      maxSpendA: e(100, 18),
      maxSpendB: e(100, 18)
    }
  ].forEach(conf => {
    test.only(conf.name, async () => {

      let whit = await Whit.init({
        provider: 'ganache',
        build: [
          './tests/.build/uniswap.json',
          './tests/.build/uniswap-pair.json',
          './tests/.build/compound-test.json'
        ],
        contracts: {
          uniswap: {
            deploy: ['UniswapV2Factory', ["0x871A9FF377eCf2632A0928950dCEb181557F2e17"]]
          },
          abacus: {
            deploy: ['NonStandardToken', [e(100, 18), "Abacus", 18 ,"ABBA"]]
          },
          pair: {
            deploy: async ({uniswap, abacus, babylon}, {ethers, contract}) => {
              let pair = await uniswap.callStatic.createPair(abacus.address, babylon.address);
              await uniswap.createPair(abacus.address, babylon.address);

              return contract(pair, 'UniswapV2Pair');
            },
            postDeploy: async (refs, {provider}) => {
              console.log("z");
              console.log("abacus: ", refs.abacus);
              console.log("pair: ", refs.pair);
              console.log("pair address: ", refs.pair.address, 1);
              await refs.abacus.approve(refs.pair.address, 1);
              console.log("z1");
              await refs.babylon.approve(refs.pair.address, 1);
              console.log("z2");
              // Instead of approve, let's transfer
              console.log(await refs.abacus.transfer(refs.pair.address, 100));
              console.log(await refs.babylon.transfer(refs.pair.address, 100));
              let signer = (<any>provider).getSigner(0);
              console.log({signer});
              let account = await signer.getAddress();
              console.log({account});
              console.log("reservesPre", await refs.pair.getReserves());
              let tx = await refs.pair.mint(account);
              console.log("reservesPost", await refs.pair.getReserves());
              console.log("z3", tx);
            }
          },
          babylon: {
            deploy: ['NonStandardToken', [e(100, 18), "Babylon", 18 ,"BABY"]]
          }
        }
      });

      throw "abc";

      // TODO: Whit?
      // deploy TokenA();
      // deploy TokenB();
      // deploy Uniswap();
      // create Pair
      // Seed Pair
      let tokenSymbolA = "Abacus";
      let tokenSymbolB = "Babylon";
      let tokenA = "0x";
      let tokenB = "0x";
      let factory = "0x";
      let to = "0x"; // ?

      await swapToPrice(
        tokenSymbolA,
        tokenA,
        tokenSymbolB,
        tokenB,
        conf.priceA,
        conf.priceB,
        conf.maxSpendA,
        conf.maxSpendB,
        factory,
        to,
        <any>null // web3
      );

      let [reserveA, reserveB] = await getReserves(factory, tokenA, tokenB, <any>null /* web3 */);

      // TODO: Is this the right expectation?
      expect(reserveA / reserveB).toEqual(conf.priceA / conf.priceB);
    });
  });
});
