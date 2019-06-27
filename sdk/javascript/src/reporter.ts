import Web3 from 'web3';

const web3 = new Web3(null); // This is just for encoding, etc.

interface SignedMessage {
  hash: string,
  message: string,
  signature: string,
  signatory: string
};

// XXX share these w/ tests in umbrella somehow?

export function fancyParameterDecoder(paramType: string): [string, (any) => any] {
  let actualParamType = paramType, actualParamDec = (x) => x;

  if (paramType == 'decimal') {
    actualParamType = 'uint256';
    actualParamDec = (x) => x / 1e18;
  }

  return [actualParamType, actualParamDec];
}

export function decode(keyType: string, valueType: string, message: string): [number, [any, any][] | object] {
  const {0: timestamp, 1: pairsEncoded} = web3.eth.abi.decodeParameters(['uint256', 'bytes[]'], message);
  const pairs = pairsEncoded.map((enc) => {
    const [kType, kDec] = fancyParameterDecoder(keyType);
    const [vType, vDec] = fancyParameterDecoder(valueType);
    const {0: key, 1: value} = web3.eth.abi.decodeParameters([kType, vType], enc);
    return [kDec(key), vDec(value)]
  });
  return [timestamp, pairs];
}

export function fancyParameterEncoder(paramType: string): [string, (any) => any] {
  let actualParamType = paramType, actualParamEnc = (x) => x;

  // We add a decimal type for reporter convenience.
  // Decimals are encoded as uints with 18 decimals of precision on-chain.
  if (paramType === 'decimal') {
    actualParamType = 'uint256';
    actualParamEnc = (x) => web3.utils.toBN('1000000000000000000').muln(x).toString();
  }

  return [actualParamType, actualParamEnc];
}

export function encode(keyType: string, valueType: string, timestamp: number, pairs: [any, any][] | object): string {
  const actualPairs = Array.isArray(pairs) ? pairs : Object.entries(pairs);
  const pairsEncoded = actualPairs.map(([key, value]) => {
    const [kType, kEnc] = fancyParameterEncoder(keyType);
    const [vType, vEnc] = fancyParameterEncoder(valueType);
    return web3.eth.abi.encodeParameters([kType, vType], [kEnc(key), vEnc(value)]);
  });
  return web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [timestamp, pairsEncoded]);
}

export function sign(message: string, privateKey: string): SignedMessage {
  const hash = web3.utils.keccak256(message);
  const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
  const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
  const signatory = web3.eth.accounts.recover(hash, v, r, s);
  return {hash, message, signature, signatory};
}
