import { buildTrxData, findTypes, fetchGasPrice, fetchPayloads, inDeltaRange, filterPayloads } from '../src/poster';
import helpers from '../src/prev_price';
import Web3 from 'web3';

const endpointResponses = {
  "http://localhost:3000": {
    "messages": ["0xmessage"],
    "prices": {
      "eth": 260,
      "zrx": 0.58,
    },
    "signatures": ["0xsignature"],
  },
  "http://localhost:3000/prices.json": {
    "messages": ["0xmessage"],
    "prices": {
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
        "prices": {
          "eth": 260,
          "zrx": 0.58,
        },
        "signatures": ["0xsignature"],
      },
      {
        "messages": ["0xmessage"],
        "prices": {
          "eth": 250,
          "zrx": 1.58,
        },
        "signatures": ["0xsignature"],
      }]);
  });
});

describe('building a function call', () => {
  test('findTypes', () => {
    let typeString = "writePrices(bytes[],bytes[],string[])";
    expect(findTypes(typeString)).toEqual(["bytes[]", "bytes[]", "string[]"]);
  });

  test('buildTrxData', () => {
    let messages = ['0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10'];
    let signatures = ['0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c'];
    let prices = { "eth": "250", "zrx": "300" };

    let data = buildTrxData([{ messages, signatures, prices }], "writePrices(bytes[],bytes[],string[])");

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
    let officialWeb3Encoding = new Web3().eth.abi.encodeFunctionCall(assumedAbi, [messages, signatures, ['ETH', 'ZRX']]);
    // @ts-ignore-end

    expect(data).toEqual(officialWeb3Encoding);
  });
});

describe('checking that numbers are within the specified delta range', () => {
  test('inDeltaRange', () => {
    expect(inDeltaRange(0, 9687.654999, 9696640000)).toEqual(false);
    expect(inDeltaRange(0.01, 9687.654999, 9696640000)).toEqual(false);
    expect(inDeltaRange(0.1, 9687.654999, 9696640000)).toEqual(true);
    expect(inDeltaRange(5, 9687.654999, 9696640000)).toEqual(true);

    expect(inDeltaRange(0, 1, 1e6)).toEqual(false);
    expect(inDeltaRange(-1, 1, 1e6)).toEqual(false);
    expect(inDeltaRange(101, 1, 1e6)).toEqual(false);
    expect(inDeltaRange(0.01, 1, 1e6)).toEqual(true);
    expect(inDeltaRange(5, 1, 1e6)).toEqual(true);
    expect(inDeltaRange(100, 1, 1e6)).toEqual(true);
  })
})

describe.only('filtering payloads', () => {
  let prevPrices = {};
  async function mockPreviosPrice(_sourceAddress, asset, _dataAddress, _web3) {
    return prevPrices[asset];
  }
  test('Filtering payloads, BAT price is more than delta % different', async () => {
    helpers.getSourceAddress = jest.fn();
    helpers.getDataAddress = jest.fn();
    helpers.getPreviousPrice = mockPreviosPrice;

    const payloads = [
      {
        timestamp: '1593209100',
        messages: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        signatures: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        prices: {
          BTC: '9192.23',
          ETH: '230.585',
          XTZ: '2.5029500000000002',
          DAI: '1.0035515',
          REP: '16.83',
          ZRX: '0.3573955',
          BAT: '0.26466',
          KNC: '1.16535',
          LINK: '4.70819'
        }
      }
    ]
    prevPrices = { 'BTC': 9149090000, 'ETH': 229435000, 'DAI': 1003372, 'REP': 16884999, 'ZRX': 357704, 'BAT': 260992, 'KNC': 1156300, 'LINK': 4704680 }

    const filteredPayloads = await filterPayloads(payloads, '0x0', 'BTC,ETH,DAI,REP,ZRX,BAT,KNC,LINK,COMP', 1, new Web3());
    expect(filteredPayloads).toEqual([
      {
        timestamp: '1593209100',
        messages: ['0x7'],
        signatures: ['0x7'],
        prices: { BAT: '0.26466' }
      }
    ]
    );
  })
})
