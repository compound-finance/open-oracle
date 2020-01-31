
describe('OpenOracleView', () => {
  it('view with no sources is invalid', async () => {
    const oracleData = await saddle.deploy('OpenOracleData', []);
	await expect(saddle.deploy('OpenOracleView', [oracleData._address, []])).rejects.toRevert('revert Must initialize with sources');
  });
});
