import * as chai from 'chai';
import { assert, expect } from 'chai';
import { list, tuple, map, head, snd, take, nth } from '../src/utils';
import { digit, natural, fract, fixed, integer } from '../src/expression-parsers';
import {many} from "../src/parser-combinators";

const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

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
      // last element has ambigious type (string or list), and is therefore not tested
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
    it('should recognize multiple digits and return result as an integer', () => {
      const expected = list(
        tuple('', 123),
        tuple('3', 12),
        tuple('23', 1),
        tuple('123', 0)
      );
      const actual = natural('123');

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
      const expected = list(
        tuple('', 0.23),
        tuple('3', 0.2),
        tuple('23', 0.0)
      );
      const actual = fract('23');

      // not perfect, but chai-almost does not support generators
      expect(nth(0, actual)).to.deep.almost(nth(0, expected), 0.01);
      expect(nth(1, actual)).to.deep.almost(nth(1, expected), 0.01);
      expect(nth(2, actual)).to.deep.almost(nth(2, expected), 0.01);
    });
  });

  describe('fixed', () => {
    it('should parse string that contains a float and return result as a float', () => {
      const expected = list(
        tuple('', 12.3),
        tuple('3', 12.0),
        tuple('.3', 12.0),
        tuple('2.3', 1.0),
        tuple('12.3', 0.0)
      );
      const actual = fixed('12.3');

      // not perfect, but chai-almost does not support generators
      expect(nth(0, actual)).to.deep.almost(nth(0, expected), 0.01);
      expect(nth(1, actual)).to.deep.almost(nth(1, expected), 0.01);
      expect(nth(2, actual)).to.deep.almost(nth(2, expected), 0.01);
      expect(nth(3, actual)).to.deep.almost(nth(3, expected), 0.01);
      expect(nth(4, actual)).to.deep.almost(nth(4, expected), 0.01);
    });
  });
});