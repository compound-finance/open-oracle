const path = require('path');
const Web3 = require('web3');
const compose = require('docker-compose');
const contract = require('eth-saddle/dist/contract');
const { Docker, Options } = require('docker-cli-js');
const DockerProvider = require('./DockerProvider');

const root = path.join(__dirname, '..');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLogs(serviceLogPairs) {
  let [service, log] = Object.entries(serviceLogPairs)[0];
  const serviceLogs = await compose.logs([service]);

  if (!serviceLogs.out.includes(log)) {
    console.log(`Waiting for logs ${JSON.stringify(serviceLogPairs)}`);
    console.log(serviceLogs.out);
    await sleep(5000);
    await waitForLogs(serviceLogPairs);
  }
}

describe('Integration', () => {
  it('deploys the contracts, starts reporters and posts the right prices', async () => {
    try {
      const projectName = "open-oracle";
      const deployer = `${projectName}_deployer_1`;
      const reporter = `${projectName}_reporter-1_1`;

      await compose.upOne(["poster"], {cwd: root, log: true, composeOptions: ["--project-name", projectName]});
      await waitForLogs({[deployer]: "Deployed DelFiPrice"});

      const docker = new Docker(new Options());
      await docker.command(`cp ${deployer}:/build .dockerbuild_cp`);

      const web3 = new Web3(new DockerProvider('http://ganache:8545', docker, reporter));
      const accounts = await web3.eth.getAccounts();
      const delfi = await contract.getContractAt(web3, 'DelFiPrice', '.dockerbuild_cp', false, '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24');

      expect(await delfi.methods.prices('BTC').call({from: accounts[0]})).numEquals(0);
      expect(await delfi.methods.prices('ETH').call({from: accounts[0]})).numEquals('260000000');
      expect(await delfi.methods.prices('ZRX').call({from: accounts[0]})).numEquals('580000');
    } finally {
      await compose.down({cwd: root});
    }
  }, 60000);
});
