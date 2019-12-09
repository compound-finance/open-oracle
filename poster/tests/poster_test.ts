import {buildTrxData, findTypes, fetchGasPrice, fetchPayloads} from '../src/poster';
import Web3 from 'web3';

const endpointResponses = {
  "http://localhost:3000": {
    "messages": ["0xmessage"],
    "prices":  {
      "eth": 260,
      "zrx": 0.58,
    },
    "signatures": ["0xsignature"],
  },
  "http://localhost:3000/prices.json": {
    "messages": ["0xmessage"],
    "prices":  {
      "eth": 250,
      "zrx": 1.58,
    },
    "signatures": ["0xsignature"],
  }
}

const gasResponses = {
  "https://api.compound.finance/api/gas_prices/get_gas_price": {
    "average": {
      "value": "2600000000"
    },
    "fast": {
      "value": "9000000000"
    },
    "fastest": {
      "value": "21000000000"
    },
    "safe_low": {
      "value": "1000000000"
    }
  }
};

const mockFetch = (responses) => {
  return async (url) => {
    const response = responses[url];
    if (response === undefined) {
      throw new Error(`Mock Fetch: Unknown URL \`${url}\``);
    }

    return {
      text: () => JSON.stringify(response),
      json: () => response
    };
  };
};

describe('loading poster arguments from environment and https', () => {
  test('fetchGasPrice', async () => {
    let gasPrice = await fetchGasPrice(mockFetch(gasResponses));
    expect(gasPrice).toEqual(2600000000);
  });

  test('fetchPayloads', async () => {
    // hits the http endpoints, encodes a transaction
    let payloads = await fetchPayloads(["http://localhost:3000", "http://localhost:3000/prices.json"], mockFetch(endpointResponses));

    expect(payloads).toEqual([
      {
        "messages": ["0xmessage"],
        "prices":  {
          "eth": 260,
          "zrx": 0.58,
        },
        "signatures": ["0xsignature"],
      },
      {
        "messages": ["0xmessage"],
        "prices":  {
          "eth": 250,
          "zrx": 1.58,
        },
        "signatures": ["0xsignature"],
      }]);
  });
});

describe('building a function call', () => {
  test('findTypes', () => {
    let typeString =  "writePrices(bytes[],bytes[],string[])";
    expect(findTypes(typeString)).toEqual(["bytes[]", "bytes[]", "string[]"]);
  });

  test('buildTrxData', () => {
    let messages = ['0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10'];
    let signatures = ['0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c'];
    let prices = {"eth": "250", "zrx": "300"};

    let data = buildTrxData([{messages, signatures, prices}], "writePrices(bytes[],bytes[],string[])");

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
          "name": "whatnot",
          "type": "string[]"
        },
      ],
      "name": "writePrices",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    };

    // @ts-ignore-start
    let officialWeb3Encoding = new Web3().eth.abi.encodeFunctionCall(assumedAbi, [messages, signatures, ['eth', 'zrx']]);
    // @ts-ignore-end

    expect(data).toEqual(officialWeb3Encoding);
  });
});
