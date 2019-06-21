async function postWithRetries(transaction : Trx, signerKey : string, web3) {
  console.log("Running Open Oracle Poster...");

  try {
    return signAndSend(transaction, signerKey, web3);
  } catch (e) {
    // If higher gas price will help, try again. Otherwise, really throw.
    if (e.message === "Returned error: replacement transaction underpriced") {
      return await replaceTransaction(transaction, signerKey, web3);
    } else if (/Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!/.test(e.error)){
      return await replaceTransaction(transaction, signerKey, web3);
    } else {
      throw(e)
    }
  }
  console.log("Completed run of Open Oracle Poster");
}

async function signAndSend(transaction : Trx, signerKey : string, web3 ): Promise<TrxReceipt> {
  let signedTransaction = await web3
    .eth
    .accounts
    .signTransaction(transaction, signerKey);

  return await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
}

async function replaceTransaction(transaction : Trx, signerKey : string, web3 ): Promise<TrxReceipt> {
  transaction.gasPrice = Math.floor(transaction.gasPrice * 0.2);
  return await signAndSend(transaction, signerKey, web3);
}

export {
  postWithRetries,
  signAndSend
}
