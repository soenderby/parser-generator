import * as chai from 'chai';
import { assert, expect } from 'chai';
import { list, tuple, map, head, snd, take, nth, drop } from '../src/utils';
import {
  digit,
  natural,
  fract,
  fixed,
  integer,
  identifier,
  float,
  fact,
  constant,
  variable,
  callOperation,
  addition,
  subtraction,
  multiplication,
  division
} from '../src/expression-parsers';
import {many} from "../src/parser-combinators";

const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const firstParseResult= result => snd(head(result));

describe('Expression Parsers', () => {
  describe('identifier', () => {
    it ('should return empty list on numbers', () => {
      const expected = list();
      const actual = identifier('123');

      assert.deepEqual(actual, expected);
    });

    it ('should return first word in list of words', () => {
      const expected = list(
        tuple(' dog', 'The'),
        tuple('e dog', 'Th'),
        tuple('he dog', 'T')
      );
      const actual = identifier('The dog');

      assert.deepEqual(actual, expected);
    });
  });

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

  describe('float', () => {
    it('should parse string that contains a float and return result as a float', () => {
      const expected = list(
        tuple('', 12000.0),
        tuple('3', 12.0),
        tuple('E3', 12.0),
        tuple('2E3', 1.0),
        tuple('12E3', 0.0)
      );
      const actual = float('12E3');

      // not perfect, but chai-almost does not support generators
      expect(nth(0, actual)).to.deep.almost(nth(0, expected), 0.01);
      expect(nth(1, actual)).to.deep.almost(nth(1, expected), 0.01);
      expect(nth(2, actual)).to.deep.almost(nth(2, expected), 0.01);
      expect(nth(3, actual)).to.deep.almost(nth(3, expected), 0.01);
      expect(nth(4, actual)).to.deep.almost(nth(4, expected), 0.01);
    });
  });

  describe('fact', () => {
    it('should parse \'123\' to constant', () => {
      const expected = list(
        tuple('', constant(123)),
        tuple('3', constant(12)),
        tuple('23', constant(1))
      );
      const actual = take(3, fact('123'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'abc\' to variables', () => {
      const expected = list(
        tuple('', variable('abc')),
        tuple('c', variable('ab')),
        tuple('bc', variable('a')),
      );
      const actual = fact('abc');

      assert.deepEqual(actual, expected);
    });

    it('should parse \'f(a,b)\' to callOperation', () => {
      const expected = list(
        tuple('', callOperation('f', list(variable('a'), variable('b'))))
      );
      const actual = fact('f(a,b)');

      assert.deepEqual(actual, expected);
    });

    it('should parse \'(a)\' to callOperation', () => {
      const expected = list(
        tuple('', variable('a'))
      );
      const actual = fact('(a)');

      assert.deepEqual(actual, expected);
    });
  });

  describe('term', () => {
    it('should parse \'a*b\' to addition', () => {
      const expected = list(
        tuple('', multiplication(variable('a'), variable('b'))),
      );
      const actual = fact('a*b');

      assert.deepEqual(actual, expected);
    });

    it('should parse \'a/b\' to addition', () => {
      const expected = list(
        tuple('', division(variable('a'), variable('b'))),
      );
      const actual = fact('a/b');

      assert.deepEqual(actual, expected);
    });
  });

  describe('expr', () => {
    it('should parse \'a+b\' to addition', () => {
      const expected = list(
        tuple('', addition(variable('a'), variable('b'))),
      );
      const actual = fact('a+b');

      assert.deepEqual(actual, expected);
    });

    it('should parse \'a-b\' to addition', () => {
      const expected = list(
        tuple('', subtraction(variable('a'), variable('b'))),
      );
      const actual = fact('a-b');

      assert.deepEqual(actual, expected);
    });
  });
});