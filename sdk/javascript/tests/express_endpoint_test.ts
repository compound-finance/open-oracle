import express from 'express';
import fetch from 'node-fetch';
import {endpoint} from '../src/express_endpoint';

test('integration test', async () => {
  // Create a new express application instance
  const app: express.Application = express();

  async function fetchPrices() {
    return {'eth': 260.0, 'zrx': 0.58};
  }

  app.use(endpoint('/prices.json', '0x...', fetchPrices));

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });

  let response = await fetch('http://localhost:3000/prices.json');

  expect(response.ok).toBe(true);
  expect(await response.text()).toEqual(55);
});
