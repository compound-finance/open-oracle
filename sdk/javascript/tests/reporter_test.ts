import {annotateType} from '../src/reporter';

test('type annotation', async () => {
  expect(annotateType("prices", "string", "decimal")).toEqual(5);
});
