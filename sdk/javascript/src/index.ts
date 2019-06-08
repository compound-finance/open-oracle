import express from 'express';
import {endpoint} from './express';

// Create a new express application instance
const app: express.Application = express();

async function fetchPrices() {
  return {'eth': 260.0, 'zrx': 0.58};
}

app.use(endpoint('/', '0x...', fetchPrices));

app.listen(3000, function () {
  console.log('Reporter listening on port 3000. Try running `curl http://localhost:3000`');
});

