const Web3 = require('web3');

const web3 = new Web3(); // no provider, since we won't make any calls


function address(n) {
	return `0x${n.toString(16).padStart(40, '0')}`;
}

function bytes(str) {
	return web3.eth.abi.encodeParameter('string', str);
}

function uint256(int) {
	return web3.eth.abi.encodeParameter('uint256', int);
}

function numToHex(num) {
	return web3.utils.numberToHex(num);
}

function numToBigNum(num) {
	return web3.utils.toBN(num);
}

function time(){
	return Math.floor(new Date() / 1000);
}

function sendRPC(web3, method, params) {
  return new Promise((resolve, reject) => {
    if (!web3.currentProvider || typeof (web3.currentProvider) === 'string') {
      return reject(`cannot send from currentProvider=${web3.currentProvider}`);
    }

    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: new Date().getTime() // Id of the request; anything works, really
      },
      (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

module.exports = {
  sendRPC,
	address,
	bytes,
	time,
	numToBigNum,
	numToHex,
	uint256
};
