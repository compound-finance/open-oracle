
## The Open Oracle Reporter

The Open Oracle Reporter makes it easy to add a price feed to your application web server.

## Installation

The DelFi Reporter to your application, run:

```
yarn add open-oracle-reporter
```

## Usage

Once you've installed the DelFi SDK, you can sign a DelFi feed as follows:

```typescript
import Reporter from 'open-oracle-reporter';

let typeSig = Reporter.annotateType('price', 'string', 'decimal');
let encoded = Reporter.encode(typeSig, +new Date(), {'eth': 260.0, 'zrx': 0.58});
let signature = Reporter.sign(encoded, '0x...');


```

For example, in an express app:

```typescript
// See above for signing data

express.request('/prices.json', (response) => {
	response.json({
		type_signature: typeSig,
		data: encoded,
		signature: signature
	});
});
```

You may also use the easy express adapter:

```typescript
import Reporter from 'open-oracle-reporter';

async funtion fetchPrices() {
	return {'eth': 260.0, 'zrx': 0.58};
}

express.use(Reporter.express('prices.json', '0x...', fetchPrices));
```
