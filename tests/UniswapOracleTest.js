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

  const uniswapOracle = await deploy("UniswapOracle", [0,
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

describe("UniswapOracle", () => {
  let update;
  let getPrice;
  let sleep;

  describe("get TWAP asset prices", () => {
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

      await sleep(2000);
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

    it("DAI_ETH pair price", async () => {
      const price1 = await getPrice("DAI");
      expect(price1.price0Average).numEquals(0);
      expect(price1.price1Average).numEquals(0);

      await sleep(2000);
      await update("DAI");
      await sleep(2000);
      await update("DAI");

      const price2 = await getPrice("DAI");
      expect(price2.price0Average).toBe("4405985580676962");
      expect(price2.price1Average).toBe("226963974731472890029");

      // Real world prices
      // 1 DAI = 0.00440598558067696 ETH
      expect(
        new BigNumber(price2.price0Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("0.004405985580676962");

      // 1 ETH = 226.963974731472890029 DAI
      expect(
        new BigNumber(price2.price1Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("226.963974731472890029");
    });

    it("BAT_ETH pair price", async () => {
      const price1 = await getPrice("BAT");
      expect(price1.price0Average).numEquals(0);
      expect(price1.price1Average).numEquals(0);

      await sleep(2000);
      await update("BAT");
      await sleep(2000);
      await update("BAT");

      const price2 = await getPrice("BAT");
      expect(price2.price0Average).toBe("954583752449035");
      expect(price2.price1Average).toBe("1047577017139089639061");

      // Real world prices
      // 1 BAT = 0.000954583752449035 ETH
      expect(
        new BigNumber(price2.price0Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("0.000954583752449035");

      // 1 ETH = 1047.577017139089639061 BAT
      expect(
        new BigNumber(price2.price1Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("1047.577017139089639061");
    });

    it("REP_ETH pair price", async () => {
      const price1 = await getPrice("REP");
      expect(price1.price0Average).numEquals(0);
      expect(price1.price1Average).numEquals(0);

      await sleep(2000);
      await update("REP");
      await sleep(2000);
      await update("REP");

      const price2 = await getPrice("REP");
      expect(price2.price0Average).toBe("67550851545180011");
      expect(price2.price1Average).toBe("14803662383606968440");

      // Real world prices
      // 1 REP = 0.067550851545180011 ETH
      expect(
        new BigNumber(price2.price0Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("0.067550851545180011");

      // 1 ETH = 14.80366238360696844 REP
      expect(
        new BigNumber(price2.price1Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("14.80366238360696844");
    });

    it("WETH_ZRX pair price", async () => {
      const price1 = await getPrice("ZRX");
      expect(price1.price0Average).numEquals(0);
      expect(price1.price1Average).numEquals(0);

      await sleep(2000);
      await update("ZRX");
      await sleep(2000);
      await update("ZRX");

      const price2 = await getPrice("ZRX");
      expect(price2.price0Average).toBe("677285752097071129533");
      expect(price2.price1Average).toBe("1476481672475336");

      // Real world prices
      // 1 ETH = 677.285752097071129533 ZRX
      expect(
        new BigNumber(price2.price0Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("677.285752097071129533");

      // 1 ZRX = 0.001476481672475336 ETH
      expect(
        new BigNumber(price2.price1Average)
          .div(new BigNumber(1e18))
          .toString()
      ).toBe("0.001476481672475336");
    });

    it("WBTC_ETH pair price", async () => {
      const price1 = await getPrice("BTC");
      expect(price1.price0Average).numEquals(0);
      expect(price1.price1Average).numEquals(0);

      await sleep(2000);
      await update("BTC");
      await sleep(2000);
      await update("BTC");

      const price2 = await getPrice("BTC");
      expect(price2.price0Average).toBe("406478994406953391707546813071");
      expect(price2.price1Average).toBe("2460151");

      // Real world prices
      // 1 WBTC = 40.64789944069533917075 ETH
      expect(
        new BigNumber(price2.price0Average)
          .div(new BigNumber(1e18))
          .div(new BigNumber(1e10))
          .toString()
      ).toBe("40.64789944069533917075");

      // 1 ETH = 0.02460151 WBTC
      expect(
        new BigNumber(price2.price1Average)
          .div(new BigNumber(1e18))
          .multipliedBy(new BigNumber(1e10))
          .toString()
      ).toBe("0.02460151");
    });
  });
});
