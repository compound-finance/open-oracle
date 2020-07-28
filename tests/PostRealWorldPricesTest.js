
// @notice UniswapAnchoredView `postPrices` test
// Based on data from Coinbase oracle https://api.pro.coinbase.com/oracle and Uniswap token pairs at July 2nd 2020.
const BN = require("bignumber.js");
const { sendRPC, address, uint, keccak256, numToHex } = require('./Helpers');

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

  // Initialize DAI pair with values from mainnet
  const dai_eth_pair = await deploy("MockUniswapTokenPair", [
    "3435618131150076101237553",
    "15407572689721099289685",
    "1593754275",
    "100715171900432184428711184053633835098",
    "5069668089169215245120760905619375569156736",
  ]);

  // Initialize REP pair with values from mainnet
  const rep_eth_pair = await deploy("MockUniswapTokenPair", [
    "40867690797665090689823",
    "3089126268851209725535",
    "1593751741",
    "1326188372862607823298077160955402643895",
    "315226499991023307900665225550194785606382",
  ]);

  // Initialize BAT pair with values from mainnet
  const bat_eth_pair = await deploy("MockUniswapTokenPair", [
    "2809215824116494014601294",
    "3000910749924336260251",
    "1593751965",
    "22657836903223019490474748660313426663",
    "22353658718734403427774753736831427982055589"
  ]);

  // Initialize ZRX pair with values from mainnet
  // Reversed market
  const eth_zrx_pair = await deploy("MockUniswapTokenPair", [
    "259245497861929182740",
    "164221696097447914276729",
    "1593752326",
    "13610654639402610907794611037761488370001743",
    "30665287778536822167996154892216941694",
  ]);

  // Initialize BTC pair with values from mainnet
  const wbtc_eth_pair = await deploy("MockUniswapTokenPair", [
    "4744946699",
    "1910114633221652017296",
    "1593753186",
    "8436575757851690213986884101797344191977744209825804",
    "49529064100184996951568929095",
  ]);

  // Initialize COMP pair with values from mainnet
  const comp_eth_pair = await deploy("MockUniswapTokenPair", [
    "2726069269242972517844",
    "2121223809443892142647",
    "1593738503",
    "7047295063332907798400663297656723228030",
    "10471832919000882624476515664573920963717"
  ])

  // Initialize LINK pair with values from mainnet
  const link_eth_pair = await deploy("MockUniswapTokenPair", [
    "115522168522463195428450",
    "2448717634007234031730",
    "1593750856",
    "379784304220418702903383781057063011507",
    "1098123734917468235191126600400328121343356",
  ])

  // Initialize KNC pair with values from mainnet
  // Reversed market
  const eth_knc_pair = await deploy("MockUniswapTokenPair", [
    "2071741256888346573966",
    "283551022700267758624550",
    "1593751102",
    "5224005871622835504950986888037007421616163",
    "84792274943467211540214022183090944437",
  ])

  return {
    ETH: usdc_eth_pair,
    DAI: dai_eth_pair,
    REP: rep_eth_pair,
    BAT: bat_eth_pair,
    ZRX: eth_zrx_pair,
    BTC: wbtc_eth_pair,
    COMP: comp_eth_pair,
    LINK: link_eth_pair,
    KNC: eth_knc_pair,
  }
}

