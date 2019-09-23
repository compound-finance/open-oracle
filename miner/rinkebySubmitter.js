

const Web3 = require("web3");
const fs = require('fs');
const Tx = require('ethereumjs-tx')
var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";
var HDWalletProvider = require("truffle-hdwallet-provider");
var web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/72bb9acde80d4a9ca803274f42f77612'))
var json = require('../build/contracts/Tellor.json');
solution = process.argv[2]
apiId = process.argv[3] - 0
value = process.argv[4] - 0


var address = process.argv[5];
var abi = json.abi;
var account = process.argv[6];
var privateKey = new Buffer(process.argv[7], 'hex');

let myContract = new web3.eth.Contract(abi,address);
let data = myContract.methods.submitMiningSolution(solution,apiId,value).encodeABI();

//web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,0,0).encodeABI()});

web3.eth.getTransactionCount(account, function (err, nonce) {
     var tx = new Tx({
      nonce: nonce,
      gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
      gasLimit: 3000000,
      to: address,
      value: 0,
      data: data,
    });
    tx.sign(privateKey);

    var raw = '0x' + tx.serialize().toString('hex');
    web3.eth.sendSignedTransaction(raw).on('transactionHash', function (txHash) {
      }).on('receipt', function (receipt) {
          //console.log("receipt:" + receipt);
      }).on('confirmation', function (confirmationNumber, receipt) {
          //console.log("confirmationNumber:" + confirmationNumber + " receipt:" + receipt);
      }).on('error', function (error) {
    });
  });