import Web3 from 'web3';
import {
  buildTrxData,
  fetchGasPrice,
  fetchPayloads,
  inDeltaRange,
  filterPayloads
} from '../src/poster';
import * as prevPrice from '../src/prev_price';
import * as util from '../src/util';

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
    expect(util.findTypes(typeString)).toEqual(["bytes[]", "bytes[]", "string[]"]);
  });

  test('buildTrxData', () => {
    let feedItems = [<OpenPriceFeedItem>{
      message: '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10',
      signature: '0x04a78a7b3013f6939da19eac6fd1ad5c5a20c41bcc5d828557442aad6f07598d029ae684620bec13e13d018cba0da5096626e83cfd4d5356d808d7437a0a5076000000000000000000000000000000000000000000000000000000000000001c',
      price: 250.0,
      symbol: 'eth'
    }];
    let messages = feedItems.map(({message}) => message);
    let signatures = feedItems.map(({signature}) => signature);

    let data = buildTrxData(feedItems, "writePrices(bytes[],bytes[],string[])");

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
    let officialWeb3Encoding = new Web3().eth.abi.encodeFunctionCall(assumedAbi, [messages, signatures, ['ETH']]);
    // @ts-ignore-end

    expect(data).toEqual(officialWeb3Encoding);
  });
});

describe('checking that numbers are within the specified delta range', () => {
  test('inDeltaRange', () => {
    expect(inDeltaRange(0, 9687.654999, 9696.640000)).toEqual(false);
    expect(inDeltaRange(0.01, 9687.654999, 9696.640000)).toEqual(false);
    expect(inDeltaRange(0.1, 9687.654999, 9696.640000)).toEqual(true);
    expect(inDeltaRange(5, 9687.654999, 9696.640000)).toEqual(true);

    expect(inDeltaRange(0, 1, 1)).toEqual(false);
    expect(inDeltaRange(-1, 1, 1)).toEqual(false);
    expect(inDeltaRange(101, 1, 1)).toEqual(false);
    expect(inDeltaRange(0.01, 1, 1)).toEqual(true);
    expect(inDeltaRange(5, 1, 1)).toEqual(true);
    expect(inDeltaRange(100, 1, 1)).toEqual(true);
  })
})

