import express from 'express';
import {Filters, endpoint} from './express_endpoint';
import yargs from 'yargs';
import {loadKey} from './key';
import * as fs from 'fs';
import * as Path from 'path';

const argv = yargs
  .option('port', {alias: 'p', description: 'Port to listen on', type: 'number', default: 3000})
  .option('private_key', {alias: 'k', description: 'Private key (try: `file:<file> or env:<env>`', type: 'string'})
  .option('script', {alias: 's', description: 'Script for data', type: 'string'})
  .option('filter', {alias: 'f', description: 'Filter for data', type: 'string', default: 'symbols'})
  .option('kind', {alias: 'K', description: 'Kind of data to encode', type: 'string', default: 'prices'})
  .option('path', {alias: 'u', description: 'Path for endpoint', type: 'string', default: '/prices.json'})
  .help()
  .alias('help', 'h')
  .demandOption(['private_key', 'script'], 'Please provide both run and path arguments to work with this tool')
  .argv;

// Create a new express application instance
const app: express.Application = express();

function fetchEnv(name: string): string {
  let res = process.env[name];
  if (res) {
    return res;
  }
  throw `Cannot find env var "${name}"`;
}

async function start(
  port: number,
  privateKey: string,
  script: string,
  filter: string,
  kind: string,
  path: string
) {
  const fn: any = await import(Path.join(process.cwd(), script));
  app.use(endpoint(privateKey, fn.default, Filters[filter], kind, path));
  app.listen(port, function () {
    console.log(`Reporter listening on port ${port}. Try running "curl http://localhost:${port}${path}"`);
  });
}

start(argv.port, argv.private_key, argv.script, argv.filter, argv.kind, argv.path);
