import { assert } from 'chai';
import {createResult, tuple, concatIfDefined, piecewise, isEmpty, isNonEmpty, head, list, tail } from '../src/utils';

const emptyGenerator = function*() {};
const nonEmptyGenerator = function* () { yield null; };
const numericGenerator = function* () {
  yield 0;
  yield 1;
  yield 2;
};

const assertEqualLists = (gen1, gen2) => {
  assert.deepEqual([...gen1()],[...gen2()]);
}

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

  describe('concatIfDefined', () => { //TODO change tests to concat
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

  describe('piecewise', () => {
    it ('should throw if given less than 2 arguments', () => {
      assert.throws(() => piecewise());
      assert.throws(() => piecewise(() => true));
    });

    it('should throw if given an uneven number of arguments', () => {
      const action = () => piecewise(
          () => false, () => undefined,
          () => true
      );
      assert.throws(action);
    });

    it('should throw if given a non-function argument', () => {
      const action = () => piecewise(
          () => true, null
      );
      assert.throws(action);
    });

    it ('should return value if predicate is true', () => {
      const expected = null;
      const actual = piecewise(
          () => true, () => null
      )();

      assert.equal(actual, expected);
    });
  });

  describe('isEmpty', () => {
    it('should return true if generator immediately returns', () => {
      assert.isTrue(isEmpty(emptyGenerator));
    });

    it ('should return false if generator returns value', () => {
      assert.isFalse(isEmpty(nonEmptyGenerator));
    });
  });

  describe('isNonEmpty', () => {
    it('should return false if generator immediately returns', () => {
      assert.isFalse(isNonEmpty(emptyGenerator));
    });

    it ('should return true if generator returns value', () => {
      assert.isTrue(isNonEmpty(nonEmptyGenerator));
    });
  });

  describe('head', () => {
    it('should return first element of a generator', () => {
      const expected = 0;
      const actual = head(numericGenerator);

      assert.equal(actual, expected);
    });

    it('should return the first character of a string', () => {
      const expected = 'a';
      const actual = head('abc');

      assert.deepEqual(actual, expected);
    })
  });

  describe('tail', () => {
    it('should return 2..n elements of generator', () => {
      const expected = list(1, 2);
      const actual = tail(numericGenerator);

      assertEqualLists(actual, expected);
    });

    it('should return 2..n character of a string', () => {
      const expected = 'bc';
      const actual = tail('abc');

      assert.deepEqual(actual, expected);
    });
  });
});