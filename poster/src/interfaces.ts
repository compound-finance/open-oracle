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
  messages: string[],
  // The signature of the attestor to these values. The values in 'message'
  // will be stored in a mapping under this signer's public address.
  signatures: string[],
  prices: {[symbol: string]: string }
};
