
import * as fs from 'fs';

export function loadKey(key: string | undefined): string | undefined {
  let privateKey;

  if (!key) {
    return undefined;
  }

  let fileMatch = /file:.*/.exec(key);
  if (fileMatch) {
    return fs.readFileSync(fileMatch[1], 'utf8');
  }

  let envMatch = /env:.*/.exec(key);
  if (envMatch) {
    return process.env[envMatch[1]];
  }

  return key;
}
