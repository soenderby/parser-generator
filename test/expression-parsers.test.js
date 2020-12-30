import { assert } from 'chai';
import { list, tuple, map, head, snd } from '../src/utils';
import { digit, natural, fract, fixed } from '../src/expression-parsers';

const firstParseResult= result => snd(head(result));

describe('Expression Parsers', () => {
  /* number parsers */
  describe('digit', () => {
    it('should recognize a digit characters and return the result as an integer', () => {
      const expected = list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      const actual = map(x => firstParseResult(digit(x)), list('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('natural', () => {
    it('should recognize mutiple digits and return result as an integer', () => {
      const expected = 123;
      const actual = firstParseResult(natural('123'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('fract', () => {
    it('should parse the fractional part of a float', () => {
      const expected = 0.23;
      const actual = firstParseResult(fract('23'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('fixed', () => {
    it('should parse string that contains a float and return result as a float', () => {
      const expected = 12.3;
      const actual = firstParseResult(natural('12.3'));
      
      assert.deepEqual(actual, expected);
    });
  });
});