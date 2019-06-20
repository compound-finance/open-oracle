
describe('View', () => {
  it('is a valid view', async () => {
    const oracle = await saddle.deploy('Oracle', []);
    const view = await saddle.deploy('View', [oracle.address, []]);

    expect(await view.methods.oracle.call()).toEqual(oracle.address);
  });
});
