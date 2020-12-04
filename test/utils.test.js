import { assert } from 'chai';
import { createResult, tuple, concatIfDefined } from '../src/utils';

describe('Utils', () => {
  describe('createResult', () => {
    it('called without parameters should return result object with default values', () => {
      const expected = { result: [''], remainder: '' };
      const actual = createResult();

      assert.deepEqual(actual, expected);
    });

    it('should return result object with given values', () => {
      const expected = { result: ['result'], remainder: 'remainder' };
      const actual = createResult({ result: 'result', remainder: 'remainder' });

      assert.deepEqual(actual, expected);
    });
  });

  describe('tuple', () => {
    /*
    it('should accept two parameters for the value of the tuple', () => {
      const expected = { fst: 'first', snd: 'second' };

      const actual = tuple('first', 'second').value;

      assert.deepEqual(actual, expected);
    });
    */

    it('should have a fst member, with value of first parameter', () => {
      const expected = 'first';

      const actual = tuple('first', 'second').fst;

      assert.deepEqual(actual, expected);
    });

    it('should have a snd member, with value of second parameter', () => {
      const expected = 'second';

      const actual = tuple('first', 'second').snd;

      assert.deepEqual(actual, expected);
    });
  });

  describe('concatIfDefined', () => {
    it('should concat if the value given is not undefined', () => {
      const givenElement = 'element';

      const expected = ['element'];
      const actual = concatIfDefined([], givenElement);

      assert.deepEqual(actual, expected);
    });

    it('should not concat element if it is undefined', () => {
      const expected = ['element'];
      const actual = concatIfDefined(['element'], undefined);

      assert.deepEqual(actual, expected);
    });
  });
});