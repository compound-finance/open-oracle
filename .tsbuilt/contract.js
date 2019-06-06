"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const BUILD_FILE_NAME = 'build.json';
const CONTRACT_FILE_NAME = 'contracts.json';
async function readFile(file, def, fn) {
    return new Promise((resolve, reject) => {
        fs.access(file, fs.constants.F_OK, (err) => {
            if (err) {
                resolve(def);
            }
            else {
                fs.readFile(file, 'utf8', (err, data) => {
                    return err ? reject(err) : resolve(fn(data));
                });
            }
        });
    });
}
async function writeFile(file, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, (err) => {
            return err ? reject(err) : resolve();
        });
    });
}
exports.writeFile = writeFile;
function getBuildFile(network, file) {
    return path.join(process.cwd(), '.build', network, file);
}
async function getContract(network, name) {
    let contracts = await readFile(getBuildFile(network, BUILD_FILE_NAME), {}, JSON.parse);
    let contractsObject = contracts["contracts"] || {};
    let foundContract = Object.entries(contractsObject).find(([pathContractName, contract]) => {
        let [_, contractName] = pathContractName.split(":", 2);
        return contractName == name;
    });
    if (foundContract) {
        let [_, contractBuild] = foundContract;
        return contractBuild;
    }
    else {
        return null;
    }
}
async function deployContract(web3, network, from, name, args) {
    let contractBuild = await getContract(network, name);
    if (!contractBuild) {
        throw new Error(`Cannot find contract \`${name}\` in build folder.`);
    }
    const contractAbi = JSON.parse(contractBuild.abi);
    const contract = new web3.eth.Contract(contractAbi);
    return await contract.deploy({ data: '0x' + contractBuild.bin, arguments: args }).send({ from: from, gas: 1000000 });
}
exports.deployContract = deployContract;
async function saveContract(name, contract, network) {
    let file = getBuildFile(network, CONTRACT_FILE_NAME);
    let curr = await readFile(file, {}, JSON.parse);
    curr[name] = contract.address;
    await writeFile(file, JSON.stringify(curr));
}
exports.saveContract = saveContract;
