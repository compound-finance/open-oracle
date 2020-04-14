import {decode, encode, encodeRotationMessage, sign, signWith} from '../src/reporter';
import Web3 from 'web3';
import utils from 'web3-utils';

const web3 = new Web3(null); // This is just for encoding, etc.

test('encode', async () => {
  let encoded = encode('prices', 12345678, {"eth": 5.0, "zrx": 10.0});
  expect(decode('prices', encoded).map(([t, k, v]) => [t.toString(), k, v.toString()])).toEqual([
    ["12345678", 'ETH', (5.0e6).toString()],
    ["12345678", 'ZRX', (10.0e6).toString()]
  ]);
});

test('sign', async () => {
  let [{signatory, signature}] = sign('some data', '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  expect(signature).toEqual('0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c');
  expect(signatory).toEqual('0x1826265c3156c3B9b9e751DC4635376F3CD6ee06');
});

test('should handle signing an empty array', async () => {
  const encoded = encode('prices', 12345678, []);
  expect(encoded).toEqual([]);
  const signed = sign(encoded, '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  expect(signed).toEqual([]);
});

test('signing rotation message', async () => {
  const rotationTarget = '0xAbcdef0123456789000000000000000000000005'
  const encoded = encodeRotationMessage(rotationTarget)
  const [ signed ] = sign(encoded, '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d');

  const {0: _type, 1: target} = web3.eth.abi.decodeParameters(['string', 'address'], signed.message);
  expect(_type).toEqual('rotate')
  expect(target).toEqual(rotationTarget);

  const recoverable = utils.keccak256(encoded)
  const recovered = web3.eth.accounts.recover(recoverable, signed.signature)

  expect(signed.signatory).toEqual('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1');
  expect(recovered).toEqual(signed.signatory)
});

test('signWith', async () => {
  let signer = async (hash) => web3.eth.accounts.sign(hash, '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  let [{signature}] = await signWith('some data', signer);
  expect(signature).toEqual('0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c');
});
