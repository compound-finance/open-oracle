/*Tellor Open Oracle Tests*/


/*
Todo:

Tests:
Launch Compound Open Oracle System
Launch Compound OpenOracle System w/onchain prices
Test Derivatives contract refering to Compound Oracle System
Test Derivatives Contract referring to C.O.S w/ Onchain data

Add comments to everything
Restructure pushPrices from onChain?
Remove all unnecessary files in repo 
Clean package.json
Update Readme

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
const DelFiPriceWithOnchainData = artifacts.require("./DelFiPriceWithOnchainData.sol")
const OnChainData = artifacts.require("./OpenOracleOnChainImplementation.sol"); // globally injected artifacts helper
const sources = [
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf11',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf12',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf13',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf14',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf20',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf21',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf22',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf23',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf24',
].slice(0, 5).map(web3.eth.accounts.privateKeyToAccount);

const nonSources = [
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf15',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf16',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf17',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf18',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf19',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf25',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf26',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf27',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf28',
  '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf29',
].slice(0, 5).map(web3.eth.accounts.privateKeyToAccount);

let testSymbol = 'ETH/USD'

contract('Open Oracle Tests', function(accounts) {
  let testContract;
  let delfiPrice;
  let openOraclePriceData;
  let delfiPriceOnChain;
  let onChainData;
  let onChainData2;

    beforeEach('Setup contract for each test', async function () {
      onChainData = await OnChainData.new();
      onChainData2 = await OnChainData.new();
      openOraclePriceData = await OpenOraclePriceData.new();
      delfiPrice = await DelfiPrice.new(openOraclePriceData.address,sources.map(a => a.address));
      delfiPriceOnChain = await DelFiPriceWithOnchainData.new(openOraclePriceData.address,sources.map(a => a.address),[onChainData.address,onChainData2.address]);
      testContract = await TestContract.new(testSymbol);
    });

    it("System Launched", async function(){
        await testContract.setViewContract(delfiPrice.address)
        assert.equal(await testContract.viewAddress.call(),delfiPrice.address,"the addrss should be correctly set in the Test Contract");
    });
});    