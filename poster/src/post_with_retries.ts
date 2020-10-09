import Web3 from 'web3';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

async function postWithRetries(transaction: TransactionConfig, signerKey: string, web3: Web3, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    console.log(`Running Open Oracle Poster (attempt ${i})...`);
    console.log(transaction)
    if (!web3.utils.isHexStrict(signerKey)) {
      signerKey = "0x" + signerKey;
      if (!web3.utils.isHexStrict(signerKey)) {
        throw "Invalid Private Key"
      }
    }
    let pubKey = web3.eth.accounts.privateKeyToAccount(signerKey)
    console.log("posting from: ", pubKey.address)
    let nonce = await web3.eth.getTransactionCount(pubKey.address)
    transaction.nonce = nonce
    console.log(transaction)
    try {
      return await signAndSend(transaction, signerKey, web3);
    } catch (e) {
      console.warn(e);
      // If higher gas price will help, try again. Otherwise, really throw.
      if (e.message === "Returned error: replacement transaction underpriced") {
        transaction.gasPrice = Math.floor(Number(transaction.gasPrice) * 0.2);
      } else if (/Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!/.test(e.error)) {
        transaction.gasPrice = Math.floor(Number(transaction.gasPrice) * 0.2);
      } else {
        await (new Promise(okay => setTimeout(okay, 3000)));
      }
    }
  }
  console.error(`Failed to run Open Oracle Poster ${retries} times, giving up`);
}

async function signAndSend(transaction: TransactionConfig, signerKey: string, web3: Web3): Promise<TransactionReceipt> {
  let signedTransaction = await web3
    .eth
    .accounts
    .signTransaction(transaction, signerKey);

  return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction || '');
}

export {
  postWithRetries,
  signAndSend
}
