import { assert } from 'chai';
import {
  concat,
  drop,
  emptyList,
  fst,
  head,
  isEmpty,
  isList,
  isNonEmpty,
  isTuple,
  list,
  map,
  otherwise,
  piecewise,
  snd,
  tail,
  take,
  tuple
} from '../src/utils';

describe('Utils', () => {
  /* Data structures */
  describe('list', () => {
    it('should satisfy isList', () => {
      assert.isTrue(isList(list()));
    });
  });

  describe('emptyList', () => {
    it('should satisfy isList', () => {
      assert.isTrue(isList(emptyList()));
    });
  });

  describe('tuple', () => {
    it('should satisfy isTuple', () => {
      assert.isTrue(isTuple(tuple()));
    });
  });

  /* Common functions */
  describe('piecewise', () => {
    it ('should throw if given less than 2 arguments', () => {
      assert.throws(() => piecewise());
      assert.throws(() => piecewise(() => true));
    });

    it('should throw if given an uneven number of arguments', () => {
      const action = () => piecewise(
          () => false, () => undefined,
          otherwise
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
          otherwise, () => null
      )();

      assert.equal(actual, expected);
    });
  });

  /* List functions */
  describe('concat', () => {
    it('should return emptyList if given emptyLists', () => {
      const expected = emptyList();
      const actual = concat(emptyList(), emptyList());

      assert.deepEqual(actual, expected);
    });

    it('should return list if given empty list and list', () => {
      const expected = list(0, 1, 2);
      const actual = concat(emptyList(), list(0, 1, 2));

      assert.deepEqual(actual, expected);
    });

    it('should return combined string if given strings', () => {
      const expected = 'abc';
      const actual = concat('a', 'bc');

      assert.deepEqual(actual, expected);
    });
  });

  describe('drop', () => {
    it('should return 3..n elements of list if given 2 and list', () => {
      const expected = list(2);
      const actual = drop(2, list(0, 1, 2));

      assert.deepEqual(actual, expected);
    });
    it('should return 3..n characters of string if given 2 and string', () => {
      const expected = 'cd';
      const actual = drop(2, 'abcd');

      assert.deepEqual(actual, expected);
    });
  });

  describe('head', () => {
    it('should return the first element of a list', () => {
      const expected = 0;
      const actual = head(list(0, 1, 2));

      assert.equal(actual, expected);
    });

    it('should return the first character of a string', () => {
      const expected = 'a';
      const actual = head('abc');

      assert.deepEqual(actual, expected);
    });
  });

  describe('isEmpty', () => {
    it('should return true if given empty list', () => {
      assert.isTrue(isEmpty(emptyList()));
    });

    it ('should return false if given non-empty list', () => {
      assert.isFalse(isEmpty(list(null)));
    });

    it('should return true if given empty string', () => {
      assert.isTrue(isEmpty(''));
    });

    it('should return false if given non-empty string', () => {
      assert.isFalse(isEmpty('a'));
    });
  });

  describe('isNonEmpty', () => {
    it ('should return true if given non-empty list', () => {
      assert.isTrue(isNonEmpty(list(null)));
    });

    it('should return false if given empty list', () => {
      assert.isFalse(isNonEmpty(emptyList()));
    });

    it('should return true if given non-empty string', () => {
      assert.isTrue(isNonEmpty('a'));
    });

    it('should return false if given empty string', () => {
      assert.isFalse(isNonEmpty(''));
    });
  });

  describe('map', () => {
    it('should return same list if given identity function', () => {
      const expected = list(1, 2, 3);
      const actual = map(e => e, list(1, 2, 3));

      assert.deepEqual(actual, expected);
    });

    it('should return modify list if given double function', () => {
      const expected = list(2, 4, 6);
      const actual = map(e => 2*e, list(1, 2, 3));

      assert.deepEqual(actual, expected);
    });
  });

  describe('tail', () => {
    it('should return 2..n elements of generator', () => {
      const expected = list(1, 2);
      const actual = tail(list(0, 1, 2));

      assert.deepEqual(actual, expected);
    });

    it('should return 2..n character of a string', () => {
      const expected = 'bc';
      const actual = tail('abc');

      assert.deepEqual(actual, expected);
    });
  });

  describe('take', () => {
    it('should return 0..1 elements of 3-element list if given 2', () => {
      const expected = list(1, 2);
      const actual = take(2, list(1, 2, 3));

      assert.deepEqual(actual, expected);
    });

    it('should return 0..0 elements of 1-element list if given 2', () => {
      const expected = list(1);
      const actual = take(2, list(1));

      assert.deepEqual(actual, expected);
    });

    it('should return 0..1 characters of 3-characters string if given 2', () => {
      const expect = 'ab';
      const actual = take(2, 'abc');

      assert.deepEqual(actual, expect);
    });

    it('should return 0..1 characters of 1-character string if given 2', () => {
      const expect = 'a';
      const actual = take(2, 'a');

      assert.deepEqual(actual, expect);
    });
  });

  /* Tuple functions */
  describe('fst', () => {
    it('should return undefined if given 0-tuple', () => {
      assert.isUndefined(fst(tuple()));
    });

    it('should return value if given n-tuple', () => {
      const expected = 'first';
      const actual = fst(tuple('first', 'second'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('snd', () => {
    it('should return undefined if given 0-tuple', () => {
      assert.isUndefined(snd(tuple('first')));
    });

    it('should return value if given n-tuple', () => {
      const expected = 'second';
      const actual = snd(tuple('first', 'second'));

      assert.deepEqual(actual, expected);
    });
  });
});