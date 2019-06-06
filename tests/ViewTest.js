
describe('View', () => {
  it('is a valid oracle', async () => {
    let oracle = await saddle.deploy('View', [], {from: await saddle.account});

    expect(await oracle.methods.name.call()).toEqual('55');
  });

  it('is still a valid oracle', async () => {
    let oracle = await saddle.deploy('View', [], {from: await saddle.account});

    expect(await oracle.methods.name.call()).toEqual('66');
  });
});
