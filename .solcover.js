module.exports = {
  skipFiles: [
    "test/MockChainlinkOCRAggregator.sol",
    "test/UniswapV3SwapHelper.sol",
  ],
  mocha: {
    grep: "@skip-on-coverage", // skip everything with this tag
    invert: true,
  },
  onServerReady: () => {
    process.env.COVERAGE = true;
  },
};
