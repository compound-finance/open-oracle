import Web3 from 'web3';

const web3 = new Web3(null); // This is just for encoding, etc.

interface TypeSignature {
  encValueType: string,
  encoder: (any) => any
};

function annotateType(valueType: string): TypeSignature {
  let encoder = (x) => x;
  let encValueType = valueType;

  if (valueType === 'decimal') {
    encoder = (x) => web3.utils.toBN('1000000000000000000').muln(x).toString();
    encValueType = 'uint256';
  }

  return {
    encValueType,
    encoder
  };
}

export function encode(keyType: string, valueType: string, timestamp: number, pairs: [any, any][] | object): string {
  let {encValueType, encoder} = annotateType(valueType);

  let actualPairs = Array.isArray(pairs) ? pairs : Object.entries(pairs);
  let pairsEncoded = actualPairs.map(([key, value]) => {
    console.log([encValueType, encoder(value)]);

    return web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
      web3.eth.abi.encodeParameter(keyType, key),
      web3.eth.abi.encodeParameter(encValueType, encoder(value))
    ]);
  });
  return web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [
    timestamp,
    pairsEncoded
  ]);
}

export function sign(data: string, privateKey: string): string {
  let {r, s, v, messageHash} = web3.eth.accounts.sign(web3.utils.keccak256(data), privateKey);
  return web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
}
