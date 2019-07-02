const path = require('path');
const Web3 = require('web3');
const compose = require('docker-compose');
const contract = require('eth-saddle/dist/contract');

const root = path.join(__dirname, '..');

describe.only('Integration', () => {
  it('deploys the contracts, starts reporters and posts the right prices', async () => {
    await compose.upAll({cwd: root, log: true});
    await new Promise(ok => setTimeout(ok, 1000));

    const web3 = new Web3('http://localhost:9999');
    const accounts = await web3.eth.getAccounts();
    const delfi = await contract.getContractAt(web3, 'DelFiPrice', '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24');

    expect(await delfi.methods.prices('btc').call({from: accounts[0]})).numEquals(0);
    expect(await delfi.methods.prices('eth').call({from: accounts[0]})).numEquals('260000000000000000000');
    expect(await delfi.methods.prices('zrx').call({from: accounts[0]})).numEquals('576577264263065763');

    await compose.down({cwd: root});
  }, 60000);
});