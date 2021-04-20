
// @notice UniswapAnchoredView `postPrices` test
// Based on data from Coinbase oracle https://api.pro.coinbase.com/oracle and Uniswap token pairs at July 2nd 2020.
const BN = require("bignumber.js");
const { sendRPC, decodeEvent, EVENTS, address, uint, keccak256, numToHex } = require('./Helpers');

// Cut all digits after decimal point
BN.set({ DECIMAL_PLACES: 0, ROUNDING_MODE: 3 })

async function setupTokenPairs() {
  // Reversed market for ETH, read value of ETH in USDC
  const usdc_eth_pair = await deploy("MockUniswapTokenPair", [
    "1865335786147",
    "8202340665419053945756",
    "1593755855",
    "119785032308978310142960133641565753500432674230537",
    "5820053774558372823476814618189",
  ]);
  const usdc_reporter = await deploy("MockChainlinkOCRAggregator");

  // Initialize DAI pair with values from mainnet
  const dai_eth_pair = await deploy("MockUniswapTokenPair", [
    "3435618131150076101237553",
    "15407572689721099289685",
    "1593754275",
    "100715171900432184428711184053633835098",
    "5069668089169215245120760905619375569156736",
  ]);
  const dai_reporter = await deploy("MockChainlinkOCRAggregator");

  // Initialize REP pair with values from mainnet
  const rep_eth_pair = await deploy("MockUniswapTokenPair", [
    "40867690797665090689823",
    "3089126268851209725535",
    "1593751741",
    "1326188372862607823298077160955402643895",
    "315226499991023307900665225550194785606382",
  ]);
  const rep_reporter = await deploy("MockChainlinkOCRAggregator");


  // Initialize BAT pair with values from mainnet
  const bat_eth_pair = await deploy("MockUniswapTokenPair", [
    "2809215824116494014601294",
    "3000910749924336260251",
    "1593751965",
    "22657836903223019490474748660313426663",
    "22353658718734403427774753736831427982055589"
  ]);
  const bat_reporter = await deploy("MockChainlinkOCRAggregator");


  // Initialize ZRX pair with values from mainnet
  // Reversed market
  const eth_zrx_pair = await deploy("MockUniswapTokenPair", [
    "259245497861929182740",
    "164221696097447914276729",
    "1593752326",
    "13610654639402610907794611037761488370001743",
    "30665287778536822167996154892216941694",
  ]);
  const zrx_reporter = await deploy("MockChainlinkOCRAggregator");

  // Initialize BTC pair with values from mainnet
  const wbtc_eth_pair = await deploy("MockUniswapTokenPair", [
    "4744946699",
    "1910114633221652017296",
    "1593753186",
    "8436575757851690213986884101797344191977744209825804",
    "49529064100184996951568929095",
  ]);
  const wbtc_reporter = await deploy("MockChainlinkOCRAggregator");

  // Initialize COMP pair with values from mainnet
  const comp_eth_pair = await deploy("MockUniswapTokenPair", [
    "2726069269242972517844",
    "2121223809443892142647",
    "1593738503",
    "7047295063332907798400663297656723228030",
    "10471832919000882624476515664573920963717"
  ])
  const comp_reporter = await deploy("MockChainlinkOCRAggregator");

  // Initialize LINK pair with values from mainnet
  const link_eth_pair = await deploy("MockUniswapTokenPair", [
    "115522168522463195428450",
    "2448717634007234031730",
    "1593750856",
    "379784304220418702903383781057063011507",
    "1098123734917468235191126600400328121343356",
  ])
  const link_reporter = await deploy("MockChainlinkOCRAggregator");

  // Initialize KNC pair with values from mainnet
  // Reversed market
  const eth_knc_pair = await deploy("MockUniswapTokenPair", [
    "2071741256888346573966",
    "283551022700267758624550",
    "1593751102",
    "5224005871622835504950986888037007421616163",
    "84792274943467211540214022183090944437",
  ])
  const knc_reporter = await deploy("MockChainlinkOCRAggregator");

  return {
    ETH: {
      pair: usdc_eth_pair,
      reporter: usdc_reporter
    },
    DAI: {
      pair: dai_eth_pair,
      reporter: dai_reporter
    },
    REP: {
      pair: rep_eth_pair,
      reporter: rep_reporter
    },
    BAT: {
      pair: bat_eth_pair,
      reporter: bat_reporter
    },
    ZRX: {
      pair: eth_zrx_pair,
      reporter: zrx_reporter
    },
    BTC: {
      pair: wbtc_eth_pair,
      reporter: wbtc_reporter
    },
    COMP: {
      pair: comp_eth_pair,
      reporter: comp_reporter
    },
    LINK: {
      pair: link_eth_pair,
      reporter: link_reporter
    },
    KNC: {
      pair: eth_knc_pair,
      reporter: knc_reporter
    },
  }
}

