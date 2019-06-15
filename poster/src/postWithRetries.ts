const Web3 = require('web3');
const pTimeout = require('p-timeout');

// The purpose of this program is to successfully submit a transaction by
// calling the provided function on the provided contract with the provided data

// The core logic is around retries due to gas price
export async function run(contractMethod: ContractMethod) {
  console.log("Running Open Oracle Poster...");

  await postTransaction(contractMethod).then(assertSuccess);

  console.log("Completed run of Open Oracle Poster");
}

async function postTransaction(
  contractMethod : ContractMethod,
  transactionInfo : TrxInfo
): Promise<TrxResult> {
  const timeoutMessage = "Transaction receipt not available after 2 minutes"

  try {
    let transactionPromise = contractMethod.send(transactionInfo);

    // The web3 send promise resolves when a transaction receipt is available,
    // meaning the transaction was mined and included in a block.
    //
    // If no receipt is availabel after 2 minutes, it is not likely to be mined
    // at current price in reasonable time frame.
    const timeoutMillisecods = 180_000;
    return pTimeout(transactionPromise, timeoutMilliseconds, timeoutMessage);
  } catch (e) {
    // If higher gas price will help, try again. Otherwise, really throw.
    if (["Returned error: replacement transaction underpriced",
         timeoutMessage].includes(e.message)
       ) {
      return retry(contractMethod, transactionInfo);
    } else {
      throw(e);
    }
  }
};

async function retry(
  contractMethod : ContractMethod,
  transactionInfo : TrxInfo
): Promise<TrxResult> {
  transactionInfo.gasPrice =
    Math.floor(transactionInfo.gasPrice * config.retryGasMultiplier);

  return contractMethod.send(transactionInfo);
}

function assertSuccess(trxResult: TrxResult): void {
  // custom success conditions ? only track reverts ? log all events???
  if (trxResult.events.OracleFailure) {
    const oracleFailure = trxResult.events.OracleFailure;
    const {error, info, detail} = oracleFailure.returnValues;

    throw `Expected successful trx, got Failure ${describeError(error, info, detail)}`;
  }
}
