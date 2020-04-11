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
    actualParamType = 'uint64';
    actualParamDec = (x) => x / 1e6;
  }

  if (paramType == 'symbol') {
    actualParamType = 'string';
    actualParamDec = (x) => x; // we don't know what the original case was anymore
  }

  return [actualParamType, actualParamDec];
}

export function decode(kind: string, messages: string[]): [number, any, any][] {
  const [keyType, valueType] = getKeyAndValueType(kind);
  const [kType, kDec] = fancyParameterDecoder(keyType);
  const [vType, vDec] = fancyParameterDecoder(valueType);
  return messages.map((message): [number, any, any] => {
    const {0: kind_, 1: timestamp, 2: key, 3: value} = web3.eth.abi.decodeParameters(['string', 'uint64', kType, vType], message);
    if (kind_ != kind)
      throw new Error(`Expected data of kind ${kind}, got ${kind_}`);
    return [timestamp, key, value];
  });
}

export function fancyParameterEncoder(paramType: string): [string, (any) => any] {
  let actualParamType = paramType, actualParamEnc = (x) => x;

  // We add a decimal type for reporter convenience.
  // Decimals are encoded as uints with 6 decimals of precision on-chain.
  if (paramType === 'decimal') {
    actualParamType = 'uint64';
    actualParamEnc = (x) => web3.utils.toBN(1e6).muln(x).toString();
  }

  if (paramType == 'symbol') {
    actualParamType = 'string';
    actualParamEnc = (x) => x.toUpperCase();
  }

  return [actualParamType, actualParamEnc];
}

export function encode(kind: string, timestamp: number, pairs: [any, any][] | object): string[] {
  const [keyType, valueType] = getKeyAndValueType(kind);
  const [kType, kEnc] = fancyParameterEncoder(keyType);
  const [vType, vEnc] = fancyParameterEncoder(valueType);
  const actualPairs = Array.isArray(pairs) ? pairs : Object.entries(pairs);
  return actualPairs.map(([key, value]) => {
    return web3.eth.abi.encodeParameters(['string', 'uint64', kType, vType], [kind, timestamp, kEnc(key), vEnc(value)]);
  });
}

export function encodeRotationMessage(rotationTarget: string) : string {
  return web3.eth.abi.encodeParameters(['string', 'address'], ['rotate', rotationTarget]);
}

export function sign(messages: string | string[], privateKey: string): SignedMessage[] {
  const actualMessages = Array.isArray(messages) ? messages : [messages];
  return actualMessages.map((message) => {
    const hash = web3.utils.keccak256(message);
    const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
    const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
    const signatory = web3.eth.accounts.recover(hash, v, r, s);
    return {hash, message, signature, signatory};
  });
}

export async function signWith(messages: string | string[], signer: (string) => Promise<{r: string, s: string, v: string}>): Promise<SignedMessage[]> {
  const actualMessages = Array.isArray(messages) ? messages : [messages];
  return await Promise.all(actualMessages.map(async (message) => {
    const hash = web3.utils.keccak256(message);
    const {r, s, v} = await signer(hash);
    const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
    const signatory = web3.eth.accounts.recover(hash, v, r, s);
    return {hash, message, signature, signatory};
  }));
}
