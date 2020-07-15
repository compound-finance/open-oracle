/* --- Open Price Feed Interfaces ---
 *
 * In the view, there is a function that will write message values to the
 * the Open Price Feed data contract if the posted values are more valid
 * ( e.g. later timestamp ) than what already is in the data contract.
 *
 * The view will also write to its own storage cache an aggregated value
 * based on the state of data contract.
 *
 * A payload for an open price feed view comprises two fields:
 *   1. ABI-encoded values to be written to the open price feed data contract
 *   2. The attestor's signature on a hash of that message
 */

interface OpenPriceFeedPayload {
  // ABI-encoded values to be written to the open oracle data contract.
  messages: string[]
  // The signature of the attestor to these values. The values in `message`
  // will be stored in a mapping under this signer's public address.
  signatures: string[]
  prices: {[symbol: string]: string }
};

interface DecodedMessage {
  dataType: string
  timestamp: number
  symbol: string
  price: number
}

interface OpenPriceFeedItem {
  message: string
  signature: string
  dataType: string
  timestamp: number
  symbol: string
  price: number
  source: string
  prev: number
};
