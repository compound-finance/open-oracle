"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const contract_1 = require("./contract");
(async function () {
    let network = "development";
    let config = await config_1.loadConfig(network);
    let web3 = await config_1.loadWeb3(config);
    let account = await config_1.loadAccount(config, web3);
    let contract = await contract_1.deployContract(web3, config.network, account, "Oracle", []);
    await contract_1.saveContract('Oracle', contract, config.network);
})();
