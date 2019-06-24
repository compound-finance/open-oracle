// --- open oracle interfaces ---

// In the view, there is a function that will write message values to the
// the open oracle data contract if the posted values are more valid
// ( e.g. later timestamp ) than what already is in the data contract.
//
// The view will also write to it's own storage cache an aggregated value
// based on the state of data contract.

// A payload for an open oracle view comprises 2 fields:
//  1. Abi encoded values to be written to the open oracle data contract
//  2. The attestor's signature on a hash of that message
interface DelFiReporterPayload {
  // ABI encoded values to be written to the open oracle data contract.
  encoded: string,
  // The signature of the attestor to these values. The values in 'message'
  // will be stored in a mapping under this signer's public address.
  signature: string,
  prices: {[symbol: string]: string }
};

//
// ---- web3 interfaces ----
//

// Interface for signable transaction 
interface Trx {
  gasPrice: number,
  gas: number,
  to: string,
  data: string
}

// The transaction receipt returned by myContract.myMethod.send promise,
// indicating the transaction has been successfully mined.
// https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html?highlight=send#contract-events-return
interface TrxReceipt {
  transactionHash: string,
  events: {
    [event: string]: Event
  }
}

interface Event {
  returnValues: { [key: string]: any }
}
