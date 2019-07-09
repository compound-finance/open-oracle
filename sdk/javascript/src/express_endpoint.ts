import express from 'express';
import {encode, sign} from './reporter';

type UnixT = number;
type Pairs = object | [any, any][];
type Query = any;

function flatStringList(param: string | string[]): string[] {
  if (Array.isArray(param))
    return param.reduce((a: string[], s) => a.concat(flatStringList(s)), []);
  return param.split(',');
}

function upper(str: string): string {
  return str.toUpperCase();
}

export const Filters = {
  symbols: (pairs: Pairs, query: Query): Pairs => {
    if (query.symbols) {
      const symbols = new Set(flatStringList(query.symbols).map(upper));
      if (Array.isArray(pairs))
        return pairs.filter(([k, _]) => symbols.has(upper(k)));
      return Object.entries(pairs).reduce((a, [k, v]) => {
        if (symbols.has(upper(k)))
          a[k] = v;
        return a;
      }, {});
    }
    return pairs;
  }
}

export function endpoint(
  privateKey: string,
  getter: (now: UnixT) => Promise<[UnixT, Pairs]>,
  filter: (pairs: Pairs, query: Query) => Pairs = Filters.symbols,
  kind: string = 'prices',
  path: string = `/${kind}.json`
): express.Application {
  return express()
    .get(path, async (req, res) => {
      const [timestamp, pairs] = await getter(Math.floor(+new Date / 1000));
      const filtered = filter(pairs, req.query);
      const signed = sign(encode(kind, timestamp, filtered), privateKey);
      res.json({
        messages: signed.map(s => s.message),
        signatures: signed.map(s => s.signature),
        timestamp: timestamp,
        [kind]: filtered
      });
    });
}
