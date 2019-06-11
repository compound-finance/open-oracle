
describe('Oracle', () => {
  // XXX describe cant be async with jest :(
  //  all things considered, havent found a nice way to do setup
  it('sets up the oracle and tests some stuff', async () => {
    const {
      account,
      address,
      bytes,
      uint256,
      deploy,
      web3
    } = saddle; // XXX this kinda sucks

    const oracle = await deploy('Oracle', [], {from: account});

    // gets default data
    let {
      0: timestamp,
      1: value
    } = await oracle.methods.get(address(0), 'price', address(0), bytes('ETH')).call();
    expect(timestamp).numEquals(0);
    expect(value).toBeNull();

    // reverts with invalid type checker and garbage input
    await expect(
      oracle.methods.put(address(0), 'price', bytes('garbage msg'), bytes('garbage sig')).send({from: account})
    ).rejects.toThrow('revert');

    const delfi = await deploy('DelFiPrice', [oracle.address, [account]]);
    const now = new Date() - 0;

    // reverts with valid type check and garbage input
    await expect(
      oracle.methods.put(delfi.address, 'price', bytes('garbage msg'), bytes('garbage sig')).send({from: account})
    ).rejects.toThrow('revert');

    // XXX maybe want to import signing here, shared with sdk, define there or at top level?
    function sign(message, privateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10') {
      const hash = web3.utils.keccak256(message);
      const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
      const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
      const signatory = web3.eth.accounts.recover(hash, v, r, s);
      return {hash, message, signature, signatory};
    }

    // succeeds with a proper type checker + message (no pairs) + signature
    const K = bytes('ETH'), V = uint256(7);
    let {
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now, []]));

    // the source we recover in solidity should match
    expect(await oracle.methods.source(message, signature).call()).toEqual(signatory);
    expect(await oracle.methods.source(bytes('bad'), signature).call()).not.toEqual(signatory);
    await expect(oracle.methods.source(message, bytes('0xbad')).call()).rejects.toThrow('revert');

    // the type checker should validate
    expect(await delfi.methods.price(K, V).call()).toBeNull();

    // writes nothing
    const wrote0 = await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account});
    expect(wrote0.gasUsed).toBeLessThan(40000);

    // reads nothing
    ({
      0: timestamp,
      1: value
    } = await oracle.methods.get(delfi.address, 'price', signatory, K).call());
     expect(timestamp).numEquals(0);
     expect(value).toBeNull();

    // writes 1 pair
    ({
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now, [
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [K, V])
    ]])));

    const wrote1 = await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account, gas: 1000000});
    expect(wrote1.gasUsed).toBeLessThan(120000);

    // reads 1 pair
    ({
      0: timestamp,
      1: value
    } = await oracle.methods.get(delfi.address, 'price', signatory, K).call());
    expect(timestamp).numEquals(now);
    expect(value).toEqual(V);

    // write fails with older timestamp
    ({
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now - 1, [
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [K, uint256(6)])
    ]])));

    await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account, gas: 1000000});

    ({
      0: timestamp,
      1: value
    } = await oracle.methods.get(delfi.address, 'price', signatory, K).call());
    expect(timestamp).numEquals(now);
    expect(value).toEqual(V);

    // writes 2 pairs
    ({
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now, [
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [bytes('ABC'), uint256(100)]),
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [bytes('BTC'), uint256(9000)]),
    ]])));

    const wrote2a = await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account, gas: 1000000});
    expect(wrote2a.gasUsed).toBeLessThan(200000);

    ({
      0: timestamp,
      1: value
    } = await oracle.methods.get(delfi.address, 'price', signatory, bytes('BTC')).call());
    expect(timestamp).numEquals(now);
    expect(value).toEqual(uint256(9000));

    ({
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now + 1, [
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [bytes('ABC'), uint256(100)]),
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [bytes('BTC'), uint256(9000)]),
    ]])));

    const wrote2b = await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account, gas: 1000000});
    expect(wrote2b.gasUsed).toBeLessThan(100000);

  }, 30000);
});
