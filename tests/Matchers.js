const BigNumber = require("bignumber.js");

expect.extend({
  addrEquals(actual, expected) {
    return {
      pass: actual.toLowerCase() == expected.toLowerCase(),
      message: () => `expected (${actual}) == (${expected})`
    }
  },

  numEquals(actual, expected) {
    return {
      pass: actual.toString() == expected.toString(),
      message: () => `expected (${actual.toString()}) == (${expected.toString()})`
    }
  }
});

expect.extend({
  greaterThan(actual, expected) {
    return {
      pass: (new BigNumber(actual)).gt(new BigNumber(expected)),
      message: () => `expected ${actual.toString()} to be greater than ${expected.toString()}`
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

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
