import { assert, expect } from 'chai';
import { list, tuple, map, head, snd, take } from '../src/utils';
import { digit, natural, fract, fixed } from '../src/expression-parsers';
import {many} from "../src/parser-combinators";

const firstParseResult= result => snd(head(result));

describe('Expression Parsers', () => {
  /* number parsers */
  describe('digit', () => {
    it('should recognize a digit characters and return the result as an integer', () => {
      const expected = list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      const actual = map(x => firstParseResult(digit(x)), list('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'));

      assert.deepEqual(actual, expected);
    });

    it('should recognize a repeated digit characters if combined with many', () => {
      const expected = list(
        tuple('', list(1, 2, 3)),
        tuple('3', list(1, 2)),
        tuple('23', list(1))
      );
      const actual = take(3, many(digit, '123'));

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

      expect(actual).to.be.closeTo(expected, 0.01);
    });
  });

  describe('fixed', () => {
    it('should parse string that contains a float and return result as a float', () => {
      const expected = 12.3;
      const actual = firstParseResult(fixed('12.3'));
      
      expect(actual).to.be.closeTo(expected, 0.01);
    });
  });
});