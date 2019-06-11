
describe('Oracle', () => {
  // XXX describe cant be async with jest :(
  //  all things considered, havent found a nice way to do setup
  it('sets up the oracle and tests some stuff', async () => {
    const {
      account,
      address,
      bytes,
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
    // await expect(
    //   oracle.methods.put(address(0), 'price', bytes('garbage msg'), bytes('garbage sig')).send({from: account})
    // ).rejects.toThrow('revert');

    const delfi = await deploy('DelFiPrice', [oracle.address, [account]]);
    const now = new Date() - 0;

    // reverts with valid type check and garbage input
    // await expect(
    //   oracle.methods.put(delfi.address, 'price', bytes('garbage msg'), bytes('garbage sig')).send({from: account})
    // ).rejects.toThrow('revert');

    // XXX maybe want to import signing here, shared with sdk, define there or at top level?
    function sign(message, privateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10') {
      const hash = web3.utils.keccak256(message);
      const {r, s, v} = web3.eth.accounts.sign(hash, privateKey);
      const signature = web3.eth.abi.encodeParameters(['bytes32', 'bytes32', 'uint8'], [r, s, v]);
      const signatory = web3.eth.accounts.recover(hash, v, r, s);
      return {hash, message, signature, signatory};
    }

    // succeeds with a proper type checker + message (no pairs) + signature
    let {
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now, []]));

    const wrote0 = await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account});
    expect(wrote0.gasUsed).toBeLessThan(40000);

    // reads nothing
    ({
      0: timestamp,
      1: value
    } = await oracle.methods.get(delfi.address, 'price', signatory, bytes('ETH')).call());
     expect(timestamp).numEquals(0);
     expect(value).toBeNull();

    // writes 1 pair XXX
    ({
      message,
      signature,
      signatory
    } = sign(web3.eth.abi.encodeParameters(['uint256', 'bytes[]'], [now, [
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
        web3.eth.abi.encodeParameter('string', 'ETH'),
        web3.eth.abi.encodeParameter('uint256', 7)
      ])
    ]])));

    const wrote1 = await oracle.methods.put(delfi.address, 'price', message, signature).send({from: account});
    expect(wrote1.gasUsed).toBeLessThan(50000);

    // reads 1 pair XXX
    console.log('xxx', signatory);
    ({
      0: timestamp,
      1: value
    } = await oracle.methods.get(delfi.address, 'price', signatory, bytes('ETH')).call());
    expect(timestamp).numEquals(now);
    expect(value).numEquals(7);
  });
});
