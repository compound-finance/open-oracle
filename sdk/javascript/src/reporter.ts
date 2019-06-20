import Web3 from 'web3';

const web3 = new Web3(null); // This is just for encoding, etc.

interface SignedMessage {
  hash: string,
  message: string,
  signature: string,
  signatory: string
};

// XXX share these w/ tests in umbrella somehow?

export function decodeFancyParameter(paramType: string, encParam: string): any {
  let actualParamType = paramType, actualParamDec = (x) => x;

  if (paramType == 'decimal') {
    actualParamType = 'uint256';
    actualParamDec = (x) => x / 1e18;
  }

  return actualParamDec(web3.eth.abi.decodeParameter(actualParamType, encParam));
}

export function decode(keyType: string, valueType: string, message: string): [number, [any, any][] | object] {
  const {0: timestamp, 1: pairsEncoded} = web3.eth.abi.decodeParameters(['uint256', 'bytes[]'], message);
  const pairs = pairsEncoded.map((enc) => {
    const {0: key, 1: value} = web3.eth.abi.decodeParameters(['bytes', 'bytes'], enc);
    return [
      decodeFancyParameter(keyType, key),
      decodeFancyParameter(valueType, value)
    ];
  });
  return [timestamp, pairs];
}

export function encodeFancyParameter(paramType: string, param: any): string {
  let actualParamType = paramType, actualParam = param;

  // We add a decimal type for reporter convenience.
  // Decimals are encoded as uints with 18 decimals of precision on-chain.
  if (paramType === 'decimal') {
    actualParamType = 'uint256';
    actualParam = web3.utils.toBN('1000000000000000000').muln(param).toString();
  }

  return web3.eth.abi.encodeParameter(actualParamType, actualParam);
}

export function encode(keyType: string, valueType: string, timestamp: number, pairs: [any, any][] | object): string {
  const actualPairs = Array.isArray(pairs) ? pairs : Object.entries(pairs);
  const pairsEncoded = actualPairs.map(([key, value]) => {
    return web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
      encodeFancyParameter(keyType, key),
      encodeFancyParameter(valueType, value)
    ]);
  });
  return web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [
    timestamp,
    pairsEncoded
  ]);
}

export function sign(message: string, privateKey: string): SignedMessage {
  const hash = web3.utils.keccak256(message);
  const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
  const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
  const signatory = web3.eth.accounts.recover(hash, v, r, s);
  return {hash, message, signature, signatory};
}
