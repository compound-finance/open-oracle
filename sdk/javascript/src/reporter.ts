import Web3 from 'web3';

const web3 = new Web3(null); // This is just for encoding, etc.

interface SignedMessage {
  hash: string,
  message: string,
  signature: string,
  signatory: string
};

export function getKeyAndValueType(kind: string): [string, string] {
  switch (kind) {
    case 'prices':
      return ['symbol', 'decimal'];
    default:
      throw new Error(`Unknown kind of data "${kind}"`);
  }
}

export function fancyParameterDecoder(paramType: string): [string, (any) => any] {
  let actualParamType = paramType, actualParamDec = (x) => x;

  if (paramType == 'decimal') {
    actualParamType = 'uint256';
    actualParamDec = (x) => x / 1e6;
  }

  if (paramType == 'symbol') {
    actualParamType = 'string';
    actualParamDec = (x) => x; // we don't know what the original case was anymore
  }

  return [actualParamType, actualParamDec];
}

export function decode(message: string): [string, number, [any, any][]] {
  const {0: kind, 1: timestamp, 2: pairsEncoded} = web3.eth.abi.decodeParameters(['string', 'uint256', 'bytes[]'], message);
  const [keyType, valueType] = getKeyAndValueType(kind);
  const pairs = pairsEncoded.map((enc) => {
    const [kType, kDec] = fancyParameterDecoder(keyType);
    const [vType, vDec] = fancyParameterDecoder(valueType);
    const {0: key, 1: value} = web3.eth.abi.decodeParameters([kType, vType], enc);
    return [kDec(key), vDec(value)]
  });
  return [kind, timestamp, pairs];
}

export function fancyParameterEncoder(paramType: string): [string, (any) => any] {
  let actualParamType = paramType, actualParamEnc = (x) => x;

  // We add a decimal type for reporter convenience.
  // Decimals are encoded as uints with 18 decimals of precision on-chain.
  if (paramType === 'decimal') {
    actualParamType = 'uint256';
    actualParamEnc = (x) => web3.utils.toBN(1e6).muln(x).toString();
  }

  if (paramType == 'symbol') {
    actualParamType = 'string';
    actualParamEnc = (x) => x.toUpperCase();
  }

  return [actualParamType, actualParamEnc];
}

export function encode(kind: string, timestamp: number, pairs: [any, any][] | object): string {
  const [keyType, valueType] = getKeyAndValueType(kind);
  const actualPairs = Array.isArray(pairs) ? pairs : Object.entries(pairs);
  const pairsEncoded = actualPairs.map(([key, value]) => {
    const [kType, kEnc] = fancyParameterEncoder(keyType);
    const [vType, vEnc] = fancyParameterEncoder(valueType);
    return web3.eth.abi.encodeParameters([kType, vType], [kEnc(key), vEnc(value)]);
  });
  return web3.eth.abi.encodeParameters(['string', 'uint256', 'bytes[]'], [kind, timestamp, pairsEncoded]);
}

export function sign(message: string, privateKey: string): SignedMessage {
  const hash = web3.utils.keccak256(message);
  const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
  const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
  const signatory = web3.eth.accounts.recover(hash, v, r, s);
  return {hash, message, signature, signatory};
}
