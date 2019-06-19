import express from 'express';
import {encode, sign} from './reporter';

export function endpoint(path: string, privateKey: string, keyName: string, keyType: string, valueType: string, getter: () => object): express.Application {
  // Create a new express application instance
  const app: express.Application = express();

  app.get(path, async (req, res) => {
    let data = await getter();
    let encoded = encode(keyType, valueType, +new Date(), getter())
    let signature = sign(encoded, privateKey);
    res.json({
      encoded,
      signature,
      [keyName]: data
    });
  });

  return app;
}
