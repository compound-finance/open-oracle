/*Tellor Open Oracle Tests*/


/*
Todo:

Launch Compound Open Oracle System
Launch Compound OpenOracle System w/onchain prices
Test Derivatives contract refering to Compound Oracle System
Test Derivatives Contract referring to C.O.S w/ Onchain data

*/

/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./test_helpers");
const TestContract = artifacts.require("./TestContract.sol");
const DelfiPrice = artifacts.require("./DelFiPrice.sol")
const OpenOraclePriceData = artifacts.require("./OpenOraclePriceData.sol")
const DelfiPriceOnChain = artifacts.require("./DelFiPriceWithOnchainData.sol")
const OnChainData = artifacts.require("./OpenOracleOnChainImplementation.sol"); // globally injected artifacts helper


contract('Open Oracle Tests', function(accounts) {

    beforeEach('Setup contract for each test', async function () {
        oracleBase = await Tellor.new();
        openOracle = await new OpenOracle();
    });

    it("Get Symbol", async function(){
      console.log("getting symbol")
        let symbol = await oracle.getSymbol();
        assert.equal(symbol,"TT","the Symbol should be TT");
    });
    it("Launch open-oracle system", async function(){

    }

});    