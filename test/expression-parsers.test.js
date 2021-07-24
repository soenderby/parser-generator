import * as chai from 'chai';
import { assert, expect } from 'chai';
import { list, tuple, map, head, snd, take, nth, drop, string } from '@soenderby/functional-utils';
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
  division,
  expr
} from '../src/expression-parsers';
import {many} from "../src/parser-combinators";

const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const firstParseResult= result => snd(head(result));

describe('Expression Parsers', () => {
  describe('identifier', () => {
    it ('should return empty list on numbers', () => {
      const expected = list();
      const actual = identifier(string('123'));

      assert.deepEqual(actual, expected);
    });

    it ('should return first word in list of words', () => {
      const expected = list(
        tuple(string(' dog'), string('The')),
        tuple(string('e dog'), string('Th')),
        tuple(string('he dog'), string('T'))
      );
      const actual = identifier(string('The dog'));

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
        tuple(string(''), list(1, 2, 3)),
        tuple(string('3'), list(1, 2)),
        tuple(string('23'), list(1))
      );
      const actual = take(3, many(digit, string('123')));

      assert.deepEqual(actual, expected);
    });
  });

  describe('natural', () => {
    it('should recognize multiple digits and return result as an integer', () => {
      const expected = list(
        tuple(string(''), 123),
        tuple(string('3'), 12),
        tuple(string('23'), 1)
      );
      const actual = natural(string('123'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('integer', () => {
    it('should parse a positive integer', () => {
      const expected = list(
        tuple(string(''), 123),
        tuple(string('3'), 12),
        tuple(string('23'), 1)
      );
      const actual = integer(string('123'));

      assert.deepEqual(actual, expected);
    });

    it('should parse a negative integer', () => {
      const expected = list(
        tuple(string(''), -123),
        tuple(string('3'), -12),
        tuple(string('23'), -1),
      );
      const actual = integer(string('-123'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('fract', () => {
    it('should parse the fractional part of a float', () => {
      const expected = list(
        tuple(string(''), 0.23),
        tuple(string('3'), 0.2),
        tuple(string('23'), 0.0)
      );
      const actual = fract(string('23'));

      // not perfect, but chai-almost does not support generators
      expect(nth(0, actual)).to.deep.almost(nth(0, expected), 0.01);
      expect(nth(1, actual)).to.deep.almost(nth(1, expected), 0.01);
      expect(nth(2, actual)).to.deep.almost(nth(2, expected), 0.01);
    });
  });

  describe('fixed', () => {
    it('should parse string that contains a float and return result as a float', () => {
      const expected = list(
        tuple(string(''), 12.3),
        tuple(string('3'), 12.0),
        tuple(string('.3'), 12.0),
        tuple(string('2.3'), 1.0)
      );
      const actual = fixed(string('12.3'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('float', () => {
    it('should parse string that contains a float and return result as a float', () => {
      const expected = list(
        tuple(string(''), 12000.0),
        tuple(string('E3'), 12.0),
        tuple(string('2E3'), 1.0)
      );
      const actual = float(string('12E3'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('fact', () => {
    it('should parse \'123\' to constant', () => {
      const expected = list(
        tuple(string(''), constant(123)),
        tuple(string('3'), constant(12)),
        tuple(string('23'), constant(1))
      );
      const actual = take(3, fact(string('123')));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'abc\' to variables', () => {
      const expected = list(
        tuple(string(''), variable('abc')),
        tuple(string('c'), variable('ab')),
        tuple(string('bc'), variable('a')),
      );
      const actual = fact(string('abc'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'f(a,b)\' to callOperation', () => {
      const expected = list(
        tuple(string(''), callOperation('f', list(variable('a'), variable('b')))),
        tuple(string('(a,b)'), variable('f'))
      );
      const actual = fact(string('f(a,b)'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'(a)\' to variable', () => {
      const expected = list(
        tuple(string(''), variable('a'))
      );
      const actual = fact(string('(a)'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('expr', () => {
    it('should parse \'a*b\' to addition', () => {
      const expected = list(
        tuple(string(''), multiplication(variable('a'), variable('b'))),
        tuple(string('*b'), variable('a'))
      );
      const actual = expr(string('a*b'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'a/b\' to addition', () => {
      const expected = list(
        tuple(string(''), division(variable('a'), variable('b'))),
        tuple(string('/b'), variable('a'))
      );
      const actual = expr(string('a/b'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'a+b\' to addition', () => {
      const expected = list(
        tuple(string(''), addition(variable('a'), variable('b'))),
        tuple(string('+b'), variable('a'))
      );
      const actual = expr(string('a+b'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'a-b\' to addition', () => {
      const expected = list(
        tuple(string(''), subtraction(variable('a'), variable('b'))),
        tuple(string('-b'), variable('a'))
      );
      const actual = expr(string('a-b'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'a+b/c\' to addition', () => {
      const expected = list(
        tuple(string(''), addition(variable('a'), division(variable('b'), variable('c')))),
        tuple(string('/c'), addition(variable('a'), variable('b'))),
        tuple(string('+b/c'), variable('a'))
      );
      const actual = expr(string('a+b/c'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'(a+b)/c\' to addition', () => {
      const expected = list(
        tuple(string(''), division(addition(variable('a'), variable('b')), variable('c'))),
        tuple(string('/c'), addition(variable('a'), variable('b'))),
      );
      const actual = expr(string('(a+b)/c'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'f(x)\' to callOperation', () => {
      const expected = list(
        tuple(string(''), callOperation('f', list(variable('x')))),
        tuple(string('(x)'), variable('f'))
      );
      const actual = expr(string('f(x)'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'f(x,y)\' to callOperation', () => {
      const expected = list(
        tuple(string(''), callOperation('f', list(variable('x'), variable('y')))),
        tuple(string('(x,y)'), variable('f'))
      );
      const actual = expr(string('f(x,y)'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'f(x,y)\' to callOperation', () => {
      const expected = list(
        tuple(string(''), callOperation('f', list(variable('x'), variable('y')))),
        tuple(string('(x,y)'), variable('f'))
      );
      const actual = expr(string('f(x,y)'));

      assert.deepEqual(actual, expected);
    });

    it('should parse \'f(x+y)\' to callOperation', () => {
      const expected = list(
        tuple(string(''), callOperation('f', list(addition(variable('x'), variable('y'))))),
        tuple(string('(x+y)'), variable('f'))
      );
      const actual = expr(string('f(x+y)'));

      assert.deepEqual(actual, expected);
    });
  });
});