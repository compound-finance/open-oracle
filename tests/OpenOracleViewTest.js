
describe('OpenOracleView', () => {
  it('is a valid view', async () => {
    const oracleData = await saddle.deploy('OpenOracleData', []);
    const oracleView = await saddle.deploy('OpenOracleView', [oracleData.address, []]);

    expect(await oracleView.methods.data.call()).toEqual(oracleData.address);
  });
});
