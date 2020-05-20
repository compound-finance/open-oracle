const { encode, sign, encodeRotationMessage } = require('../sdk/javascript/.tsbuilt/reporter');
const { time, numToBigNum, numToHex, address, sendRPC } = require('./Helpers');

async function setup() {
  const source = web3.eth.accounts.privateKeyToAccount('0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

  const underlyingAddresses = [...Array(9).keys()].map(address);

  const cTokensList = await Promise.all(
    underlyingAddresses.map((x) => {
      return deploy('MockCToken', [x]);
    })
  );

  const tokens = {
    eth: underlyingAddresses[0],
    usdc: underlyingAddresses[1],
    dai: underlyingAddresses[2],
    rep: underlyingAddresses[3],
    wbtc: underlyingAddresses[4],
    bat: underlyingAddresses[5],
    zrx: underlyingAddresses[6],
    sai: underlyingAddresses[7],
    usdt: underlyingAddresses[8],
  };

  const cTokens = {
    cEth: cTokensList[0],
    cUsdc: cTokensList[1],
    cDai: cTokensList[2],
    cRep: cTokensList[3],
    cWbtc: cTokensList[4],
    cBat: cTokensList[5],
    cZrx: cTokensList[6],
    cSai: cTokensList[7],
    cUsdt: cTokensList[8]
};

  const anchorMantissa = numToHex(1e17); //1e17 equates to 10% tolerance for median to be above or below anchor
  const priceData = await deploy('OpenOraclePriceData', []);
  const anchorOracle = await deploy('MockAnchorOracle');
  const delfi = await deploy('AnchoredView', [
    priceData._address,
    source.address,
    anchorOracle._address,
    anchorMantissa,
    {
      cEthAddress: cTokens.cEth._address,
      cUsdcAddress: cTokens.cUsdc._address,
      cDaiAddress: cTokens.cDai._address,
      cRepAddress: cTokens.cRep._address,
      cWbtcAddress: cTokens.cWbtc._address,
      cBatAddress: cTokens.cBat._address,
      cZrxAddress: cTokens.cZrx._address,
      cSaiAddress: cTokens.cSai._address,
      cUsdtAddress: cTokens.cUsdt._address
    }
  ]);

  async function postPrices(timestamp, prices2dArr, symbols, signer = source) {
    const messages = [],
          signatures = [];

    prices2dArr.forEach((prices, i) => {
      const signed = sign(
        encode(
          'prices',
          timestamp,
          prices
        ),
        signer.privateKey
      );
      for (let { message, signature } of signed) {
        messages.push(message);
        signatures.push(signature);
      }
    });
    return send(delfi, 'postPrices', [messages, signatures, symbols]);
  }

  async function getPrice(symbol) {
    return call(delfi, 'prices', [symbol]);
  }

  async function primeAnchor(usdRatio = "2000000000000000000000000000") {
    // sets up anchor for $500 eth and 10k btc
    await send(anchorOracle, 'setPrice', [tokens.usdc, numToHex(usdRatio)]);

    const theRatio = "200000000000000000000000000000";
    await send(anchorOracle, 'setPrice', [tokens.wbtc, numToHex(theRatio)]);
    await send(anchorOracle, 'setPrice', [tokens.eth, numToHex("1000000000000000000")]);
  }

  return {
    source,
    anchorMantissa,
    priceData,
    delfi,
    anchorOracle,
    cTokens,
    tokens,
    postPrices,
    primeAnchor,
    getPrice
  };
}


describe('AnchoredView', () => {
  let source,
      anchorMantissa,
      priceData,
      delfi,
      anchorOracle,
      cTokens,
      tokens,
      postPrices,
      primeAnchor,
      getPrice;

  const timestamp = time() - 5;
  describe('Anchoring', () => {
    beforeEach(async done => {
      ({
        source,
        anchorMantissa,
        priceData,
        delfi,
        anchorOracle,
        cTokens,
        tokens,
        postPrices,
        primeAnchor,
        getPrice
      } = await setup());
      await primeAnchor();
      done();
    });

    it('posting no ETH price should guard price', async () => {
      const post1 = await postPrices(timestamp, [[['ETH', 91]]], ['ETH']);

      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(post1.events.PricePosted).toBe(undefined);
      expect(await call(delfi, '_prices', ['ETH'])).numEquals(0);
    });

    it('posting within anchor should update stored value', async () => {
      const post1 = await postPrices(timestamp, [[['ETH', 492]]], ['ETH']);

      expect(post1.gasUsed).toBeLessThan(253000);
      expect(post1.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(post1.events.PriceUpdated.returnValues.price).numEquals(492e6);
      expect(await call(delfi, 'prices', ['ETH'])).numEquals(492e6);

      // double the dollar ratio
      await send(anchorOracle, 'setPrice', [tokens.usdc, "4000000000000000000000000000"]);
      const post2 = await postPrices(timestamp + 1, [[['ETH', 250]]], ['ETH']);
      expect(post2.gasUsed).toBeLessThan(252000);
      expect(post2.events.PriceUpdated.returnValues.symbol).toBe('ETH');
      expect(post2.events.PriceUpdated.returnValues.price).numEquals(250e6);
      expect(await getPrice('ETH')).numEquals(250e6);
    });

    it('should not update source price if anchor is much lower, returns anchor price', async () => {
      const post1 = await postPrices(timestamp, [[['ETH', 1000]]], ['ETH']);
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await call(delfi, '_prices', ['ETH'])).numEquals(0);
    });

    it('should not update source price if anchor is much higher, returns anchor price', async () => {
      const post1 = await postPrices(timestamp, [[['ETH', 116]]], ['ETH']);
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(post1.events.PriceGuarded).not.toBe(undefined);
      expect(await call(delfi, '_prices', ['ETH'])).numEquals(0);
    });

    it('should updates source price if anchor is cut, even if  price outside of anchor', async () => {
      await sendRPC(web3, 'evm_mineBlockNumber', 5760);
      await send(delfi, 'cutAnchor', []);
      expect(await call(delfi, 'anchorBreaker')).toEqual(true);

      const post1 = await postPrices(timestamp, [[['ETH', 1000]]], ['ETH']);
      expect(post1.events.PriceUpdated).not.toBe(undefined);
      expect(post1.events.PriceGuarded).toBe(undefined);
      expect(await call(delfi, '_prices', ['ETH'])).numEquals(1000e6);
    });


    it('posting all source for two assets should update stored values', async () => {
      const post1 = await postPrices(timestamp,
                                     [[['ETH', 510], ['BTC', 11000]]],
                                     ['ETH', 'BTC']);
      expect(post1.gasUsed).toBeLessThan(650000);
      expect(post1.events.PriceUpdated[0].returnValues.symbol).toBe('ETH');
      expect(post1.events.PriceUpdated[0].returnValues.price).numEquals(510e6);
      expect(await getPrice('ETH')).numEquals(510e6);

      expect(post1.events.PriceUpdated[1].returnValues.symbol).toBe('BTC');
      expect(post1.events.PriceUpdated[1].returnValues.price).numEquals(11000e6);
      expect(await getPrice('BTC')).numEquals(11000e6);
    });

    it('view should use most recent post from source', async () => {
      await postPrices(
        timestamp,
        [
          [['ETH', 510], ['BTC', 11000]],
        ],
        ['ETH', 'BTC'],
        source
      );
      const post2 = await postPrices(
        timestamp + 1,
        [
          [['ETH', 502], ['BTC', 10008]],
        ],
        ['ETH', 'BTC'],
        source
      );

      expect(post2.events.PriceUpdated[0].returnValues.price).numEquals(502e6);
      expect(await getPrice('ETH')).numEquals(502e6);

      expect(post2.events.PriceUpdated[1].returnValues.price).numEquals(10008e6);
      expect(await getPrice('BTC')).numEquals(10008e6);
    });

    it('should revert on posting invalid message', async () => {
      await expect(
        send(delfi, 'postPrices', [['0xabc'], ['0x123'], []], { gas: 5000000 })
      ).rejects.toRevert();
    });

    it('allows writing unconfigured tokens to storage, but not view', async () => {
      await postPrices(timestamp, [[['BLETH', 500]]], ['BLETH']);

      expect(await getPrice('BLETH')).numEquals(0);
      expect(await call(priceData, 'getPrice', [source.address, 'BLETH'])).numEquals(500e6);
    });


    it('posting from non-source should not change median or emit event', async () => {
      await postPrices(timestamp, [[['ETH', 500]]], ['ETH']);

      let nonSource = web3.eth.accounts.privateKeyToAccount('0x666ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

      const post1 = await postPrices(timestamp + 1,
                                     [[['ETH', 595]]],
                                     ['ETH'],
                                     nonSource);

      expect(post1.events.PriceGuarded).toBe(undefined);
      expect(post1.events.PriceUpdated).toBe(undefined);
      expect(await getPrice('ETH')).numEquals(500e6);
    });

    it('guards when posts usdc or usdt, but reads fixed price always', async () => {
      let post1 = await postPrices(timestamp, [[['USDC', 1.01], ['USDT', 0.99] ]], ['USDC', 'USDT']);

      expect(post1.events.PriceGuarded).toBe(undefined);
      expect(post1.events.PriceUpdated[0].returnValues.symbol).toEqual('USDC');
      expect(post1.events.PriceUpdated[0].returnValues.price).numEquals(1.01e6);
      expect(post1.events.PriceUpdated[1].returnValues.symbol).toEqual('USDT');
      expect(post1.events.PriceUpdated[1].returnValues.price).numEquals(0.99e6);
      expect(await getPrice('USDC')).numEquals(1e6);
      expect(await getPrice('USDT')).numEquals(1e6);
    });
  });

  describe("getAnchorInUsd", () => {
    beforeEach(async () => {
      ({delfi, anchorOracle, cTokens} = await setup());
    });

    it("returns one with 6 decimals when given usd or usdt", async () => {

      let usdcPrice = "5812601720530109000000000000";
      const converted_usdc_price = await call(delfi, 'getAnchorInUsd', [cTokens.cUsdc._address, usdcPrice]);
      const converted_usdc_price_p = await send(delfi, 'getAnchorInUsd', [cTokens.cUsdc._address, usdcPrice]);
      expect(converted_usdc_price).toEqual(1e6.toString());

      const converted_usdt_price = await call(delfi, 'getAnchorInUsd', [cTokens.cUsdt._address, usdcPrice]);
      expect(converted_usdt_price).toEqual(1e6.toString());

    });

    // [open oracle symbol, proxy price in ether, open oracle price in usd]
    [
      ["ETH", 1e18, 172.04e6],
      ["SAI", 5285551943761727, 0.909326e6], // sai priced at 189, so drops to 90 cents here
      ["DAI", 5905879257418508, 1.016047e6],

      ["BAT", 931592500000000, 0.160271e6],
      ["REP", 56128970000000000, 9.656427e6],
      ["ZRX", 985525000000000, 0.169549e6],
      ["BTC", "399920015996800660000000000000", 6880.223955e6] // 8 decimals underlying -> 10 extra decimals on proxy 
    ].forEach(([openOracleKey, proxyPrice, expectedOpenOraclePrice]) => {
      it(`converts  ${openOracleKey} price through proxy usdc, with 6 decimals`, async () => {
        // TODO: fix sai price test after SAI Global Settlement
        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        await send(anchorOracle, 'setUnderlyingPrice', [tokenAddress, numToHex(proxyPrice)]);
        // ~ $172 eth
        let usdcPrice = "5812601720530109000000000000";
        const converted_price = await call(delfi, 'getAnchorInUsd', [tokenAddress, usdcPrice]);
        expect(converted_price).toEqual(expectedOpenOraclePrice.toString());
      });
    });

  });

  describe("getUnderlyingPrice", () => {
    beforeEach(async () => {
      ( {
        delfi,
        anchorOracle,
        postPrices,
        primeAnchor,
        cTokens,
        source
      } = await setup() );

      // // ~ $172 eth
      await primeAnchor("5812601720530109000000000000");
      await postPrices(
        timestamp,
        [[['ETH', 172.00]]],
        ['ETH']);
    });


    ["USDC", "USDT"].forEach((openOracleKey) => {
      it(`returns 1 with 36 - 6 for ${openOracleKey}`, async () => {
        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        const underlying_price = await call(delfi, 'getUnderlyingPrice', [tokenAddress]);

        expect(underlying_price).toEqual("1000000000000000000000000000000");
      });
    });


    it("returns source price with 36 - 8 decimals for BTC ", async () => {
      await postPrices(
        timestamp,
        [[['BTC', 3443.00]]],
        ['BTC']);
      let tokenAddress = await call(delfi, 'getCTokenAddress', ["BTC"]);
      const underlying_price = await call(delfi, 'getUnderlyingPrice', [tokenAddress]);

      const actualOpenOraclePrice = await call(delfi, 'prices', ["BTC"]);

      expect(underlying_price).numEquals("34430000000000000000000000000000");
    });

    [
      ["ETH", 1e18, 173.04],
      ["DAI", 5905879257418508, 1.01604],
      ["BAT", 931592500000000, 0.16027],
      ["REP", 56128970000000000, 9.6564],
      ["ZRX", 985525000000000, 0.169549]
    ].forEach(([openOracleKey, anchorPrice, openOraclePrice]) => {
      it(`returns source price with 36 - 18 decimals for ${openOracleKey}`, async () => {
        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        if (openOracleKey == "ETH") {
          await send(anchorOracle, 'setPrice', [tokenAddress, numToHex(anchorPrice)]);
        } else {
          await send(anchorOracle, 'setUnderlyingPrice', [tokenAddress, numToHex(anchorPrice)]);
        }
        const post1 = await postPrices(
          time() - 5,
          [[[openOracleKey, openOraclePrice]]],
          [openOracleKey],
          source
        );

        const underlying_price = await call(delfi, 'getUnderlyingPrice', [tokenAddress]);
        const actualOpenOraclePrice = openOraclePrice * 1e6;

        expect(underlying_price).toEqual(numToBigNum(actualOpenOraclePrice).mul(numToBigNum("1000000000000")).toString(10));
      });
    });

    [
      // all current tokens have a reporter price
    ].forEach(([openOracleKey, anchorPrice, openOraclePrice]) => {
      it(`returns anchor price converted to dollars with 18 decimals for ${openOracleKey} converted through open oracle eth price`, async () => {

        let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
        await send(anchorOracle, 'setUnderlyingPrice', [tokenAddress, numToHex(anchorPrice)]);
        const post1 = await postPrices(
          time() - 5,
          [[['ETH', 172.04]]],
          ['ETH'],
          source
        );

        const underlying_price = await call(delfi, 'getUnderlyingPrice', [tokenAddress]);

        expect(underlying_price).toEqual(openOraclePrice);
      });
    });

      [
        ["ETH", 1e18],
        ["SAI", 5285551943761727],
        ["DAI", 5905879257418508],
        ["USDT", "5905879257418508000000000000"],
        ["USDC", "5905879257418508000000000000"],
        ["BAT", 931592500000000],
        ["REP", 56128970000000000],
        ["ZRX", 985525000000000],
        ["BTC", "399920015996800660000000000000"] // 8 decimals underlying -> 10 extra decimals on proxy 
      ].forEach(([openOracleKey, proxyPrice]) => {
        it(`returns anchor price if reporterBreaker is set for ${openOracleKey}`, async () => {
          let tokenAddress = await call(delfi, 'getCTokenAddress', [openOracleKey]);
          if (openOracleKey == "USDT") {
            await send(anchorOracle, 'setUnderlyingPrice', [cTokens.cUsdc._address, numToHex(proxyPrice)]);
          } else {
            await send(anchorOracle, 'setUnderlyingPrice', [tokenAddress, numToHex(proxyPrice)]);
          }

          const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
          let encoded = encodeRotationMessage(rotationTarget);
          const [ signed ] = sign(encoded, source.privateKey);

          expect(await call(delfi, 'reporterBreaker', [])).toEqual(false);

          await send(delfi, 'invalidate', [encoded, signed.signature]);
          expect(await call(delfi, 'reporterBreaker', [])).toEqual(true);

          expect(await call(delfi, 'getUnderlyingPrice', [tokenAddress])).numEquals(proxyPrice);
      });
    });
  });

  describe("invalidate", () => {
    beforeEach(async () => {
      ({
        source,
        priceData,
        delfi,
        anchorOracle,
        cTokens,
        postPrices
      } = await setup());
    });

    it("reverts if given wrong message", async () => {
      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      let encoded = web3.eth.abi.encodeParameters(['string', 'address'], ['stay still', rotationTarget]);
      const [ signed ] = sign(encoded, source.privateKey);

      await expect(
        send(delfi, 'invalidate', [encoded, signed.signature])
      ).rejects.toRevert("revert invalid message must be 'rotate'");
    });

    it("reverts if given wrong signature", async () => {
      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      let encoded = encodeRotationMessage(rotationTarget);
      // sign rotation message with wrong key
      const [ signed ] = sign(encoded, '0x666ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10');

      await expect(
        send(delfi, 'invalidate', [encoded, signed.signature + "1"])
      ).rejects.toRevert("revert invalidation message must come from the reporter");

    });

    it("sets fallback flag to true if passes", async () => {
      const rotationTarget = '0xAbcdef0123456789000000000000000000000005';
      let encoded = encodeRotationMessage(rotationTarget);
      // sign rotation message with wrong key
      const [ signed ] = sign(encoded, source.privateKey);
      expect(await call(delfi, 'reporterBreaker', [])).toEqual(false);
      await send(delfi, 'invalidate', [encoded, signed.signature]);

      expect(await call(delfi, 'reporterBreaker', [])).toEqual(true);
    });
  });

  describe("cutAnchor", () => {
    beforeEach(async () => {
      ({
        delfi,
        anchorOracle,
        tokens
      } = await setup());
    });


    it("cuts anchor if anchor is stale", async () => {
      await sendRPC(web3, 'evm_mineBlockNumber', 17757);
      let blocksPerPeriod =  await call(anchorOracle, 'numBlocksPerPeriod', []);
      await send(anchorOracle, 'setAnchorPeriod', [tokens.usdc, 12000 /  blocksPerPeriod]);

      var cut = await send(delfi, 'cutAnchor', []);
      expect(await call(delfi, 'anchorBreaker')).toEqual(false);

      // one more block has passed, so now cuttable
      // now on block 17761 aka 5761 blocks past last anchor
      cut = await send(delfi, 'cutAnchor', []);
      expect(await call(delfi, 'anchorBreaker')).toEqual(true);
      expect(cut.events.AnchorCut.returnValues.anchor).toEqual(anchorOracle._address);
    });

    it("no op if anchor is up to date", async () => {
      await sendRPC(web3, 'evm_mineBlockNumber', [0]);
      let cut = await send(delfi, 'cutAnchor', []);
      expect(await call(delfi, 'anchorBreaker')).toEqual(false);
    });

  });
});
