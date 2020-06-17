const BigNumber = require("bignumber.js");

async function setup() {
  // Initialize USDC_ETH pair with values from mainnet
  const usdc_eth_pair = await deploy("MockUniswapTokenPair", [
    "813725491531",
    "3528370026596436015330",
    "1592425065",
    "89787367080567803087602061047487264867725350639236",
    "4227331029917950029016325075489",
  ]);

  // Initialize DAI_ETH pair with values from mainnet
  const dai_eth_pair = await deploy("MockUniswapTokenPair", [
    "3819295813913808439597752",
    "16827762284444122963188",
    "1592424969",
    "70542767013453060453249113968571452619",
    "3489726182379184118152186925401931467229632",
  ]);

  // Initialize REP_ETH pair with values from mainnet
  const rep_eth_pair = await deploy("MockUniswapTokenPair", [
    "157323115357569242624896",
    "10627310410144389510631",
    "1592425041",
    "819360504021542874838907395123146706291",
    "221435982014902761159721791828816348231935",
  ]);

  // Initialize BAT_ETH pair with values from mainnet
  const bat_eth_pair = await deploy("MockUniswapTokenPair", [
    "939942152643412953016172",
    "897253507155373461729",
    "1592423079",
    "15200916060906209293704504072144736191",
    "15929293009097087259283454525172381011233273",
  ]);

  // Initialize WETH_ZRX pair with values from mainnet
  const weth_zrx_pair = await deploy("MockUniswapTokenPair", [
    "172730868018609758067",
    "116988155856364040450821",
    "1592411459",
    "8940376039738985960413226930501944964252039",
    "20280827635915824975600233241328957701",
  ]);

  // Initialize WBTC_ETH pair with values from mainnet
  const wbtc_eth_pair = await deploy("MockUniswapTokenPair", [
    "3647713616",
    "1482718962516231732009",
    "1592423618",
    "5649104323398751783577661386954839177549366239904392",
    "32429167300960843298079679680",
  ]);

  const uniswapOracle = await deploy("UniswapOracle", [
    {
      USDC_ETH_pair: usdc_eth_pair._address,
      DAI_ETH_pair: dai_eth_pair._address,
      BAT_ETH_pair: bat_eth_pair._address,
      REP_ETH_pair: rep_eth_pair._address,
      WETH_ZRX_pair: weth_zrx_pair._address,
      WBTC_ETH_pair: wbtc_eth_pair._address,
    },
  ]);

  async function getPrice(symbol) {
    return call(uniswapOracle, "getPrice", [symbol]);
  }

  async function update(symbol) {
    return send(uniswapOracle, "update", [symbol]);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return {
    usdc_eth_pair,
    dai_eth_pair,
    uniswapOracle,
    update,
    getPrice,
    sleep,
  };
}

async function getPairData(pair) {
  const price0Cumulative = await pair.methods.price0CumulativeLast().call();
  const price1Cumulative = await pair.methods.price1CumulativeLast().call();
  const {
    reserve0,
    reserve1,
    blockTimestampLast,
  } = await pair.methods.getReserves().call();
  return {
    reserve0,
    reserve1,
    blockTimestampLast,
    price0Cumulative,
    price1Cumulative,
  };
}

describe("UniswapOracle", () => {
  let uniswapOracle;
  let update;
  let getPrice;
  let sleep;

  describe("UniswapOracle get asset prices", () => {
    beforeEach(async (done) => {
      ({
        usdc_eth_pair,
        dai_eth_pair,
        uniswapOracle,
        update,
        getPrice,
        sleep,
      } = await setup());
      done();
    });

    it("USDC_ETH pair price", async () => {
      const price1 = await getPrice("ETH");
      expect(price1.price0Average).numEquals(0);
      expect(price1.price1Average).numEquals(0);
      // expect(post1.events.PriceUpdated.returnValues.price).numEquals(492e6);
      // expect(await call(delfi, 'prices', ['ETH'])).numEquals(492e6);

      await update("ETH");
      await sleep(2000);
      await update("ETH");

      const price2 = await getPrice("ETH");
      expect(price2.price0Average).toBe("4336069182197935199725599365");
      expect(price2.price1Average).toBe("230623626");

      // Real world prices
      // 1 USDC = 0.0043360691821979352 ETH
      expect(
        new BigNumber(price2.price0Average)
          .div(new BigNumber(1e18))
          .div(new BigNumber(1e12))
          .toString()
      ).toBe("0.0043360691821979352");
      // 1 ETH = 230.623626
      expect(
        new BigNumber(price2.price1Average)
          .div(new BigNumber(1e18))
          .multipliedBy(new BigNumber(1e12))
          .toString()
      ).toBe("230.623626");
    });

    // it("DAI_ETH pair price", async () => {
    //   const price1 = await getPrice("DAI");

    //   await update("DAI");
    //   await sleep(2000);
    //   await update("DAI");

    //   const price2 = await getPrice("DAI");
    //   console.log("DAI res = ", price2.price0Average);
    //   console.log("DAI res = ", price2.price1Average);
    //   console.log(
    //     "DAI res price = ",
    //     new BigNumber(price2.price0Average).div(new BigNumber(1e18)).toString()
    //   );
    //   console.log(
    //     "DAI res price = ",
    //     new BigNumber(price2.price1Average).div(new BigNumber(1e18)).toString()
    //   );
    // });
  });
});
