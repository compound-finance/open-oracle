import {buildTrxData, findTypes, fetchGasPrice, fetchPayloads} from '../src/poster';
import { AbiCoder } from 'web3-eth-abi';
require('sepia');

describe('loading poster arguments from environment and https', () => {
  test('fetchGasPrice', async () => {
    let gasPrice = await fetchGasPrice();
    expect(gasPrice).toEqual(10000000000);
  });

  test('fetchPayloads', async () => {
    // hits the http endpoints, encodes a transaction
    let payloads = await fetchPayloads("http://localhost:3000,http://localhost:3000/prices.json".split(","));

    expect(payloads).toEqual([
      {
        "encoded": "0xmessage",
        "prices":  {
          "eth": 260,
          "zrx": 0.58,
        },
        "signature": "0xsignature",
      },
      {
        "encoded": "0xmessage",
        "prices":  {
          "eth": 250,
          "zrx": 1.58,
        },
        "signature": "0xsignature",
      }]);
  });
});

describe('building a function call', () => {
  test('findTypes', () => {
    let typeString =  "writePrices(bytes[],bytes[],string[])";
    expect(findTypes(typeString)).toEqual(["bytes[]", "bytes[]", "string[]"]);
  });

  test('buildTrxData', () => {
    let encodedMessage = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';

    let signedMessage = '0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c';

    let prices = {"eth": "250", "zrx": "300"};

    let data = buildTrxData(
      [{encoded: encodedMessage, signature: signedMessage, prices: prices}],
      "writePrices(bytes[],bytes[],string[])");

    let assumedAbi = {
      "constant": false,
      "inputs": [
        {
          "name": "anything",
          "type": "bytes[]"
        },
        {
          "name": "whatever",
          "type": "bytes[]"
        },
        {
          "name": "moar",
          "type": "string[]"
        }
      ],
      "name": "writePrices",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    };

    // @ts-ignore-start
    let officialWeb3Encoding = new AbiCoder().encodeFunctionCall(assumedAbi, [[encodedMessage], [signedMessage], Object.keys(prices)]);
    // @ts-ignore-end

    expect(data).toEqual(officialWeb3Encoding);
  });
});
