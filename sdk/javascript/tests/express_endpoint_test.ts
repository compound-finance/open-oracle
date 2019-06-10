import express from 'express';
import fetch from 'node-fetch';
import {endpoint} from '../src/express_endpoint';

test('integration test', async () => {
  let privateKey = '0x177ee777e72b8c042e05ef41d1db0f17f1fcb0e8150b37cfad6993e4373bdf10';

  // Create a new express application instance
  const app: express.Application = express();

  async function fetchPrices() {
    return {'eth': 260.0, 'zrx': 0.58};
  }

  app.use(endpoint('/prices.json', privateKey, 'prices', 'string', 'decimal', fetchPrices));

  app.listen(10123, function () {});

  let response = await fetch(`http://localhost:${10123}/prices.json`);

  expect(response.ok).toBe(true);
  expect(await response.json()).toEqual({
    encoded: "0x0000000000000000000000000000000000000000000000000000016b3eabcf0e00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000",
    prices: {
      eth: 260,
      zrx: 0.58,
    },
    signature: "0x3c022277153248f28d96d6f0bbcde30789d7bef96e9f7ef2d0a93130bc4531dd2a0eff595fa3294556fbdb800ff81e359cb15e57df509ecd6a96eee30def6e12000000000000000000000000000000000000000000000000000000000000001b"
  });
});
