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

module.exports = {
	address,
	bytes,
	numToHex,
	uint256
};
