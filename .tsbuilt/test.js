"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const contract_1 = require("./contract");
async function configure() {
    let config = await config_1.loadConfig("test");
    let web3 = await config_1.loadWeb3(config);
    let account = config_1.loadAccount(config, web3);
    async function deploy(contract, args) {
        console.log(["Deploying", contract, args]);
        return contract_1.deployContract(web3, config.network, await account, contract, args);
    }
    global['saddle'] = {
        account,
        deploy,
        web3
    };
}
global['beforeEach'](() => {
    console.log("starting test");
});
global['beforeEach'](configure);
global['afterEach'](() => {
    console.log("ending test");
});
