const BigNumber = require("bignumber.js");

expect.extend({
  numEquals(actual, expected) {
    return {
      pass: actual.toString() == expected.toString(),
      message: () => `expected ${JSON.stringify(actual)} (${actual.toString()}) == ${JSON.stringify(expected)} (${expected.toString()})`
    }
  }
});

expect.extend({
  greaterThan(actual, expected) {
    return {
      pass: (new BigNumber (actual)).gt(new BigNumber(expected)),
      message: () => `expected ${JSON.stringify(actual)} to be greater than ${JSON.stringify(expected)}`
    }
  }
});

expect.extend({
  toRevert(actual, msg='revert') {
    return {
      pass: !!actual['message'] && actual.message === `VM Exception while processing transaction: ${msg}`,
      message: () => `expected revert, got: ${actual && actual.message ? actual : JSON.stringify(actual)}`
    }
  }
});
