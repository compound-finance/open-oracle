import {decode, encode, sign} from '../src/reporter';

test('encode', async () => {
  let encoded = encode('string', 'decimal', 12345678, {"eth": 5.0, "zrx": 10.0});
  let decoded = decode('string', 'decimal', encoded);
  let [timestamp, pairs] = decoded;

  expect(timestamp).numEquals(12345678); // XXX saddle not in this module
  expect(pairs).toEqual([['eth', 5.0], ['zrx', 10.0]]);
});

test('sign', async () => {
  let signed = sign('some data', '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

  expect(signed).toEqual('0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c');
});
