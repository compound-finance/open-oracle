import {
  computeProfitMaximizingTrade,
  getReserves,
  swapToPrice
} from '../src/uniswap';
import { Whit } from './whit';
import Web3 from 'web3';
import {
  bnToBigInt,
  maxUint
} from '../src/util';
import { toBeNear } from './matcher';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNear(expected: number, delta: number): CustomMatcherResult
    }
  }
}

expect.extend({toBeNear});

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
  beforeEach(async () => {
    jest.setTimeout(300000);
  });

  [
    // {
    //   name: "simple",
    //   decimalsA: 18n,
    //   decimalsB: 18n,
    //   reserveA: e(10, 18),
    //   reserveB: e(10, 18),
    //   priceA: e(100, 6),
    //   priceB: e(200, 6)
    // },
    {
      name: "decimals",
      decimalsA: 18n,
      decimalsB: 10n,
      reserveA: e(10, 18),
      reserveB: e(10, 10),
      priceA: e(100, 6),
      priceB: e(200, 6)
    }
  ].forEach(conf => {
    test.only(conf.name, async () => {
      let whit = await Whit.init({
        provider: {
          ganache: {}
          // http: 'https://kovan-eth.compound.finance' /* Kovan */
        },
        signer: {
          account: 0
          // file: '/Users/geoff/.ethereum/kovan' /* Kovan */
        },
        build: [
          './tests/.build/uniswap.json',
          './tests/.build/uniswap-pair.json',
          './tests/.build/uniswap-router.json',
          './tests/.build/compound-test.json'
        ],
        contracts: {
          uniswap: {
            deploy: ['UniswapV2Factory', [{account: 0}]]
          },
          abacus: {
            deploy: [
              'tests/Contracts/ERC20.sol:StandardToken',
              [e(100_000_000n, conf.decimalsA), "Abacus", conf.decimalsA, "ABBA"]
            ]
          },
          pair: {
            deploy: async ({uniswap, abacus, babylon}, {ethers, contract, wait}) => {
              await wait(uniswap.createPair(abacus.address, babylon.address));
              let pair = await uniswap.getPair(abacus.address, babylon.address);

              return contract(pair, 'UniswapV2Pair');
            },
            postDeploy: async (refs, {account, provider, wait}) => {
              await wait(refs.abacus.approve(refs.router.address, conf.reserveA));
              await wait(refs.babylon.approve(refs.router.address, conf.reserveB));
              await wait(refs.router.addLiquidity(
                refs.abacus.address,
                refs.babylon.address,
                conf.reserveA,
                conf.reserveB,
                conf.reserveA,
                conf.reserveB,
                account,
                maxUint,
                { gasLimit: 1_000_000 }
              ));
            }
          },
          babylon: {
            deploy: [
              'tests/Contracts/ERC20.sol:StandardToken',
              [e(100_000_000n, conf.decimalsB), "Babylon", conf.decimalsB, "BABY"]
            ]
          },
          router: {
            deploy: [
              'UniswapV2Router02',
              [{ref: 'uniswap'}, {ref: 'abacus'}]
            ]
          }
        }
      });

      let tokenSymbolA = "Abacus";
      let tokenSymbolB = "Babylon";
      let tokenA = whit.getAddress('abacus');
      let tokenB = whit.getAddress('babylon');
      let factory = whit.getAddress('uniswap');
      let router = whit.getAddress('router');

      let maxSpendA = bnToBigInt(await whit.refs.abacus.balanceOf(whit.account));
      let maxSpendB = bnToBigInt(await whit.refs.babylon.balanceOf(whit.account));

      // Build web3 with possible signing account
      let web3 = new Web3(whit.getWeb3Provider());
      if (whit.signer.hasOwnProperty('_signingKey')) {
        web3.eth.accounts.wallet.add((<any>whit.signer)._signingKey().privateKey);
      }

      let truePriceTokenA =
        conf.priceA * ( 10n ** ( 18n - conf.decimalsA ) );

      let truePriceTokenB =
        conf.priceB * ( 10n ** ( 18n - conf.decimalsB ) );

      await swapToPrice(
        tokenSymbolA,
        tokenA,
        conf.decimalsA,
        tokenSymbolB,
        tokenB,
        conf.decimalsB,
        truePriceTokenA,
        truePriceTokenB,
        maxSpendA,
        maxSpendB,
        factory,
        router,
        whit.account,
        web3
      );

      let [reserveA, reserveB] = await getReserves(factory, tokenA, tokenB, web3);
      
      let reserveRatio = Number(reserveA) / Number(reserveB);
      let priceRatio = Number(conf.priceA) / Number(conf.priceB)

      console.debug({
          reserveA,
          reserveB,
          reserveRatio,

          priceA: conf.priceA,
          priceB: conf.priceB,
          priceRatio
        });

      try {
        expect(reserveRatio).toBeNear(priceRatio, 0.01);
      } catch (e) {
        console.debug({
          reserveA,
          reserveB,
          reserveRatio,

          priceA: conf.priceA,
          priceB: conf.priceB,
          priceRatio
        });

        throw e;
      }
    });
  });
});
