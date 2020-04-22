const path = require('path');
const Web3 = require('web3');
const compose = require('docker-compose');
const { exec } = require('child_process');
const util = require('util');
const DockerProvider = require('./DockerProvider');
const contract = require('eth-saddle/dist/contract');

const execute = util.promisify(exec);

const projectName = "open-oracle";
const root = path.join(__dirname, '..');
const composeOptions = {cwd: root, log: true, composeOptions: ["--project-name", projectName]};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLogs(serviceLogPairs) {
  let results = await Promise.all(Object.entries(serviceLogPairs).map(async ([service, log]) => {
    const serviceLogs = await compose.logs([service], composeOptions);

    if (!serviceLogs.out.includes(log)) {
      console.log(`Waiting for logs ${JSON.stringify(serviceLogPairs)}`);
      console.log(serviceLogs.out);
      return false;
    } else {
      return true;
    }
  }));

  let complete = results.every((x) => x === true);

  if (complete) {
    return;
  } else {
    await sleep(10000);
    await waitForLogs(serviceLogPairs);
  }
}

// Skip this test for now, until saddle script or :struct processing is added
describe('Integration', () => {
  it('deploys the contracts, starts reporters and posts the right prices', async () => {
    try {
      await execute(`rm -rf ".dockerbuild"`);
      await execute(`rm -rf ".dockerbuild_cp"`);
      const deployer = `${projectName}_deployer_1`;
      const reporter = `${projectName}_reporter-1_1`;

      await compose.upAll(composeOptions);
      await waitForLogs({deployer: "Deployed DelFiPrice", poster: "main completed", "reporter-1": "Reporter listening", ganache: "Listening on 0.0.0.0:8545"});

      await execute(`docker cp "${deployer}:/build" ".dockerbuild_cp"`);

      const web3 = new Web3(new DockerProvider('http://ganache:8545', reporter));
      const accounts = await web3.eth.getAccounts();

      // saddle.network_config.build_dir = '.dockerbuild_cp';
      // const delfi = await saddle.getContractAt('DelFiPrice', '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24');
      const delfi = await contract.getContractAt(web3, 'DelFiPrice', {build_dir: '.dockerbuild_cp', trace: false, extra_build_files: []}, '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24');

      expect(await delfi.methods.prices('BTC').call({from: accounts[0]})).numEquals(0);
      expect(await delfi.methods.prices('ETH').call({from: accounts[0]})).numEquals(0);
      expect(await delfi.methods.prices('ZRX').call({from: accounts[0]})).numEquals(0);
    } finally {
      await compose.down({cwd: root});
    }
  }, 60000);
});