describe('filtering payloads', () => {
  function mockPrevPrices(prevPrices={}) {
    async function mockPreviousPrice(_sourceAddress, asset, _dataAddress, _web3) {
      return prevPrices[asset];
    }

    const getSourceAddressSpy = jest.spyOn(prevPrice, 'getSourceAddress');
    getSourceAddressSpy.mockImplementation(() => Promise.resolve(""));
    const getDataAddressSpy = jest.spyOn(prevPrice, 'getDataAddress');
    getDataAddressSpy.mockImplementation(() => Promise.resolve(""));
    const getPreviousPriceSpy = jest.spyOn(prevPrice, 'getPreviousPrice');
    getPreviousPriceSpy.mockImplementation(mockPreviousPrice);
  };

  function mockMessages(messages: {[message: string]: DecodedMessage}) {
    const decodeMessageSpy = jest.spyOn(util, 'decodeMessage');

    decodeMessageSpy.mockImplementation((message, web3) => {
      return messages[message];
    });
  };

  function transformPayloads(payloads) {
    return Object.fromEntries(payloads.map((payload) => {
      return util.zip(Object.entries(payload.prices), payload.messages).map(([[symbol, price], message]) => {
        return [message, {
          dataType: 'type',
          timestamp: 0,
          symbol,
          price
        }];
      })
    }).flat());
  }

  test('Filtering payloads, BAT price is more than delta % different', async () => {
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
    ];
    mockMessages(transformPayloads(payloads));
    mockPrevPrices({ 'BTC': 9149090000, 'ETH': 229435000, 'DAI': 1003372, 'REP': 16884999, 'ZRX': 357704, 'BAT': 260992, 'KNC': 1156300, 'LINK': 4704680 });

    const feedItems = await filterPayloads(payloads, '0x0', ['BTC', 'ETH', 'DAI', 'REP', 'ZRX', 'BAT', 'KNC', 'LINK', 'COMP'], {BTC: 1, ETH: 1, DAI: 1, REP: 1, ZRX: 1, BAT: 1, KNC: 1, LINK: 1, COMP: 1}, new Web3());
    expect(feedItems).toEqual([
      {
        dataType: "type",
        message: "0x7",
        prev: 0.260992,
        price: 0.26466,
        signature: "0x7",
        source: "",
        symbol: "BAT",
        timestamp: 0,
      }
    ]);
  })

  test('Filtering payloads, ETH, BTC and ZRX prices are more than delta % different, ZRX, XTZ are not supported', async () => {
    mockPrevPrices({ 'BTC': 10000000000, 'ETH': 1000000000, 'ZRX': 1011000, 'REP': 16000000, 'DAI': 1000000, 'BAT': 1000000, 'KNC': 2000000, 'LINK': 5000000 });

    const payloads = [
      {
        timestamp: '1593209100',
        messages: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        signatures: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        prices: {
          BTC: '10101',
          ETH: '1011',
          XTZ: '10',
          DAI: '1',
          REP: '16',
          ZRX: '1.011',
          BAT: '1',
          KNC: '2',
          LINK: '5'
        }
      }
    ];
    mockMessages(transformPayloads(payloads));

    const feedItems = await filterPayloads(payloads, '0x0', ['BTC', 'ETH', 'DAI', 'REP', 'BAT', 'KNC', 'LINK', 'COMP'], {BTC: 1, ETH: 1, DAI: 1, REP: 1, ZRX: 1, BAT: 1, KNC: 1, LINK: 1, COMP: 1}, new Web3());
    expect(feedItems).toEqual([
      {
        message: '0x1',
        signature: '0x1',
        dataType: 'type',
        timestamp: 0,
        symbol: 'BTC',
        price: 10101,
        source: '',
        prev: 10000
      },
      {
        message: '0x2',
        signature: '0x2',
        dataType: 'type',
        timestamp: 0,
        symbol: 'ETH',
        price: 1011,
        source: '',
        prev: 1000
      }
    ]);
  })

  test('Filtering payloads, ETH, BTC and ZRX prices are more than delta % different, no assets are supported', async () => {
    mockPrevPrices({ 'BTC': 10000000000, 'ETH': 1000000000, 'ZRX': 1011000, 'REP': 16000000, 'DAI': 1000000, 'BAT': 1000000, 'KNC': 2000000, 'LINK': 5000000 });

    const payloads = [
      {
        timestamp: '1593209100',
        messages: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        signatures: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        prices: {
          BTC: '10101',
          ETH: '1011',
          XTZ: '10',
          DAI: '1',
          REP: '16',
          ZRX: '1.011',
          BAT: '1',
          KNC: '2',
          LINK: '5'
        }
      }
    ]
    mockMessages(transformPayloads(payloads));

    const feedItems = await filterPayloads(payloads, '0x0', [], {}, new Web3());
    expect(feedItems).toEqual([]);
  })

  test('Filtering payloads, delta is 0% percent, all supported prices should be updated', async () => {
    mockPrevPrices({ 'BTC': 10000000000, 'ETH': 1000000000, 'ZRX': 1011000, 'REP': 16000000, 'DAI': 1000000, 'BAT': 1000000, 'KNC': 2000000, 'LINK': 5000000 });

    const payloads = [
      {
        timestamp: '1593209100',
        messages: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        signatures: ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9'],
        prices: {
          BTC: '10101',
          ETH: '1011',
          XTZ: '10',
          DAI: '1',
          REP: '16',
          ZRX: '1.011',
          BAT: '1',
          KNC: '2',
          LINK: '5'
        }
      }
    ];
    mockMessages(transformPayloads(payloads));

    const feedItems = await filterPayloads(payloads, '0x0', ['BTC', 'ETH', 'DAI', 'REP', 'ZRX', 'BAT', 'KNC', 'LINK', 'COMP'], {BTC: 0, ETH: 0, DAI: 0, REP: 0, ZRX: 0, BAT: 0, KNC: 0, LINK: 0, COMP: 0}, new Web3());
    expect(feedItems).toEqual([
      {
        message: '0x1',
        signature: '0x1',
        dataType: 'type',
        timestamp: 0,
        symbol: 'BTC',
        price: 10101,
        source: '',
        prev: 10000
      },
      {
        message: '0x2',
        signature: '0x2',
        dataType: 'type',
        timestamp: 0,
        symbol: 'ETH',
        price: 1011,
        source: '',
        prev: 1000
      },
      {
        message: '0x4',
        signature: '0x4',
        dataType: 'type',
        timestamp: 0,
        symbol: 'DAI',
        price: 1,
        source: '',
        prev: 1
      },
      {
        message: '0x5',
        signature: '0x5',
        dataType: 'type',
        timestamp: 0,
        symbol: 'REP',
        price: 16,
        source: '',
        prev: 16
      },
      {
        message: '0x6',
        signature: '0x6',
        dataType: 'type',
        timestamp: 0,
        symbol: 'ZRX',
        price: 1.011,
        source: '',
        prev: 1.011
      },
      {
        message: '0x7',
        signature: '0x7',
        dataType: 'type',
        timestamp: 0,
        symbol: 'BAT',
        price: 1,
        source: '',
        prev: 1
      },
      {
        message: '0x8',
        signature: '0x8',
        dataType: 'type',
        timestamp: 0,
        symbol: 'KNC',
        price: 2,
        source: '',
        prev: 2
      },
      {
        message: '0x9',
        signature: '0x9',
        dataType: 'type',
        timestamp: 0,
        symbol: 'LINK',
        price: 5,
        source: '',
        prev: 5
      }
    ]);
  })
});
