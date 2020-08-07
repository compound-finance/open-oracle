import Web3 from 'web3';
import Utils from 'web3-utils';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

function ensureHex(val: string, type: string): string {
  if (Utils.isHexStrict(val)) {
    return val;
  }

  const val0x = `0x${val}`;
  if (Utils.isHexStrict(val0x)) {
    return val0x;
  }

  throw new Error(`Invalid hex for ${type}: got \`${val}\``);
}

function isUnderpriced(e) {
  return e.message === 'Returned error: replacement transaction underpriced';
}

function isTimeout(e) {
  return /Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!/.test(e.error);
}

function maybeIsOutOfGas(e) {
  return e.message && e.message.includes('Transaction has been reverted by the EVM');
}

const SLEEP_DURATION = 3000; // 3s
const RETRIES = 3;
const GAS_PRICE_ADJUSTMENT = 1.2; // Increase gas price by this percentage each retry
const GAS_ADJUSTMENT = 1.5; // Increase gas limit by this percentage each retry

async function postWithRetries(transaction: TransactionConfig, signerKey: string, web3: Web3, retries: number = RETRIES, attempt: number = 0) {
  console.log(`Running Open Price Feed Poster${attempt > 0 ? ` [attempt ${attempt}]` : ''}...`);

  signerKey = ensureHex(signerKey, 'private key');

  let pubKey = web3.eth.accounts.privateKeyToAccount(signerKey)

  console.log(`Posting from account: ${pubKey.address}`);

  let nonce = await web3.eth.getTransactionCount(pubKey.address)
  transaction.nonce = nonce

  try {
    return await signAndSend(transaction, signerKey, web3);
  } catch (e) {
    console.debug({transaction});
    console.warn('Failed to post Open Price Feed:');
    console.warn(e);

    // Try more gas and higher gas price, reverse engineering geth/parity errors is error-prone
    transaction = {
      ...transaction,
      gas: Math.floor(Number(transaction.gas) * GAS_ADJUSTMENT),
      gasPrice: Math.floor(Number(transaction.gasPrice) * GAS_PRICE_ADJUSTMENT)
    };

    if (retries > 0) {
      // Sleep for some time before retrying
      await (new Promise(okay => setTimeout(okay, SLEEP_DURATION)));

      return postWithRetries(transaction, signerKey, web3, retries - 1, attempt + 1);
    } else {
      throw new Error(`Failed to run Open Price Feed poster after ${attempt} attempt(s): error=\`${e.toString()}\``);
    }
  }
}

async function signAndSend(transaction: TransactionConfig, signerKey: string, web3: Web3): Promise<TransactionReceipt> {
  let signedTransaction =
    await web3.eth.accounts.signTransaction(transaction, signerKey);

  return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction || '');
}

export {
  postWithRetries,
  signAndSend
}
