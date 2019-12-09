
## The Open Oracle Reporter

The Open Oracle Reporter makes it easy to add a price feed to your application web server.

## Installation

To add the Open Oracle Reporter to your application, run:

```
yarn add open-oracle-reporter
```

## Running Stand-alone

You can run this reporter as a stand-alone by providing a simple JavaScript function that will pull the data for the reporter.

```bash
yarn global add open-oracle-reporter

open-oracle-reporter \
	--port 3000 \
	--private_key file:./private_key \
	--script ./fetchPrices.js \
    --kind prices \
	--path /prices.json \
```

Or to quickly test using yarn:

```bash
yarn run start \
    --private_key 0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10 \
    --script examples/fixed.js
```

## Usage

Once you've installed the Open Oracle SDK, you can sign a Open Oracle feed as follows:

```typescript
import {encode, sign} from 'open-oracle-reporter';

let encoded = encode('prices', Math.floor(+new Date / 1000), {'eth': 260.0, 'zrx': 0.58});
let signature = sign(encoded, '0x...');
```

Or sign with a remote call:

```typescript
import {signWith} from 'open-oracle-reporter';

let encoded = encode('prices', Math.floor(+new Date / 1000), {'eth': 260.0, 'zrx': 0.58});
let signature = signWith(encoded, '0x...', signer);
```

For example, in an express app:

```typescript
// See above for signing data

express.get('/prices.json', async (req, res) => {
  res.json({
	encoded: encoded,
	signature: signature
  });
});
```

You may also use the open oracle express adapter:

```typescript
import {endpoint} from 'open-oracle-reporter';

async function fetchPrices(now) {
	return [now, {'eth': 260.0, 'zrx': 0.58}];
}

app.use(endpoint('0x...', fetchPrices, 'prices', '/prices.json'));
```