async function setupUniswapAnchoredView(pairs) {
  const PriceSource = {
    FIXED_ETH: 0,
    FIXED_USD: 1,
    REPORTER: 2
  };

  const anchorMantissa = numToHex(1e17);  //1e17 equates to 10% tolerance for source price to be above or below anchor
  const anchorPeriod = 30 * 60;

  const tokenConfigs = [
    {cToken: address(1), underlying: address(1), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.ETH.pair._address, reporter: pairs.ETH.reporter._address, isUniswapReversed: true},
    {cToken: address(2), underlying: address(2), symbolHash: keccak256("DAI"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.DAI.pair._address, reporter: pairs.DAI.reporter._address, isUniswapReversed: false},
    {cToken: address(3), underlying: address(3), symbolHash: keccak256("REP"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.REP.pair._address, reporter: pairs.REP.reporter._address, isUniswapReversed: false},
    {cToken: address(4), underlying: address(4), symbolHash: keccak256("BAT"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.BAT.pair._address, reporter: pairs.BAT.reporter._address, isUniswapReversed: false},
    {cToken: address(5), underlying: address(5), symbolHash: keccak256("ZRX"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.ZRX.pair._address, reporter: pairs.ZRX.reporter._address, isUniswapReversed: true},
    {cToken: address(6), underlying: address(6), symbolHash: keccak256("BTC"), baseUnit: uint(1e8), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.BTC.pair._address, reporter: pairs.BTC.reporter._address, isUniswapReversed: false},
    {cToken: address(7), underlying: address(7), symbolHash: keccak256("COMP"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.COMP.pair._address, reporter: pairs.COMP.reporter._address, isUniswapReversed: false},
    {cToken: address(8), underlying: address(8), symbolHash: keccak256("KNC"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.KNC.pair._address, reporter: pairs.KNC.reporter._address, isUniswapReversed: true},
    {cToken: address(9), underlying: address(9), symbolHash: keccak256("LINK"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.LINK.pair._address, reporter: pairs.LINK.reporter._address, isUniswapReversed: false},
  ];

  return deploy("UniswapAnchoredView", [anchorMantissa, anchorPeriod, tokenConfigs]);
}

async function configureReporters(uniswapAnchoredViewAddress, pairs) {
  Object.keys(pairs).map(async (key) => {
    await send(pairs[key].reporter, 'setUniswapAnchoredView', [uniswapAnchoredViewAddress]);
  })
}

async function setup() {
  const pairs = await setupTokenPairs();
  const uniswapAnchoredView = await setupUniswapAnchoredView(pairs);

  function isReversedMarket(name) {
    return name == "ETH" || name == "ZRX" || name == "KNC";
  }

  function fraction(numerator, denominator){
    return new BN(numerator).multipliedBy(new BN(2).pow(112)).mod(new BN(2).pow(224)).dividedBy(denominator).mod(new BN(2).pow(224));
  }

   // helper function that returns the current block timestamp within the range of uint32, i.e. [0, 2**32 - 1]
   async function currentBlockTimestamp() {
    const blockNumber = await sendRPC(web3, "eth_blockNumber", []);
    const block = await sendRPC(web3, "eth_getBlockByNumber", [ blockNumber.result, false]);
    return block.result.timestamp;
  }

  async function currentCumulativePrice(pair, isReversedMarket = false) {
    const blockTimestamp = await currentBlockTimestamp();
    return [await getCumulativePrice(pair, blockTimestamp, isReversedMarket), blockTimestamp];
  }

  async function currentCumulativePriceDelta(pair, timeElapsed, isReversedMarket = false) {
    const fractionDelta = await call(pair, "getReservesFraction", [isReversedMarket]);
    return new BN(fractionDelta).multipliedBy(timeElapsed);
  }

  async function getCumulativePrice(pair, timestamp, isReversedMarket = false) {
    const blockTimestamp = new BN(timestamp).mod(new BN(2).pow(32));
    let priceCumulative = isReversedMarket ? await call(pair, "price1CumulativeLast", []): await call(pair, "price0CumulativeLast", []);

    const blockTimestampLast = await call(pair, "blockTimestampLast", []);
    if (blockTimestampLast != blockTimestamp.toString()) {
      const timeElapsed = blockTimestamp.minus(new BN(blockTimestampLast));

      const fractionDelta = await call(pair, "getReservesFraction", [isReversedMarket]);
      const priceDelta = new BN(fractionDelta).multipliedBy(timeElapsed);
      priceCumulative = new BN(priceCumulative).plus(priceDelta);
    }

    return priceCumulative;
  }

  function decode(price) {
    return price.multipliedBy(1e18).dividedBy(new BN(2).pow(112))
  }

  function calculateTWAP(priceCumulativeOld, priceCumulativeNew, timestampOld, timestampNew) {
    const timeElapsed = new BN(timestampNew).minus(new BN(timestampOld));
    return decode(new BN(priceCumulativeNew).minus(new BN(priceCumulativeOld)).dividedBy(timeElapsed));
  }

  async function validate(reporter, price) {
    return await send(reporter, 'validate', [price]);
  }

  return {
    uniswapAnchoredView,
    pairs,
    isReversedMarket,
    decode,
    fraction,
    currentCumulativePrice,
    currentCumulativePriceDelta,
    getCumulativePrice,
    calculateTWAP,
    validate
  }
}

describe("UniswapAnchoredView", () => {
  // No data for COMP from Coinbase so far, it is not added to the oracle yet
  const symbols = ["BTC", "ETH", "DAI", "REP", "ZRX", "BAT", "KNC", "LINK"];
  const prices = [
    ["BTC", 9100190000], 
    ["ETH", 226815000],
    ["DAI", 1016313],
    ["REP", 17275000],
    ["ZRX", 356479],
    ["BAT", 243858],
    ["KNC", 1634700],
    ["LINK", 4792460]
  ];
  let reporter;
  let validate;
  beforeEach(async done => {
    ({
      uniswapAnchoredView,
      pairs,
      isReversedMarket,
      decode,
      fraction,
      currentBlockTimestamp,
      currentCumulativePrice,
      currentCumulativePriceDelta,
      getCumulativePrice,
      calculateTWAP,
      validate
    } = await setup());
    done();
  });

  it("check initialization of cumulative prices", async () => {
    await Promise.all(Object.keys(pairs).map(async (key) => {
      const [price, timestamp] = await currentCumulativePrice(pairs[key].pair, isReversedMarket(key));
      const oldObservation = await call(uniswapAnchoredView, "oldObservations", [keccak256(key)]);
      const newObservation = await call(uniswapAnchoredView, "newObservations", [keccak256(key)]);
      // Sometimes `timestamp` and observation.timestamp are different, adjust cumulative prices to reflect difference
      const diff = await currentCumulativePriceDelta(pairs[key].pair, new BN(timestamp).minus(oldObservation.timestamp).abs().toFixed(), isReversedMarket(key));
      expect(diff.plus(price).toFixed()).toBe(oldObservation.acc);
      expect(diff.plus(price).toFixed()).toBe(newObservation.acc);
      expect(oldObservation.timestamp).toBe(newObservation.timestamp);
    }));
  });

  it("basic scenario, use real world data", async () => {
    await configureReporters(uniswapAnchoredView._address, pairs);
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    for (let i = 0; i < prices.length; i++) {
      const element = prices[i];
      reporter = pairs[element[0]].reporter;
      await validate(reporter, element[1]);
      let updatedPrice = await call(uniswapAnchoredView, "price", [element[0]]);
      expect(updatedPrice).toBe(prices[i][1].toString());
    }
  });

  it("test price events - PriceUpdated, PriceGuarded", async () => {
    await configureReporters(uniswapAnchoredView._address, pairs);
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    for (let i = 0; i < prices.length; i++) {
      const element = prices[i];
      reporter = pairs[element[0]].reporter;
      const tx = await validate(reporter, element[1]);
      const priceUpdatedEvent = decodeEvent(EVENTS.PriceUpdated, tx, Object.keys(tx.events).length-1)
      // All prices were updated
      expect(priceUpdatedEvent.price).toBe(prices[i][1].toString());
    }
  });

  it("test anchor price events - AnchorPriceUpdated", async () => {
    await configureReporters(uniswapAnchoredView._address, pairs);
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    const tx = await validate(pairs.ETH.reporter, prices[1][1]);
    const event = await decodeEvent(EVENTS.AnchorPriceUpdated, tx, 1);
    expect(event.anchorPrice).toBe("227415058");
  });

  it("test uniswap window events", async () => {
    await configureReporters(uniswapAnchoredView._address, pairs);
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    const tx = await validate(pairs.ETH.reporter, prices[1][1]);
    const event = await decodeEvent(EVENTS.UniswapWindowUpdated, tx, 0);
    const diff = event.newTimestamp-event.oldTimestamp;
    expect(diff).toBeWithinRange(31 * 60, 31 * 60 + 60)
  });

  it("test ETH pair while token reserves change", async() => {
    await configureReporters(uniswapAnchoredView._address, pairs);
    // Emulate timeElapsed for ETH token pair, so that timestamps are set up correctly
    // 1594232101 - 1593755855 = 476246
    await sendRPC(web3, "evm_increaseTime", [476246]);

    // Update reserves, last block timestamp and cumulative prices for uniswap token pair
    await send(pairs.ETH.pair, "update", ["2699846518724", "10900804290754780075806", "1594232101", "130440674219479413955332918569393260852443923640848", "6394369143386285784459187027043"]);
    
    const tx1 = await validate(pairs.ETH.reporter, prices[1][1]);
    const anchorEvent1 = decodeEvent(EVENTS.AnchorPriceUpdated, tx1, 1);

    const oldObservation1 = await call(uniswapAnchoredView, "oldObservations", [keccak256('ETH')]);
    const block1 = await sendRPC(web3, "eth_getBlockByNumber", [tx1.blockNumber, false]);
    const blockTimestamp1 = block1.result.timestamp;

    const cumulativePrice_eth1 = await getCumulativePrice(pairs.ETH.pair, blockTimestamp1, true);
    const ethPrice1 = calculateTWAP(cumulativePrice_eth1, oldObservation1.acc, blockTimestamp1, oldObservation1.timestamp).toFixed();
    expect(anchorEvent1.symbolHash).toBe(keccak256("ETH"));
    expect(anchorEvent1.anchorPrice).toBe(ethPrice1);
  });

});
