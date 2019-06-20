import express from 'express';
import {encode, sign} from './reporter';

export function endpoint(path: string, privateKey: string, keyName: string, keyType: string, valueType: string, getter: () => object): express.Application {
  // Create a new express application instance
  const app: express.Application = express();

  app.get(path, async (req, res) => {
    const pairs = await getter();
    const {
      message,
      signature
    } = sign(encode(keyType, valueType, +new Date(), pairs), privateKey);
    res.json({
      message,
      signature,
      [keyName]: pairs
    });
  });

  return app;
}