async function setupUniswapAnchoredView(pairs) {
  const PriceSource = {
    FIXED_ETH: 0,
    FIXED_USD: 1,
    REPORTER: 2
  };

  const reporter = "0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC";
  const anchorMantissa = numToHex(1e17);  //1e17 equates to 10% tolerance for source price to be above or below anchor
  const priceData = await deploy("OpenOraclePriceData", []);
  const anchorPeriod = 30 * 60;

  const tokenConfigs = [
    {cToken: address(1), underlying: address(1), symbolHash: keccak256("ETH"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.ETH._address, isUniswapReversed: true},
    {cToken: address(2), underlying: address(2), symbolHash: keccak256("DAI"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.DAI._address, isUniswapReversed: false},
    {cToken: address(3), underlying: address(3), symbolHash: keccak256("REP"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.REP._address, isUniswapReversed: false},
    {cToken: address(4), underlying: address(4), symbolHash: keccak256("BAT"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.BAT._address, isUniswapReversed: false},
    {cToken: address(5), underlying: address(5), symbolHash: keccak256("ZRX"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.ZRX._address, isUniswapReversed: true},
    {cToken: address(6), underlying: address(6), symbolHash: keccak256("BTC"), baseUnit: uint(1e8), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.BTC._address, isUniswapReversed: false},
    {cToken: address(7), underlying: address(7), symbolHash: keccak256("COMP"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.COMP._address, isUniswapReversed: false},
    {cToken: address(8), underlying: address(8), symbolHash: keccak256("KNC"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.KNC._address, isUniswapReversed: true},
    {cToken: address(9), underlying: address(9), symbolHash: keccak256("LINK"), baseUnit: uint(1e18), priceSource: PriceSource.REPORTER, fixedPrice: 0, uniswapMarket: pairs.LINK._address, isUniswapReversed: false},
  ];

  return deploy("UniswapAnchoredView", [priceData._address, reporter, anchorMantissa, anchorPeriod, tokenConfigs]);
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

  const messages = [
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000021e69e1300000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034254430000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000d84ec180000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe2000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000f81f90000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034441490000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000010798780000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035245500000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000005707f0000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035a52580000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000003b8920000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034241540000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000018f18c0000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034b4e430000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005efebe9800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000049208c0000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044c494e4b00000000000000000000000000000000000000000000000000000000",
  ];

  const signatures = [
    "0xe64be3c6153c0f450062ebb3bb93b48d8e2bec11030dbe7b639ab6c78a5edf688f4fd9ba51c7589c15e384b952a2dc4943d402871163aca12197fd08568c4b9f000000000000000000000000000000000000000000000000000000000000001c",
    "0xb8ba87c37228468f9d107a97eeb92ebd49a50993669cab1737fea77e5b884f2591affbf4058bcfa29e38756021deeafaeeab7a5c4f5ce584c7d1e12346c88d4e000000000000000000000000000000000000000000000000000000000000001b",
    "0xac0731a325943a92f3745be5853f54ae110d889a408805e076ad9b5bc0bb1f4c1a994aebfb27a09156234fd1b27abf0fc19f667ea48c27a0c2a5d58c0243b99b000000000000000000000000000000000000000000000000000000000000001c",
    "0x77058eaa98c77df280e069fb3c751b95aff57827a730458b48d773721432c42293f3b5d21b475169a59140e31196d333ca0f2b5935d2d86563df7a4e5cbc1e24000000000000000000000000000000000000000000000000000000000000001c",
    "0x4758081209589c08db900e84d32393b3a37d9041a8e722e977dc3fff8affe0847d1dcb5c80496ea2f9314b3d6fcde03f8e7a896ba28dde6e2a003972da9e2b25000000000000000000000000000000000000000000000000000000000000001b",
    "0x8f69f85dc792d657238a9a766b3cdb6c17c789d24a2b4c0d59eec079602aecfaf3d79d87a4ed430ef6889c46e03c82b5c616f9b968c4b757a89c1792a02dee13000000000000000000000000000000000000000000000000000000000000001b",
    "0x25005922d67f6f446667de7e3052a2e97cf6b74bd01be62b478e16e3d72a3ecc5582fb44a3501fa359c2d6b5794844713c584740938e4012a1b0e3371e61a8a6000000000000000000000000000000000000000000000000000000000000001b",
    "0xe393df120a0d95b8dea2ab693e4c89b4faf867c66636305bb1199e53cff95f43a22889e148a5bd85105173a102c3167f7716d4eca6a89a0120bef6479e812011000000000000000000000000000000000000000000000000000000000000001b",
  ];

  return {
    uniswapAnchoredView,
    pairs,
    messages,
    signatures,
    isReversedMarket,
    decode,
    fraction,
    currentCumulativePrice,
    currentCumulativePriceDelta,
    getCumulativePrice,
    calculateTWAP
  }
}

describe("UniswapAnchoredView", () => {
  // No data for COMP from Coinbase so far, it is not added to the oracle yet
  const symbols = ["BTC", "ETH", "DAI", "REP", "ZRX", "BAT", "KNC", "LINK"];
  beforeEach(async done => {
    ({
      uniswapAnchoredView,
      pairs,
      messages,
      signatures,
      isReversedMarket,
      decode,
      fraction,
      currentBlockTimestamp,
      currentCumulativePrice,
      currentCumulativePriceDelta,
      getCumulativePrice,
      calculateTWAP
    } = await setup());
    done();
  });

  it("check initialization of cumulative prices", async () => {
    await Promise.all(Object.keys(pairs).map(async (key) => {
      const [price, timestamp] = await currentCumulativePrice(pairs[key], isReversedMarket(key));
      const oldObservation = await call(uniswapAnchoredView, "oldObservations", [keccak256(key)]);
      const newObservation = await call(uniswapAnchoredView, "newObservations", [keccak256(key)]);
      // Sometimes `timestamp` and observation.timestamp are different, adjust cumulative prices to reflect difference
      const diff = await currentCumulativePriceDelta(pairs[key], new BN(timestamp).minus(oldObservation.timestamp).abs().toFixed(), isReversedMarket(key));
      expect(diff.plus(price).toFixed()).toBe(oldObservation.acc);
      expect(diff.plus(price).toFixed()).toBe(newObservation.acc);
      expect(oldObservation.timestamp).toBe(newObservation.timestamp);
    }));
  });

  it("basic scenario, use real world data", async () => {
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    await send(uniswapAnchoredView, "postPrices", [
      messages,
      signatures,
      symbols,
    ]);

    const btc_price = await call(uniswapAnchoredView, "price", ["BTC"]);
    expect(btc_price).toBe("9100190000");

    const eth_price = await call(uniswapAnchoredView, "price", ["ETH"]);
    expect(eth_price).toBe("226815000");

    const dai_price = await call(uniswapAnchoredView, "price", ["DAI"]);
    expect(dai_price).toBe("1016313");

    const rep_price = await call(uniswapAnchoredView, "price", ["REP"]);
    expect(rep_price).toBe("17275000");

    const zrx_price = await call(uniswapAnchoredView, "price", ["ZRX"]);
    expect(zrx_price).toBe("356479");

    const bat_price = await call(uniswapAnchoredView, "price", ["BAT"]);
    expect(bat_price).toBe("243858");

    const knc_price = await call(uniswapAnchoredView, "price", ["KNC"]);
    expect(knc_price).toBe("1634700");

    const link_price = await call(uniswapAnchoredView, "price", ["LINK"]);
    expect(link_price).toBe("4792460");
  });

  it("test price events - PriceUpdated, PriceGuarded", async () => {
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    const postRes = await send(uniswapAnchoredView, "postPrices", [
      messages,
      signatures,
      symbols,
    ]);

    const priceUpdatedEvents = postRes.events.PriceUpdated;
    const priceGuardedEvents = postRes.events.PriceGuarded;

    // All prices were updated
    expect(priceGuardedEvents).toBe(undefined);

    // Check price updates
    priceUpdatedEvents.forEach((updateEvent) => {
      switch(updateEvent.returnValues.price) {
        case "BTC":
          expect(updateEvent.returnValues.price).toBe("9100190000");
          break;
        case "ETH":
          expect(updateEvent.returnValues.price).toBe("226815000");
          break;
        case "DAI":
          expect(updateEvent.returnValues.price).toBe("1016313");
          break;
        case "ZRX":
          expect(updateEvent.returnValues.price).toBe("356479");
          break;
        case "REP":
          expect(updateEvent.returnValues.price).toBe("17275000");
          break;
        case "BAT":
          expect(updateEvent.returnValues.price).toBe("243858");
          break;
        case "KNC":
          expect(updateEvent.returnValues.price).toBe("1634700");
          break;
        case "LINK":
          expect(updateEvent.returnValues.price).toBe("4792460");
      }
    });
  });

  it("test anchor price events - AnchorPriceUpdated", async () => {
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    const observations = {};
    await Promise.all(Object.keys(pairs).map(async (key) => {
      const newObservation = await call(uniswapAnchoredView, "newObservations", [pairs[key]._address]);
      observations[key] = {acc: newObservation.acc, timestamp: newObservation.timestamp};
    }));

    const postRes = await send(uniswapAnchoredView, "postPrices", [
      messages,
      signatures,
      symbols,
    ]);

    const anchorEvents = postRes.events.AnchorPriceUpdated;

    // Check anchor prices
    const block = await sendRPC(web3, "eth_getBlockByNumber", [ anchorEvents[0].blockNumber, false]);
    const blockTimestamp = block.result.timestamp;
    const cumulativePrice_eth = await getCumulativePrice(pairs.ETH, blockTimestamp, true);
    // Recalculate anchor price in JS code and compare to the contract result
    const ethPrice = calculateTWAP(cumulativePrice_eth, observations["ETH"].acc, blockTimestamp, observations["ETH"].timestamp).toFixed();
    await Promise.all(anchorEvents.map(async (anchorEvent) => {
      switch(anchorEvent.returnValues.uniswapMarket) {
        case pairs.ETH._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("227415058");
          expect(anchorEvent.returnValues.anchorPrice).toBe(ethPrice);
          break;
        case pairs.DAI._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("1019878");

          // Recalculate anchor price in JS code and compare to the contract result
          const cumulativePrice_dai = await getCumulativePrice(pairs.DAI, blockTimestamp);
          const daiTWAP = calculateTWAP(cumulativePrice_dai, observations["DAI"].acc, blockTimestamp, observations["DAI"].timestamp);
          const daiPrice = daiTWAP.multipliedBy(ethPrice).dividedBy(1e18).toFixed()
          expect(daiPrice).toBe(anchorEvent.returnValues.anchorPrice);
          break;
        case pairs.REP._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("17189956");

          // Recalculate anchor price in JS code and compare to the contract result
          const cumulativePrice_rep = await getCumulativePrice(pairs.REP, blockTimestamp);
          const repTWAP = calculateTWAP(cumulativePrice_rep, observations["REP"].acc, blockTimestamp, observations["REP"].timestamp);
          const repPrice = repTWAP.multipliedBy(ethPrice).dividedBy(1e18).toFixed()
          expect(repPrice).toBe(anchorEvent.returnValues.anchorPrice);
          break;
        case pairs.BAT._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("242933");

          // Recalculate anchor price in JS code and compare to the contract result
          const cumulativePrice_bat = await getCumulativePrice(pairs.BAT, blockTimestamp);
          const batTWAP = calculateTWAP(cumulativePrice_bat, observations["BAT"].acc, blockTimestamp, observations["BAT"].timestamp);
          const batPrice = batTWAP.multipliedBy(ethPrice).dividedBy(1e18).toFixed()
          expect(batPrice).toBe(anchorEvent.returnValues.anchorPrice);
          break;
        case pairs.ZRX._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("359004");

          // Recalculate anchor price in JS code and compare to the contract result
          cumulativePrice_zrx = await getCumulativePrice(pairs.ZRX, blockTimestamp, true);
          const zrxTWAP = calculateTWAP(cumulativePrice_zrx, observations["ZRX"].acc, blockTimestamp, observations["ZRX"].timestamp);
          const zrxPrice = zrxTWAP.multipliedBy(ethPrice).dividedBy(1e18).toFixed()
          expect(zrxPrice).toBe(anchorEvent.returnValues.anchorPrice);
          break;
        case pairs.BTC._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("9154767327");

          // Recalculate anchor price in JS code and compare to the contract result
          const cumulativePrice_btc = await getCumulativePrice(pairs.BTC, blockTimestamp);
          const btcTWAP = calculateTWAP(cumulativePrice_btc, observations["BTC"].acc, blockTimestamp, observations["BTC"].timestamp);
          const btcPrice = btcTWAP.multipliedBy(ethPrice).dividedBy(1e18).dividedBy(1e10).toFixed()
          expect(btcPrice).toBe(anchorEvent.returnValues.anchorPrice);
          break;
        case pairs.KNC._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("1661588");

          // Recalculate anchor price in JS code and compare to the contract result
          cumulativePrice_knc = await getCumulativePrice(pairs.KNC, blockTimestamp, true);
          const kncTWAP = calculateTWAP(cumulativePrice_knc, observations["KNC"].acc, blockTimestamp, observations["KNC"].timestamp);
          const kncPrice = kncTWAP.multipliedBy(ethPrice).dividedBy(1e18).toFixed()
          expect(kncPrice).toBe(anchorEvent.returnValues.anchorPrice);
          break;
        case pairs.LINK._address:
          expect(anchorEvent.returnValues.anchorPrice).toBe("4820505");

          // Recalculate anchor price in JS code and compare to the contract result
          const cumulativePrice_link = await getCumulativePrice(pairs.LINK, blockTimestamp);
          const linkTWAP = calculateTWAP(cumulativePrice_link, observations["LINK"].acc, blockTimestamp, observations["LINK"].timestamp);
          const linkPrice = linkTWAP.multipliedBy(ethPrice).dividedBy(1e18).toFixed()
          expect(linkPrice).toBe(anchorEvent.returnValues.anchorPrice);
      }
    }));
  });

  it("test uniswap window events", async () => {
    await sendRPC(web3, "evm_increaseTime", [31 * 60]);

    const messages2 = [
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000021cd92f100000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034254430000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000d6e56d80000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000f7f660000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034441490000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000116ee400000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035245500000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000005cd4e0000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035a52580000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf0000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000003aff50000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034241540000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000001c6a6a0000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034b4e430000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005effbf7800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000004895e00000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044c494e4b00000000000000000000000000000000000000000000000000000000",
    ];

    const signatures2 = [
      "0xbd6866cafc46a9f55ad102830a57e807d797ed54d2cf1a689e527b054f1103d860a712d1e6e7f3e1f0e57a263f8a195c8484afdade8e23984d23d8c023bc9dd8000000000000000000000000000000000000000000000000000000000000001c",
      "0xadbca52dc0ecc378d65b540f69e42f6d4879907b8713371758e8dffa02ba4e8eae2a10459600ad3784fe0aac34c0adda164a649cc8b5e713524d349bdddf4b64000000000000000000000000000000000000000000000000000000000000001b",
      "0xc7b7b4b9411a06f623ed6549c3f314b6bf1d39af7d42a3131fbe1e99ddcb4bb0f494788fd01a58a33e567b52345d8889e0ae5eeffeba91e57b718ae7b6d77485000000000000000000000000000000000000000000000000000000000000001c",
      "0x94dfe8cab9eb31f68e926863da610a7764f7153d5d599dc2382cbb0e1343452e5fa0f9da9f812470b54ce806e596688cc2b9c3c25c300060fdb06bca92a6e668000000000000000000000000000000000000000000000000000000000000001b",
      "0x0c4c504ff54a157548c81d96369bd7f3245e7a4fe66cd142cdc9d54a5361eef16d19b925af77c85e49c8389410afa6864c210ed6440939fc4190dec0d49b4ad7000000000000000000000000000000000000000000000000000000000000001c",
      "0x6eea7c84b145877f1c133062a3bc718d2c6ea5806e16ec179b5336ddd96bd47c4cf64cd8475cec87237d5a3715d99409d18d05375ad1fb1996b47d356e59b8ff000000000000000000000000000000000000000000000000000000000000001b",
      "0xafa764b8e63866b81853c8d74e380a8cc7cd14cf2aed22df306f6c4931801a1986ea34f54d4de25f4f3f6a4e968abf42371a6ad3e72b90b2027dc63212fededb000000000000000000000000000000000000000000000000000000000000001b",
      "0x039f30fb49b2f2badad1e3c5df00f2c5c2124c2a1bd06da56467aea45ebf89a027525cc7bfa776452171cb5865e74ef0c04ea6ef18d6ca2e556a0686af658803000000000000000000000000000000000000000000000000000000000000001b",
    ];

    const postRes1 = await send(uniswapAnchoredView, "postPrices", [
      messages,
      signatures,
      symbols,
    ]);
    const uniswapWindowEvents1 = postRes1.events.UniswapWindowUpdated;
    const tolSeconds = 30;

    uniswapWindowEvents1.forEach((windowUpdate) => {
      const elapsedTime =
            windowUpdate.returnValues.newTimestamp -
            windowUpdate.returnValues.oldTimestamp;
      // but time difference should be around 31 minutes + 0/1 second
      expect(elapsedTime).toBeWithinRange(31 * 60, 31 * 60 + tolSeconds);
    });

    await sendRPC(web3, "evm_increaseTime", [31 * 60]);
    const postRes2 = await send(uniswapAnchoredView, "postPrices", [
      messages2,
      signatures2,
      symbols,
    ]);
    const uniswapWindowEvents2 = postRes2.events.UniswapWindowUpdated;

    uniswapWindowEvents2.forEach((windowUpdate) => {
      const elapsedTime =
            windowUpdate.returnValues.newTimestamp -
            windowUpdate.returnValues.oldTimestamp;
      // Give an extra 30 seconds safety delay, but time difference should be around 31 minutes + 0/1 second
      expect(elapsedTime).toBeWithinRange(31 * 60, 31 * 60 + tolSeconds);
    });
  });

  it("test ETH pair while token reserves change", async() => {
    // Emulate timeElapsed for ETH token pair, so that timestamps are set up correctly
    // 1594232101 - 1593755855 = 476246
    await sendRPC(web3, "evm_increaseTime", [476246]);

    // Update reserves, last block timestamp and cumulative prices for uniswap token pair
    await send(pairs.ETH, "update", ["2699846518724", "10900804290754780075806", "1594232101", "130440674219479413955332918569393260852443923640848", "6394369143386285784459187027043"]);
    const messages1 = ["0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005f060cac00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000eb20df00000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000"];
    const signatures1 = ["0x3b5dd2e97c072df44a576f1599a1a7beecef194596c0924c6f696f05c46e7494637041f819e7c89c897327f5932dddc3e4c811793bf5378bcd2289e3c2bd6210000000000000000000000000000000000000000000000000000000000000001b"];
    const symbols1 = ["ETH"];
    const postRes1 = await send(uniswapAnchoredView, "postPrices", [
      messages1,
      signatures1,
      symbols1,
    ]);
    const oldObservation1 = await call(uniswapAnchoredView, "oldObservations", [keccak256('ETH')]);
    const anchorEvent1 = postRes1.events.AnchorPriceUpdated;
    const block1 = await sendRPC(web3, "eth_getBlockByNumber", [anchorEvent1.blockNumber, false]);
    const blockTimestamp1 = block1.result.timestamp;

    const cumulativePrice_eth1 = await getCumulativePrice(pairs.ETH, blockTimestamp1, true);
    const ethPrice1 = calculateTWAP(cumulativePrice_eth1, oldObservation1.acc, blockTimestamp1, oldObservation1.timestamp).toFixed();
    expect(anchorEvent1.returnValues.symbol).toBe("ETH");
    expect(anchorEvent1.returnValues.anchorPrice).toBe(ethPrice1);

    // Emulate timeElapsed for ETH token pair, so that timestamps are set up correctly
    // 1594232585 - 1594232101 = 484
    await sendRPC(web3, "evm_increaseTime", [484]);
    // Update reserves, last block timestamp and cumulative prices for uniswap token pair
    await send(pairs.ETH, "update", ["2699481954534", "10928542275748114013210", "1594232585", "130450824938813990811384244472088515000814627335952", "6394991319166063175850559023838"]);
    const messages2 = ["0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000005f060e8c00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000eb2aa300000000000000000000000000000000000000000000000000000000000000006707269636573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000"];
    const signatures2 = ["0xa9f78f3b7b3f35b124b186fc30a49418cde2baf40b01f7e710239a5e1c4c68bc0e1ae1abd93d3a79c20d4a742983fffd63ab5b239d36d77051ee265e36819920000000000000000000000000000000000000000000000000000000000000001b"];
    const symbols2 = ["ETH"];
    const postRes2 = await send(uniswapAnchoredView, "postPrices", [
      messages2,
      signatures2,
      symbols2,
    ]);
    const oldObservation2 = await call(uniswapAnchoredView, "oldObservations", [keccak256('ETH')]);
    const anchorEvent2 = postRes2.events.AnchorPriceUpdated;
    const block2 = await sendRPC(web3, "eth_getBlockByNumber", [anchorEvent2.blockNumber, false]);
    const blockTimestamp2 = block2.result.timestamp;
    const cumulativePrice_eth2 = await getCumulativePrice(pairs.ETH, blockTimestamp2, true);
    const ethPrice2 = calculateTWAP(cumulativePrice_eth2, oldObservation2.acc, blockTimestamp2, oldObservation2.timestamp).toFixed();

    expect(anchorEvent2.returnValues.symbol).toBe("ETH");
    expect(anchorEvent2.returnValues.anchorPrice).toBe(ethPrice2);
  });

});
