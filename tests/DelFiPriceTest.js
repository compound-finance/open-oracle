describe('Oracle', () => {
  it('sanity checks the delfi price view', async () => {
    const {
      account,
      address,
      bytes,
      uint256,
      deploy,
      encode,
      sign,
      web3
    } = saddle; // XXX this kinda sucks

    const sources = [
      '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10',
      '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf11',
      '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf12',
      '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf13',
      '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf14',
      '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf15',
    ].map(web3.eth.accounts.privateKeyToAccount);
    const oracle = await deploy('Oracle', [], {from: account});
    const delfi = await deploy('DelFiPrice', [oracle.address, sources.map(a => a.address)]);
    const now = new Date - 0;

    // Reads a price of an asset that doesn't exist yet
    expect(await delfi.methods.prices('ETH').call()).numEquals(0);

    async function postPrices(timestamp, priceses, symbols) {
      const messages = [], signatures = [];
      priceses.forEach((prices, i) => {
        let {
          message,
          signature,
          signatory
        } = sign(encode(timestamp, prices.map(([symbol, price]) => [bytes(symbol), uint256(price)])), sources[i].privateKey);
        expect(signatory).toEqual(sources[i].address);
        messages.push(message);
        signatures.push(signature);
      })
      return delfi.methods.postPrices(messages, signatures, symbols).send({from: account, gas: 5000000});
    }

    async function getPrice(symbol) {
      return delfi.methods.prices(symbol).call()
    }


    /** Posts nothing **/

    const post0 = await postPrices(now, [], ['ETH'])
    expect(post0.gasUsed).toBeLessThan(100000);
    expect(await getPrice('ETH')).numEquals(0);


    /** Posts a price for 1 symbol from 1 source, stores median **/

    const post1 = await postPrices(now, [
      [['ETH', 257]]
    ], ['ETH']);
    expect(post1.gasUsed).toBeLessThan(200000);

    expect(await getPrice('ETH')).numEquals(257);


    /** Posts a price for 2 symbols from 2 sources, stores median **/

    const post2 = await postPrices(now + 1, [
      [
        ['BTC', 9000],
        ['ETH', 257]
      ],
      [
        ['BTC', 8000],
        ['ETH', 255]
      ]
    ], ['ETH']);
    expect(post2.gasUsed).toBeLessThan(500000);

    expect(await getPrice('BTC')).numEquals(0); // not added to list of symbols to update
    expect(await getPrice('ETH')).numEquals(257);


    /** Posts a price for 2 symbols from 3 sources, stores median **/

    const post3 = await postPrices(now + 2, [
      [
        ['BTC', 9000],
        ['ETH', 257]
      ],
      [
        ['BTC', 8500],
        ['ETH', 256]
      ],
      [
        ['BTC', 8000],
        ['ETH', 255]
      ]
    ], ['BTC', 'ETH']);
    expect(post3.gasUsed).toBeLessThan(600000);

    expect(await getPrice('BTC')).numEquals(8500);
    expect(await getPrice('ETH')).numEquals(256);


    /** Posts a price from a non-source, median does not change **/

    // XXX

  }, 30000);
});