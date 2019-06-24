
expect.extend({
  numEquals(actual, expected) {
    return {
      pass: actual.toString() == expected.toString(),
      message: () => `expected ${JSON.stringify(actual)} == ${JSON.stringify(expected)}`
    }
  }
});

expect.extend({
  toRevert(actual, msg='revert') {
    return {
      pass: !!actual['message'] && actual.message === `VM Exception while processing transaction: ${msg}`,
      message: () => `expected revert, got: ${JSON.stringify(actual)}`
    }
  }
});
