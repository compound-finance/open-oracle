const Web3 = require('web3');
const pTimeout = require('p-timeout');

// The purpose of this program is to successfully submit a transaction by
// calling the provided function on the provided contract with the provided data

// The core logic is around retries due to gas price
async function postWithRetries(transaction : Trx, signerKey : string, web3Provider: string) {
  console.log("Running Open Oracle Poster...");

  const timeoutMessage = "Transaction receipt not available after 2 minutes"

  try {
    let transactionPromise = signAndSend(transaction, signerKey, web3Provider);

    // If no receipt is available after 3 minutes, it is not likely to be mined
    // at current price in reasonable time frame.
    const timeoutMilliseconds = 180_000;
    return pTimeout(transactionPromise, timeoutMilliseconds, timeoutMessage);
  } catch (e) {
    // If higher gas price will help, try again. Otherwise, really throw.
    if (["Returned error: replacement transaction underpriced",
         timeoutMessage].includes(e.message)
       ) {
      transaction.gasPrice = Math.floor(transaction.gasPrice * 1.2);
      return signAndSend(transaction, signerKey, web3Provider);
    } else {
      throw(e);
    }
  }
  console.log("Completed run of Open Oracle Poster");
}

async function signAndSend(transaction : Trx, signerKey : string, web3Provider :string ): Promise<TrxReceipt> {
  const web3 = new Web3(web3Provider);
  // set provider
  let signedTransaction = await web3
    .eth
    .accounts
    .signTransaction(transaction, signerKey);

  return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
}

export {
  postWithRetries,
  signAndSend
}
