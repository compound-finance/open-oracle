const path = require('path');
const Web3 = require('web3');
const compose = require('docker-compose');
const contract = require('eth-saddle/dist/contract');

const root = path.join(__dirname, '..');

describe('Integration', () => {
  it('deploys the contracts, starts reporters and posts the right prices', async () => {
    await compose.upAll({cwd: root, log: true});
    await new Promise(ok => setTimeout(ok, 3000));

    const web3 = new Web3('http://localhost:9999');
    const accounts = await web3.eth.getAccounts();
    const delfi = await contract.getContractAt(web3, 'DelFiPrice', '0xCfEB869F69431e42cdB54A4F4f105C19C080A601');

    expect(await delfi.methods.prices('BTC').call({from: accounts[0]})).numEquals(0);
    expect(await delfi.methods.prices('ETH').call({from: accounts[0]})).numEquals('260000000');
    expect(await delfi.methods.prices('ZRX').call({from: accounts[0]})).numEquals('580000');

    await compose.down({cwd: root});
  }, 60000);
});