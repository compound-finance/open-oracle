const Web3 = require('web3');

const web3 = new Web3(); // no provider, since we won't make any calls

function address(n) {
  return `0x${(n).toString(16).padStart(40, '0')}`;
}

function bytes(str) {
  return web3.eth.abi.encodeParameter('string', str);
}

function uint256(int) {
  return web3.eth.abi.encodeParameter('uint256', int);
}

function encode(timestamp, pairs) {
  return web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [timestamp, pairs.map(([k, v]) => {
    return web3.eth.abi.encodeParameters(['string', 'uint256'], [k, v])
  })]);
}

// XXX maybe want to import signing here, shared with sdk, define there or at top level?
function sign(message, privateKey) {
  const hash = web3.utils.keccak256(message);
  const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
  const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
  const signatory = web3.eth.accounts.recover(hash, v, r, s);
  return {hash, message, signature, signatory};
}

module.exports = {
  address,
  bytes,
  uint256,
  encode,
  sign
};
