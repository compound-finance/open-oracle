import {
  matcherHint,
  printExpected,
  printReceived
} from 'jest-matcher-utils';

const predicate = (received, value, offset) =>
  Math.abs(received - value) <= offset;

const passMessage = (received, value, offset) => () =>
  matcherHint('.not.toBeNear', 'received', 'value', { secondArgument: 'offset' }) +
  '\n\n' +
  `Value:    ${printExpected(value)}\n` +
  `Offset:   ${printExpected(offset)}\n` +
  `Interval: [${printExpected(value - offset)}, ${printExpected(value + offset)}]\n` +
  `Received: ${printReceived(received)}`;

const failMessage = (received, value, offset) => () =>
  matcherHint('.toBeNear', 'received', 'value', { secondArgument: 'offset' }) +
  '\n\n' +
  `Value:    ${printExpected(value)}\n` +
  `Offset:   ${printExpected(offset)}\n` +
  `Interval: [${printExpected(value - offset)}, ${printExpected(value + offset)}]\n` +
  `Received: ${printReceived(received)}`;

export function toBeNear(received, value, offset) {
  const pass = predicate(received, value, offset);
  if (pass) {
    return { pass: true, message: passMessage(received, value, offset) };
  }
  return { pass: false, message: failMessage(received, value, offset) };
}
