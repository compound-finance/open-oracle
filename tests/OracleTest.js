
describe('Oracle', () => {
  it('is a valid oracle', async () => {
    let oracle = await saddle.deploy('Oracle', [], {from: await saddle.account});

    expect(await oracle.methods.name.call()).toEqual('5');
  });

  it('is still a valid oracle', async () => {
    let oracle = await saddle.deploy('Oracle', [], {from: await saddle.account});

    expect(await oracle.methods.name.call()).toEqual('6');
  });
});
