
describe('OpenOracleView', () => {
  it('view with no sources is invalid', async () => {
    const oracleData = await saddle.deploy('OpenOracleData', []);
	await expect(await saddle.deploy('OpenOracleView', [oracleData._address, []])).rejects.toRevert('Must initialize with sources');
  });
});
