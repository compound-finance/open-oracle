module.exports = {
  skipFiles: [
    "test/MockChainlinkOCRAggregator.sol",
    "test/UniswapV3SwapHelper.sol",
    "test/UniswalLib.sol",
  ],
  mocha: {
    grep: "@skip-on-coverage", // skip everything with this tag
    invert: true,
  },
};
