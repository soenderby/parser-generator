import { assert, expect } from 'chai';
import { list, tuple, map, head, snd, take } from '../src/utils';
import { digit, natural, fract, fixed, integer } from '../src/expression-parsers';
import {many} from "../src/parser-combinators";

const firstParseResult= result => snd(head(result));

describe('Expression Parsers', () => {
  /* number parsers */
  describe('digit', () => {

    it('should recognize 0', () => {
      assert.deepEqual(digit('0'), list(tuple('', 0)));
    });

    it('should recognize 1', () => {
      assert.deepEqual(digit('1'), list(tuple('', 1)));
    });

    it('should recognize 2', () => {
      assert.deepEqual(digit('2'), list(tuple('', 2)));
    });

    it('should recognize 3', () => {
      assert.deepEqual(digit('3'), list(tuple('', 3)));
    });

    it('should recognize 4', () => {
      assert.deepEqual(digit('4'), list(tuple('', 4)));
    });
    
    it('should recognize 5', () => {
      assert.deepEqual(digit('5'), list(tuple('', 5)));
    });

    it('should recognize 6', () => {
      assert.deepEqual(digit('6'), list(tuple('', 6)));
    });

    it('should recognize 7', () => {
      assert.deepEqual(digit('7'), list(tuple('', 7)));
    });

    it('should recognize 8', () => {
      assert.deepEqual(digit('8'), list(tuple('', 8)));
    });

    it('should recognize 9', () => {
      assert.deepEqual(digit('9'), list(tuple('', 9)));
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

  describe('integer', () => {
    it('should parse a positive integer', () => {
      const expected = list(
        tuple('', 123),
        tuple('3', 12),
        tuple('23', 1),
        tuple('123', 0)
      );
      const actual = integer('123');

      assert.deepEqual(actual, expected);
    });

    it('should parse a negative integer', () => {
      const expected = list(
        tuple('', -123),
        tuple('3', -12),
        tuple('23', -1),
        tuple('123', -0),
        tuple('-123', 0)
      );
      const actual = integer('-123');

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