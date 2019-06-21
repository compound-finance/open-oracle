
describe('View', () => {
  it('is a valid view', async () => {
    const oracleData = await saddle.deploy('OracleData', []);
    const oracleView = await saddle.deploy('OracleView', [oracleData.address, []]);

    expect(await oracleView.methods.data.call()).toEqual(oracleData.address);
  });
});
