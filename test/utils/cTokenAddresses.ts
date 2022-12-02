import { keccak256 } from "./keccak256";
const parameters = require("../../configuration/parameters");

type ParameterConfig = [
  string,
  number,
  {
    // "NAME": "ETH",
    cToken: string;
    underlying: string;
    symbolHash: string;
    baseUnit: string;
    priceSource: string;
    fixedPrice: string;
    uniswapMarket: string;
    reporter: string;
    reporterMultiplier: string;
    isUniswapReversed: boolean;
  }[]
];

interface TokenAddresses {
  [T: string]: {
    underlying: string;
    cToken: string;
  };
}

export const getTokenAddresses = (symbols: string[]): TokenAddresses => {
  return symbols.reduce((prev, curr) => {
    const symbolHash = curr === "WBTC" ? keccak256("BTC") : keccak256(curr);
    const [, , tokenParams] = parameters as ParameterConfig;
    const token = tokenParams.find((p) => p.symbolHash === symbolHash);
    if (!token)
      throw new Error(`Token ${curr} is not configured in parameters.js`);
    prev[curr] = {
      underlying: token.underlying,
      cToken: token.cToken,
    };
    return prev;
  }, {} as TokenAddresses);
};
