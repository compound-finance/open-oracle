import {run} from './postWithRetries';

function () {
  // read all this from input args or env
  // write tests
  // const abi = get abi from env
  // const address = get address from env
  // const method 
  // const payload 
  // const trxInfo
  const oracleView : OpenOracleView = new web3.eth.Contract(abi, address);
  run(oracleView.methods[method](payload), trxInfo);
}
