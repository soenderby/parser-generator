import { assert } from 'chai';
import { list, tuple, map, head, snd } from '../src/utils';
import { digit, natural } from '../src/expression-parsers';

describe('Expression Parsers', () => {
  /* number parsers */
  describe('digit', () => {
    it('should recognize a digit characters and return the result as an integer', () => {
      const expected = list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      const actual = map(x => snd(head(digit(x))), list('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'));
      
      assert.deepEqual(actual, expected);
    });
  });

  describe('natural', () => {
    it('should ', () => {

    });
  });
});