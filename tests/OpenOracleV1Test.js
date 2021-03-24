const { setup } = require('./UniswapAnchoredViewTest.js');
const { keccak256, time } = require('./Helpers');
const BigNumber = require('bignumber.js');


describe('UniswapAnchoredView', () => {
  let cToken;
  let token;
  let uniswapAnchoredView;
  let postPrices;

  describe('getUnderlyingPrice', () => {
    beforeEach(async () => {
      ({
        cToken,
        token,
        postPrices,
        uniswapAnchoredView,
      } = await setup({isMockedView: true}));
    });

    it('should return reported WBTC price', async () => {
      let openOracleV1 = await deploy('OpenOracleV1', [uniswapAnchoredView._address, token.WETH]);
      const timestamp = time() - 5;
      await send(uniswapAnchoredView, 'setAnchorPrice', ['ETH', 200e6]);
      await send(uniswapAnchoredView, 'setAnchorPrice', ['BTC', 10000e6]);
      await send(uniswapAnchoredView, 'setAnchorPrice', ['DAI', 1e6]);

      const tx = await postPrices(timestamp, [[['ETH', 200], ['BTC', 10000], ['DAI', 1]]], ['ETH', 'BTC', 'DAI']);
      const btcPrice  = await call(uniswapAnchoredView, 'prices', [keccak256('BTC')]);

      expect(btcPrice).numEquals(10000e6);
      // priceInternal:      returns 10000e6
      // getUnderlyingPrice: 1e30 * 10000e6 / 1e8 = 1e32
      let expected = new BigNumber('1e32');
      expect(await call(uniswapAnchoredView, 'getUnderlyingPrice', [cToken.WBTC])).numEquals(expected.toFixed());

      /*
        BTC = 10000
        ETH = 200
        BTC/ETH = 50
        Decimalized: 50e28 (18 - 6 decimals = 12 + 18)
      */
      expect(
        await call(openOracleV1, 'getPrices', [token.WBTC]))
          .numEquals(new BigNumber('50e28').toFixed());

      /*
        ETH = 200
        ETH = 200
        ETH/ETH = 1
        Decimalized: 1e18 (18 - 18 decimals = 0 + 18)
      */
      expect(
        await call(openOracleV1, 'getPrices', [token.WETH]))
          .numEquals(new BigNumber('1e18').toFixed());

      /*
        DAI = 1
        ETH = 200
        DAI/ETH = 0.005
        Decimalized: 0.005e18 (18 - 18 decimals = 0 + 18)
      */
      expect(
        await call(openOracleV1, 'getPrices', [token.DAI]))
          .numEquals(new BigNumber('0.005e18').toFixed());
    });
  });
});
