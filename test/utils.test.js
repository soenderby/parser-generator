import { assert } from 'chai';
import {
  concat,
  drop,
  emptyList,
  filter,
  foldl,
  foldr,
  fmap,
  fst,
  head,
  isEmpty,
  isList,
  isNonEmpty,
  isTuple,
  isAlpha,
  isDigit,
  list,
  listToArray,
  listToArrayRecursively,
  map,
  nth,
  otherwise,
  piecewise,
  recursiveList,
  snd,
  tail,
  take,
  tuple,
  string,
  prepend,
  append
} from '../src/utils';

describe('Utils', () => {
  describe('Data structures', () => {
    /* describe('emptyList', () => {
      it('should satisfy isList', () => {
        assert.isTrue(isList(emptyList(list())));
      });
    }); */

    describe('list', () => {
      it('should satisfy isList', () => {
        assert.isTrue(isList(list()));
      });
    });

    /* describe('recursiveList', () => {
      it('should satisfy isList', () => {
        const l = recursiveList(1, n => n);
        assert.isTrue(isList(l))
      });

      it('should return list of natural numbers', () => {
        const expected = list(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        const actual = take(10, recursiveList(
          1,
          n => n + 1
        ));
        assert.deepEqual(actual, expected);
      });

      it('should return list of fibonacci numbers', () => {
        const expected = list(0, 1, 1, 2, 3, 5, 8, 13, 21, 34);
        const actual = take(10, recursiveList(
          0, 1,
          (n1, n2) => n1 + n2
        ));
        assert.deepEqual(actual, expected);
      });
    });*/

    describe('tuple', () => {
      it('should satisfy isTuple', () => {
        assert.isTrue(isTuple(tuple()));
      });
    });
  });

  describe('Common functions', () => {
    describe('piecewise', () => {
      it('should throw if given less than 2 arguments', () => {
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

      it('should return value if predicate is true', () => {
        const expected = null;
        const actual = piecewise(
          otherwise, () => null
        )();

        assert.equal(actual, expected);
      });
    });
  });

  describe('List functions', () => {
    describe('concat', () => {
      it('should return emptyList if given emptyLists', () => {
        const expected = list();
        const actual = concat(list(), list());

        assert.deepEqual(actual, expected);
      });

      it('should return list if given empty list and list', () => {
        const expected = list(0, 1, 2);
        const actual = concat(list(), list(0, 1, 2));

        assert.deepEqual(actual, expected);
      });

      it('should return combined string if given strings', () => {
        const expected = string('abc');
        const actual = concat(string('a'), string('bc'));

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

    describe('filter', () => {
      it('should return same list given true predicate', () => {
        const expected = list(1, 2, 3);
        const actual = filter(e => true, list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it('should return a list containing only elements that match predicate', () => {
        const expected = list(2, 4);
        const actual = filter(e => e % 2 === 0, list(1, 2, 3, 4, 5));

        assert.deepEqual(actual, expected);
      });
    });

    describe('foldl', () => {
      it('should return base case for empty string', () => {
        const expected = 'a';
        const actual = foldl(append, 'a', '');

        assert.deepEqual(actual, expected);
      });

      it('should return the same string if given string', () => {
        const expected = string('abc');
        const actual = foldl(append, '', string('abc'));

        assert.deepEqual(actual, expected);
      });

      it('should return base case for empty list', () => {
        const expected = 1;
        const actual = foldl(append, 1, list());

        assert.deepEqual(actual, expected);
      });

      it('should return the same list if given list', () => {
        const expected = list(1, 2, 3);
        const actual = foldl(append, list(), list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it('should be able to sum a list of numbers', () => {
        const expected = 6;
        const actual = foldl((a, b) =>  a + b, 0, list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it('should be able to unparsed sum a list of numbers', () => {
        const expected = '0 + 1 + 2 + 3';
        const actual = foldl((a, b) =>  `${a} + ${b}`, 0, list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });
    });

    describe('foldr', () => {
      it('should return base case for empty string', () => {
        const expected = 'a';
        const actual = foldr(list, 'a', '');

        assert.deepEqual(actual, expected);
      });

      it('should return a reversed string if given string', () => {
        const expected = string('abc');
        const actual = foldr(prepend, '', string('abc'));

        assert.deepEqual(actual, expected);
      });

      it('should return base value for empty list', () => {
        const expected = 1;
        const actual = foldr(prepend, 1, list());

        assert.deepEqual(actual, expected);
      });

      it('should return a reversed list if given list', () => {
        const expected = list(1, 2, 3);
        const actual = foldr(prepend, list(), list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it('should be able to sum a list of numbers', () => {
        const expected = 6;
        const actual = foldr((a, b) =>  a + b, 0, list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it('should be able to unparsed sum a list of numbers', () => {
        const expected = '1 + 2 + 3 + 0';
        const actual = foldr((a, b) =>  `${a} + ${b}`, 0, list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });
    });

    describe('fmap', () => {
      it('should concat lists when given identity function', () => {
        const expected = list(1, 2, 3);
        const actual = fmap(e => e, list(list(1), list(2), list(3)));

        assert.deepEqual(actual, expected);
      });

      it('should return flat list when given function that produces list', () => {
        const expected = list(2, 4, 6);
        const actual = fmap(e => list(e * 2), list(1, 2, 3));

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
        assert.isTrue(isEmpty(list()));
      });

      it('should return false if given non-empty list', () => {
        assert.isFalse(isEmpty(list(null)));
      });

      it('should return true if given empty string', () => {
        assert.isTrue(isEmpty(''));
      });

      it('should return false if given non-empty string', () => {
        assert.isFalse(isEmpty('a'));
      });
    });

    describe('isAlpha', () => {
      it('should return false for \'1\'', () => {
        assert.isFalse(isAlpha('1'));
      });

      it('should return true for \'a\'', () => {
        assert.isTrue(isAlpha('a'));
      });

      it('should return true for \'A\'', () => {
        assert.isTrue(isAlpha('A'));
      });
    });

    describe('isDigit', () => {
      it('should recognize all single digits', () => {
        const actual = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(x => isDigit(x));

        assert.isFalse(actual.includes(false))
      });

      it('should throw error if given more than a single character', () => {
        assert.throws(() => isDigit('00'));
      });
    });

    describe('isNonEmpty', () => {
      it('should return true if given non-empty list', () => {
        assert.isTrue(isNonEmpty(list(null)));
      });

      it('should return false if given empty list', () => {
        assert.isFalse(isNonEmpty(list()));
      });

      it('should return true if given non-empty string', () => {
        assert.isTrue(isNonEmpty('a'));
      });

      it('should return false if given empty string', () => {
        assert.isFalse(isNonEmpty(''));
      });
    });

    describe('nth', () => {
      it ('should return undefined for out-of-bounds index', () => {
        assert.isUndefined(nth(2, list(1, 2)));
      });

      it ('should return nth element in array', () => {
        const expected = 3;
        const actual = nth(2, [1, 2, 3]);

        assert.deepEqual(actual, expected);
      });

      it ('should return nth element in list', () => {
        const expected = 3;
        const actual = nth(2, list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it ('should return nth character in string', () => {
        const expected = 'c';
        const actual = nth(2, 'abc');

        assert.deepEqual(actual, expected);
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
        const actual = map(e => 2 * e, list(1, 2, 3));

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
  });

  describe('Test utility functions', () => {
    describe('chai deepEqual plugin', () => {
      it('should equate empty lists', () => {
        const data1 = list();
        const data2 = list();

        assert.deepEqual(data1, data2);
      });

      it('should not equate empty list and non-empty list', () => {
        const data1 = list();
        const data2 = list(1);

        assert.throws(() => assert.deepEqual(data1, data2));
      });

      it('should equate equal lists of primitives', () => {
        const data1 = list(1, 2, 3);
        const data2 = list(1, 2, 3);

        assert.deepEqual(data1, data2);
      });

      it('should not equate non-equal list of primitives', () => {
        const data1 = list(1, 2, 3);
        const data2 = list(1, 2, 2);

        assert.throws(() => assert.deepEqual(data1, data2));
      });

      it('should equate equal lists of objects', () => {
        const data1 = list({a: 1}, {a: 2}, {a: 3});
        const data2 = list({a: 1}, {a: 2}, {a: 3});

        assert.deepEqual(data1, data2);
      });

      it('should not equate non-equal lists of objects', () => {
        const data1 = list({a: 1}, {a: 2}, {a: 3});
        const data2 = list({a: 1}, {a: 2}, {a: 2});

        assert.throws(() => assert.deepEqual(data1, data2));
      });

      it('should equate equal list of lists', () => {
        const data1 = list(list(1, 2, 3), list(1, 2, 3));
        const data2 = list(list(1, 2, 3), list(1, 2, 3));

        assert.deepEqual(data1, data2);
      });

      it('should not equate non-equal list of lists', () => {
        const data1 = list(list(1, 2, 3), list(1, 2, 3));
        const data2 = list(list(1, 2, 2), list(1, 2, 3));

        assert.throws(() => assert.deepEqual(data1, data2));
      });
    });

    describe('listToArray', () => {
      it('should convert list to array', () => {
        const expected = [1, 2, 3];
        const actual = listToArray(list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });
    });

    describe('listToArrayRecursively', () => {
      it('should convert list of primitives to array of primitives', () => {
        const expected = [1, 2, 3];
        const actual = listToArrayRecursively(list(1, 2, 3));

        assert.deepEqual(actual, expected);
      });

      it('should convert list of objects to array of objects', () => {
        const expected = [{a: 1}, {a: 2}, {a: 3}];
        const actual = listToArrayRecursively(list({a: 1}, {a: 2}, {a: 3}));

        assert.deepEqual(actual, expected);
      });

      it('should convert list of lists to array of arrays', () => {
        const expected = [[1], [2], [3]];
        const actual = listToArrayRecursively(list(list(1), list(2), list(3)));

        assert.deepEqual(actual, expected);
      });

      it('should convert list properties to array properties', () => {
        const expected = {a: [1, 2, 3]};
        const actual = listToArrayRecursively({a: list(1, 2, 3)});

        assert.deepEqual(actual, expected);
      });
    });
  });

  describe('Tuple functions', () => {
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
});