/*Tellor Open Oracle Tests*/


/*
Todo:
Launch Tellor System
	(can we just import ABI's ?)
Launch Tellor User Contracts
Launch Compound Open Oracle System
Link Tellor to Compound Oracle System
Test Derivatives contract refering to Compound Oracle System
Link Optimistic Contract to Compound Oracle system
Test Derivatives contract refering to Compound Oracle System
*/

/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
var oracleAbi = Tellor.abi;
var oracleByte = Tellor.bytecode;
var masterAbi = TellorMaster.abi;

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

//XZDBFVORC4XNI483
//json(https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=GSPC&apikey=XZDBFVORC4XNI483).price"
//json(https://api.pro.coinbase.com/products/ZRX-USD/ticker).price
//json(https://api.pro.coinbase.com/products/LTC-USD/ticker).price
// https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BNB&APIKEY=d2c47c82-a3d4-4ee8-8db3-5bccbdbd038a
//d2c47c82-a3d4-4ee8-8db3-5bccbdbd038a

// json(https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT).price
// json(https://api.binance.com/api/v3/ticker/price?symbol=XMRUSDT).price
//https://stooq.com/t/d/l/?s=SPX.US&i=d


function promisifyLogWatch(_address,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _address,
      topics: [web3.utils.sha3(_event)]
    }, (error, result) => {
        if (error){
          console.log('Error',error);
          reject(error);
        }
        else{
        resolve(result);
      }
    })
  });
}


contract('Mining Tests', function(accounts) {
  let oracle;
  let oracle2;
  let master;
  let oracleBase;

    beforeEach('Setup contract for each test', async function () {
        oracleBase = await Tellor.new();
              console.log("l")
        oracle = await TellorMaster.new(oracleBase.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracleBase.address);///will this instance work for logWatch? hopefully...
        //await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.init().encodeABI()})
              console.log("2")
        web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
                            console.log("3")
    });

    it("Get Symbol", async function(){
      console.log("getting symbol")
        let symbol = await oracle.getSymbol();
        assert.equal(symbol,"TT","the Symbol should be TT");
    });

});    