import * as Web3 from 'web3';
const web3 = new Web3();

interface TypeSignature {
  name: string,
  keyString: string,
  valueType: string,
  encoder: (any) => any,
  magic: string
};

const Delphi = {
  annotateType: (name: string, keyType: string, valueType: string): TypeAnnotation {
    let encoder = (x) => x;
    let actualValueType;

    if (valueType === 'decimal') {
      encoder = (x) => Number(`${x}e18`);
      actualValueType = 'uint256';
    }

    // Magic: kec(<name>:<input_type>:<output_type>), e.g. kec("price:string:uint256")
    return {
      name,
      keyType,
      valueType: actualValueType,
      encoder,
      magic: web3.utils.keccak256(`${name}:${keyType}:${valueType}`)
    };
  },

  encode: (typeSig: TypeSignature, timestamp: number, pairs: [any, any][] | object): string => {
    let actualPairs = Array.isArray(pairs) ? pairs : Object.entries(pairs);
    let pairsEncoded = actualPairs.map(([key, value]) => {
      return web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
      web3.eth.abi.encodeParameter(typeSig.keyType, key),
      web3.eth.abi.encodeParameter(typeSig.valueType, typeSig.encoder(value))
      ]);
    });
    return web3.eth.abi.encodeParameters(['bytes32', 'uint256', 'bytes[]'], [
      typeSig.magic,
      timestamp,
      pairsEncoded
    ]);
  },

  sign: (data: string, privateKey: string): string => {
    let {r, s, v, messageHash} = web3.eth.accounts.sign(web3.utils.keccak256(data), privateKey);
    return web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
  }
};
