
// const { time, numToBigNum, numToHex, address, sendRPC } = require('./Helpers');

function address(n) {
  return `0x${n.toString(16).padStart(40, '0')}`;
}

function uint(n) {
  return web3.utils.toBN(n).toString();
}

function keccak256(str) {
  return web3.utils.keccak256(str);
}

function numToHex(num) {
  return web3.utils.numberToHex(num);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setupTokenPairs() {
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

  // Initialize WETH_ZRX pair with values from mainnet
  const eth_zrx_pair = await deploy("MockUniswapTokenPair", [
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

  return {
    USDC_ETH: usdc_eth_pair._address,
    DAI_ETH: dai_eth_pair._address,
    ETH_ZRX: eth_zrx_pair._address,
    BTC_ETH: wbtc_eth_pair._address,
  }
}


describe('UniswapAnchoredView', () => {
  const reporter = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

  it('basically works', async () => {
    const anchorMantissa = numToHex(1e17);
    const priceData = await deploy('OpenOraclePriceData', []);
    const anchorPeriod = 60;

    const pairs = await setupTokenPairs();
    const tokenConfigs = [
      {cToken: address(1), underlying: address(1), symbolHash: keccak256('ETH'), baseUnit: uint(6), priceSource: 0, fixedPrice: 0, uniswapMarket: pairs.USDC_ETH, isUniswapReversed: true},
      {cToken: address(2), underlying: address(2), symbolHash: keccak256('DAI'), baseUnit: uint(18), priceSource: 0, fixedPrice: 0, uniswapMarket: pairs.DAI_ETH, isUniswapReversed: false},
      {cToken: address(3), underlying: address(3), symbolHash: keccak256('ZRX'), baseUnit: uint(18), priceSource: 0, fixedPrice: 0, uniswapMarket: pairs.ETH_ZRX, isUniswapReversed: true},
      {cToken: address(4), underlying: address(4), symbolHash: keccak256('BTC'), baseUnit: uint(8), priceSource: 0, fixedPrice: 0, uniswapMarket: pairs.BTC_ETH, isUniswapReversed: false},
    ];

    const uniswapAnchoredView = await deploy('UniswapAnchoredView', [priceData._address, reporter.address, anchorMantissa, anchorPeriod, tokenConfigs]);
    await sleep (65);
    // const ethConfig = await send(uniswapAnchoredView, 'getTokenConfigBySymbol', ['ETH']);
    // console.log("ethConfig = ", ethConfig);
    // uniswapAnchoredView.fetchAnchorPrice(eth)
    const res = await send(uniswapAnchoredView, 'fetchAnchorPriceBySymbol', ['ETH', 1e6]);
    console.log("Res ETH= ", res.events);

    const res1 = await send(uniswapAnchoredView, 'fetchAnchorPriceBySymbol', ['DAI', 230623626]);
    console.log("Res DAI = ", res1.events);

    const res3 = await send(uniswapAnchoredView, 'fetchAnchorPriceBySymbol', ['BTC', 230623626]);
    console.log("Res BTC = ", res3.events);

    const res2 = await send(uniswapAnchoredView, 'fetchAnchorPriceBySymbol', ['ZRX', 230623626]);
    console.log("Res ZRX = ", res2.events);
    })
  })
