const ethers = require('ethers');
const fs = require('fs');
const erc20ABI = require('./erc20-abi.json');
const oracleABI = require('./oracle-abi.json');

// TODO: modify so that you can use this on different networks

const USAGE = `node script/check-mainnet/index.js "0x6D2299C48a8dD07a872FDd0F8233924872Ad1071"`;

const symbolFromUnderlying = async (underlyingAddr, underlyingContract) => {
  if (underlyingAddr == "0x0000000000000000000000000000000000000000") {
    return "ETH";
  } else if (underlyingAddr == "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599") {
    return "BTC";
  } else if (underlyingAddr == "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359") {
    return "SAI";
  } else if (underlyingAddr == "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2") {
    return "MKR";
  } else {
    return await underlyingContract.symbol();
  }
}

const decFromUnderlying = async (underlyingAddr, underlyingContract) => {
  if (underlyingAddr == "0x0000000000000000000000000000000000000000") {
    return 18;
  } else {
    return await underlyingContract.decimals();
  }
}

(async function() {

  let address; 
  try {
    address = ethers.utils.getAddress(process.argv[2]);
  } catch (e){
    console.log(`Invalid address, usage example: ${USAGE}`);
  }
  const provider = ethers.getDefaultProvider();
  const oracle = new ethers.Contract(address, oracleABI, provider);
  
  const num = await oracle.numTokens();
  const arr = Array.from(Array(Number(num)).keys());
  const configs = [];
  for (let n of arr) {
    let price, symbol;
    try {
      let conf = await oracle.getTokenConfig(n);
      conf = {
        cToken: conf.cToken, 
        underlying: conf.underlying, 
        symbolHash: conf.symbolHash,
        baseUnit: conf.baseUnit.toString(), 
        priceSource: conf.priceSource.toString(),
        fixedPrice: conf.priceSource.toString(),
        uniswapMarket: conf.uniswapMarket,
        reporter: conf.reporter,
        reporterMultiplier: conf.reporterMultiplier.toString(),
        isUniswapReversed: conf.isUniswapReversed
      };
      configs.push(conf);
      let underlyingContract = new ethers.Contract(conf.underlying, erc20ABI, provider);

      const dec = await decFromUnderlying(conf.underlying, underlyingContract);
      const denom = 10 ** (36 - dec);
      symbol = await symbolFromUnderlying(conf.underlying, underlyingContract);

      price = await oracle.getUnderlyingPrice(conf.cToken);
      console.log(`price for ${symbol} is ${price / denom}`);
      console.log(conf)

      const configsJSON = JSON.stringify(configs, null, 2);
      
      fs.writeFile('oracleConfigs.json', configsJSON, 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });

    } catch (e) {
      console.error(`err fetching index ${n}, ${e}`);
    }
  }
})();
