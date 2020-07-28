import crypto from 'crypto';

export interface CoinbaseConfig {
  source: string
  endpoint: string
  api_key_id: string
  api_secret: string
  api_passphrase: string
}

export async function readCoinbasePayload(config: CoinbaseConfig, fetchFn) {
  let timestamp = Date.now() / 1000;
  let method = 'GET';

  // create the prehash string by concatenating required parts
  let what = timestamp + method + "/oracle";

  // decode the base64 secret
  let key =  Buffer.from(config.api_secret, 'base64');

  // create a sha256 hmac with the secret
  let hmac = crypto.createHmac('sha256', key);

  // sign the require message with the hmac
  // and finally base64 encode the result
  let signature = hmac.update(what).digest('base64');
  let headers = {
    'CB-ACCESS-KEY': config.api_key_id,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-TIMESTAMP': timestamp,
    'CB-ACCESS-PASSPHRASE': config.api_passphrase,
    'Content-Type': 'application/json'
  };

  return await fetchFn(config.endpoint, {
    headers: headers
  });
}
