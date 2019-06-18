import {buildTrxData, findTypes, loadViewAddress} from '../src/index';
import AbiCoder from 'web3-eth-abi';

describe('loading poster arguments from environment', () => {
  test.only('loadViewAddress', () => {
    let viewAddress = loadViewAddress({"view-address": "0xMYVIEW"});
    expect(viewAddress).toEqual("0xMYVIEW");
  });

  test('loadPayload', () => {
    // hits the http endpoints, encodes a transaction
  });

  test.only('buildTrxData', () => {
    let encodedMessage = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10'

    let signedMessage = '0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c'

    let data = buildTrxData(
      [{message: encodedMessage, signature: signedMessage}],
      {"view-function-name": "writePrices(bytes[],bytes[])"}
    );

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
        }
      ],
      "name": "writePrices",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    };

    let officialWeb3Encoding =
      AbiCoder.encodeFunctionCall(assumedAbi, [[encodedMessage], [signedMessage]]);

    expect(data).toEqual(officialWeb3Encoding);
  });

  test.only('findTypes', () => {
    let typeString =  "writePrices(bytes[],bytes[])"
    expect(findTypes(typeString)).toEqual(["bytes[]", "bytes[]"])
  })
})
