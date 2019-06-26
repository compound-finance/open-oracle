import express from 'express';
import {encode, sign} from './reporter';

export function endpoint(
  privateKey: string,
  getter: () => Promise<[number, object]>,
  name: string = 'prices',
  path: string = `/${name}.json`,
  keyType: string = 'string',
  valueType: string = 'decimal'
): express.Application {
  return express()
    .get(path, async (req, res) => {
      const [timestamp, pairs] = await getter();
      const {
        message,
        signature
      } = sign(encode(keyType, valueType, timestamp, pairs), privateKey);
      res.json({
        message,
        signature,
        timestamp: timestamp,
        [name]: pairs
      });
    });
}
