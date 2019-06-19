const web3 = require('web3');
const pTimeout = require('p-timeout');

// The purpose of this program is to successfully submit a transaction by
// calling the provided function on the provided contract with the provided data

// The core logic is around retries due to gas price
export async function postWithRetries(transaction : Trx, signerKey : string) {
  console.log("Running Open Oracle Poster...");

  const timeoutMessage = "Transaction receipt not available after 2 minutes"

  try {
    let transactionPromise = signAndSend(transaction, signerKey);

    // If no receipt is available after 3 minutes, it is not likely to be mined
    // at current price in reasonable time frame.
    const timeoutMilliseconds = 180_000;
    return pTimeout(transactionPromise, timeoutMilliseconds, timeoutMessage);
  } catch (e) {
    // If higher gas price will help, try again. Otherwise, really throw.
    if (["Returned error: replacement transaction underpriced",
         timeoutMessage].includes(e.message)
       ) {
      return retry(transaction, signerKey);
    } else {
      throw(e);
    }
  }
  console.log("Completed run of Open Oracle Poster");
}

async function retry(transaction : Trx, signerKey : string): Promise<TrxReceipt> {
  transaction.gasPrice = Math.floor(transaction.gasPrice * 1.2);
  return signAndSend(transaction, signerKey);
}

async function signAndSend(transaction : Trx, signerKey : string): Promise<TrxReceipt> {
  let signedTransaction = web3
    .eth
    .accounts
    .signTransaction(transaction, signerKey);

  return web3.eth.sendSignedTransaction(signedTransaction);
}
