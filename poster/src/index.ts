import {run} from './postWithRetries';
import AbiCoder from 'web3-eth-abi';

function main () {
  // read all this from input args or env
  // write tests
  const address = loadViewAddress();
  // construct abi from that method name
  // const payload = loadPayload();
  // const trxInfo = buildTrxData();
  // const oracleView : OpenOracleView = new web3.eth.Contract(abi, address);
  // run(oracleView.methods[method](payload), trxInfo);
}

function loadViewAddress(env?: {[key: string]: string}) {
  return getEnvVar("view-address", env)
}

function loadPayload() {
  // let sources = getEnvVar("sources", env);
  // fetch json from sources
}

function buildTrxData(params : OpenOraclePayload[], env?: {[key: string]: string}) {
  const functionName = getEnvVar("view-function-name", env);
  const types = findTypes(functionName);

  let messages = params.map(x => x.message);
  let signatures = params.map(x => x.signature);

  // see https://github.com/ethereum/web3.js/blob/2.x/packages/web3-eth-abi/src/AbiCoder.js#L112
  return AbiCoder.encodeFunctionSignature(functionName) +
    AbiCoder
    .encodeParameters(types, [messages, signatures])
    .replace('0x', '');
}

function getEnvVar(name: string, env?: {[key: string]: string}): string {
  const theEnv = env !== undefined ? env : process.env;

  const result: string | undefined = theEnv[name];

  if (result) {
    return result;
  } else {
    throw `Missing required env var: ${name}`;
  }
}

function findTypes(functionName : string) : string[] {
  let start = functionName.indexOf("(") + 1;
  let types = functionName
    .slice(start, functionName.lastIndexOf(")"))
    .split(",");
  return types
}

// encodeFunctionCall(jsonInterface, params) {
//   return (
//     this.encodeFunctionSignature(jsonInterface) +
//       this.encodeParameters(jsonInterface.inputs, params).replace('0x', '')
//   );
// }

export {
  buildTrxData,
  findTypes,
  loadViewAddress
}
