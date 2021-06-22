const Web3 = require('web3');
const BigNumber = require("bignumber.js");

const web3 = new Web3(); // no provider, since we won't make any calls

const fixed = num => {
  return (new BigNumber(num).toFixed());
};

const EVENTS = {
  PriceUpdated: [
    {
      type: 'bytes32',
      name: 'symbolHash',
      indexed: true
    },
    {
      type: 'uint',
      name: 'price',
    }
  ],
  PriceGuarded: [
    {
      type: 'bytes32',
      name: 'symbolHash',
      indexed: true
    },
    {
      type: 'uint',
      name: 'reporter',
    },
    {
      type: 'uint',
      name: 'anchor',
    }
  ],
  AnchorPriceUpdated: [
    {
      type: 'bytes32',
      name: 'symbolHash',
      indexed: true
    },
    {
      type: 'uint',
      name: 'anchorPrice',
    },
    {
      type: 'uint',
      name: 'oldTimestamp',
    },
    {
      type: 'uint',
      name: 'newTimestamp',
    }
  ],
  UniswapWindowUpdated: [
    {
      type: 'bytes32',
      name: 'symbolHash',
      indexed: true
    },
    {
      type: 'uint',
      name: 'oldTimestamp',
    },
    {
      type: 'uint',
      name: 'newTimestamp',
    },
    {
      type: 'uint',
      name: 'oldPrice',
    },
    {
      type: 'uint',
      name: 'newPrice',
    }
  ]
} 

function decodeEvent(inputs, tx, index) {
  // Remove event name hash from topics array
  tx.events[index].raw.topics.shift()
  return web3.eth.abi.decodeLog(
    inputs,
    tx.events[index].raw.data,
    tx.events[index].raw.topics
  );
}

function numberOfEvents(tx) {
  return Object.keys(tx.events).length;
}

function uint(n) {
  return web3.utils.toBN(n).toString();
}

function keccak256(str) {
  return web3.utils.keccak256(str);
}

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

async function currentBlockTimestamp(web3_) {
  const blockNumber = await sendRPC(web3_, "eth_blockNumber", []);
  const block = await sendRPC(web3_, "eth_getBlockByNumber", [ blockNumber.result, false]);
  return block.result.timestamp;
}

function sendRPC(web3_, method, params) {
  return new Promise((resolve, reject) => {
    if (!web3_.currentProvider || typeof (web3_.currentProvider) === 'string') {
      return reject(`cannot send from currentProvider=${web3_.currentProvider}`);
    }

    web3_.currentProvider.send(
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
  uint256,
  uint,
  keccak256,
  currentBlockTimestamp,
  fixed,
  decodeEvent,
  EVENTS,
  numberOfEvents
};
