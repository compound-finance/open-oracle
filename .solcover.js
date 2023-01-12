module.exports = {
  skipFiles: [
    "test/MockChainlinkOCRAggregator.sol",
    "test/UniswapV3SwapHelper.sol",
    "Uniswap/UniswapLib.sol",
  ],
  mocha: {
    grep: "@skip-on-coverage", // skip everything with this tag
    invert: true,
  },
};
