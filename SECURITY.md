# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.

 package.json 
{
  "name": "compound-open-oracle",
  "version": "1.1.0",
  "description": "The Compound Open Oracle",
  "main": "index.js",
  "repository": "https://github.com/compound-finance/open-oracle",
  "author": "Compound Labs, Inc.",
{
  "name": "compound-open-oracle",
  "version": "1.1.0",
  "description": "The Compound Open Oracle",
  "main": "index.js",
  "repository": "https://github.com/compound-finance/open-oracle",
  "author": "Compound Labs, Inc.",
  "license": "MIT",
  "dependencies": {
    "bignumber.js": "^9.0.0",
    "eth-saddle": "^0.1.17",
    "eth-saddle": "0.1.19",
    "web3": "^1.2.4",
    "yargs": "^15.0.2"
  },
  "devDependencies": {
    "docker-compose": "^0.23.1",
    "istanbul": "^0.4.5",
    "jest": "^24.9.0",
    "jest-cli": "^24.9.0",
    "jest-junit": "^10.0.0"
  },
  "scripts": {
    "test": "npx saddle test",
    "test": "script/test",
    "coverage": "script/coverage",
    "console": "npx -n --experimental-repl-await saddle console",
    "compile": "npx saddle compile",
    "deploy": "npx saddle deploy"
  },
  "resolutions": {
    "**/ganache-core": "https://github.com/compound-finance/ganache-core.git#compound",
    "scrypt.js": "https://registry.npmjs.org/@compound-finance/ethereumjs-wallet/-/ethereumjs-wallet-0.6.3.tgz"
    "scrypt.js": "https://registry.npmjs.org/@compound-finance/ethereumjs-wallet/-/ethereumjs-wallet-0.6.3.tgz",
    "**/sha3": "^2.1.2"
  }
}![package](https://user-images.githubusercontent.com/87861683/159913264-a71e87d2-60a5-41be-977d-62c3244d9be3.jpg)

