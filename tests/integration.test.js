const path = require('path');
const compose = require('docker-compose');
const fetch = require('node-fetch');

let cwd = path.join(__dirname, '..');

describe('integration tests', () => {
  test.only('runs oracle, posts prices, reads prices', async () => {
    const res = await compose.upAll({ cwd: cwd, log: true });

    console.log(res);

    console.log(await fetch('http://localhost:18545/'))

    const lsRes = await compose.exec('alpine', 'curl http://ganache:8545', {cwd});

    console.log(lsRes);
  }, 60000);
});
