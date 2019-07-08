import express from 'express';
import {encode, sign} from './reporter';

export function endpoint(
  privateKey: string,
  getter: (number) => Promise<[number, object]>,
  kind: string = 'prices',
  path: string = `/${kind}.json`
): express.Application {
  return express()
    .get(path, async (req, res) => {
      const [timestamp, pairs] = await getter(Math.floor(+new Date / 1000));
      const {
        message,
        signature
      } = sign(encode(kind, timestamp, pairs), privateKey);
      res.json({
        message,
        signature,
        timestamp: timestamp,
        [kind]: pairs
      });
    });
}
