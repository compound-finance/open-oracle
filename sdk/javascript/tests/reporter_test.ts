import {decode, encode, sign} from '../src/reporter';

test('encode', async () => {
  let encoded = encode('prices', 12345678, {"eth": 5.0, "zrx": 10.0});
  expect(decode('prices', encoded).map(([t, k, v]) => [t.toString(), k, v.toString()])).toEqual([
    ["12345678", 'ETH', (5.0e6).toString()],
    ["12345678", 'ZRX', (10.0e6).toString()]
  ]);
});

test('sign', async () => {
  let [{signature}] = sign('some data', '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');
  expect(signature).toEqual('0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c');
});
