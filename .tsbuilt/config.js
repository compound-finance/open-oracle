"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const ganache_core_1 = __importDefault(require("ganache-core"));
async function loadConfig(network) {
    return {
        network: network
    };
}
exports.loadConfig = loadConfig;
async function loadWeb3(config) {
    if (config.network === 'test') {
        const options = {
            transactionConfirmationBlocks: 1,
            transactionBlockTimeout: 5
        };
        return new web3_1.default(ganache_core_1.default.provider(), undefined, options);
    }
    else {
        const options = {
            transactionConfirmationBlocks: 1,
            transactionBlockTimeout: 5
        };
        return new web3_1.default(web3_1.default.givenProvider || 'http://127.0.0.1:8545', undefined, options);
    }
}
exports.loadWeb3 = loadWeb3;
async function loadAccount(config, web3) {
    let [account, ...accounts] = await web3.eth.getAccounts();
    return account;
}
exports.loadAccount = loadAccount;
