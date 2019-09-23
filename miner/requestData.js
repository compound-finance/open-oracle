
console.log("Starting request data script...");

const Web3 = require("web3");
const fs = require('fs');
const Tx = require('ethereumjs-tx');
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'));
var json = require('../build/contracts/Tellor.json');

apiString = process.argv[2]
symbol = process.argv[3]
apiId = process.argv[4] - 0
granularity = process.argv[5] - 0
tip = process.argv[6] - 0
var address = process.argv[7];
var abi = json.abi;
var account = process.argv[8];
var privateKey = Buffer.from(process.argv[9], 'hex');
let myContract = new web3.eth.Contract(abi,address);
console.log(apiString,symbol,apiId,granularity,tip);
let data = myContract.methods.requestData(apiString,symbol,apiId,granularity,tip).encodeABI();

web3.eth.getTransactionCount(account, function (err, nonce) {
     var tx = new Tx({
      nonce: nonce,
      gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
      gasLimit: 2000000,
      to: address,
      value: 0,
      data: data,
    });
    tx.sign(privateKey);

    var raw = '0x' + tx.serialize().toString('hex');
    web3.eth.sendSignedTransaction(raw).on('transactionHash', function (txHash) {
      }).on('receipt', function (receipt) {
          console.log("receipt:" + receipt);
      }).on('confirmation', function (confirmationNumber, receipt) {
          //console.log("confirmationNumber:" + confirmationNumber + " receipt:" + receipt);
      }).on('error', function (error) {
    });
  });
