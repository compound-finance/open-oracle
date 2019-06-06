import {loadConfig, loadWeb3, loadAccount} from './config';
import {deployContract} from './contract';

(async function () {
  let config = await loadConfig("development");
  let web3 = await loadWeb3(config);
  let account = await loadAccount(config, web3);

  await deployContract(web3, "development", account, "Oracle", [])
})();
