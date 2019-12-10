
describe('OpenOracleView', () => {
  it('is a valid view', async () => {
    const oracleData = await saddle.deploy('OpenOracleData', []);
    const oracleView = await saddle.deploy('OpenOracleView', [oracleData._address, []]);

    expect(await saddle.call(oracleView, 'data', [])).toEqual(oracleData._address);
  });
});
