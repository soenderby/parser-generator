import { assert } from 'chai';
import {sp, just, apply, some, optionalApply, first} from '../src/parser-tranformers';
import { list, tuple, drop, take, string, map } from '@soenderby/functional-utils';
import { symbol, token } from '../src/elementary-parsers';
import { listOf, many, sequence } from '../src/parser-combinators';
import {identity} from "ramda";

describe('Parser transformers', () => {
  describe('sp', () => {
    it('should make a parser ignore leading spaces', () => {
      const parseOneItem = str => list(tuple(drop(1, str), take(1, str)));
      const inputString = string('    a');

      const expected = list(
        tuple(string(''), string('a'))
      );
      const actual = sp(parseOneItem, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should leave trailing whitespace', () => {
      const parseOneItem = str => list(tuple(drop(1, str), take(1, str)));
      const inputString = string('    ab   ');

      const expected = list(
        tuple(string('b   '), string('a'))
      );
      const actual = sp(parseOneItem, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should work in a sequence', () => {
      const expected = list(
        tuple(string(''), tuple(string('token'),'a'))
      );
      const spsymbol = s => sp(symbol(s));
      const sptoken = t => sp(token(t));

      const actual = sequence(
        sptoken(string('token')),
        spsymbol('a'),
        string('token a')
      );

      assert.deepEqual(actual, expected);
    });
  });

  describe('just', () => {
    it('should only return results of given parser with empty remainder', () => {
      // fake parser, ignores parameter
      const parser = str => list(
        tuple(string('b   '), string('a')),
        tuple(string(''), string('result2')),
        tuple(string('also not empty'), string('result3'))
      );

      const expected = list(
        tuple(string(''), string('result2'))
      );
      const actual = just(parser, string('string'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('apply', () => {
    // This is a test where only the sub element result is passed to the given function
    /*
    it('should apply given function to the result', () => {
      const parser = string => tuple(  'result',  '' });
      const givenFunction = string => string.toUpperCase();

      const expected = tuple(  'RESULT',  '' });
      const actual = apply(givenFunction)(parser)('string');

      assert.deepEqual(actual, expected);
    });
    */

   it('should apply given function to the result', () => {
    const parser = str => list(
      tuple(string(''), string('result'))
    );
    const givenFunction = parseTree => map(c => c.toUpperCase(), parseTree);

    const expected = list(
      tuple(string(''), string('RESULT'))
    );
    const actual = apply(givenFunction, parser, string('string'));

    assert.deepEqual(actual, expected);
   });
  });

  describe('optionalApply', () => {
    it ('should return no from (no, yes) if parser result is empty', () => {
      const parser = str => list(
        tuple(string('remainder'), string(''))
      );

      const expected = list(
        tuple(string('remainder'), string('no'))
      );
      const actual = optionalApply(tuple(string('no'), identity), parser, string(''));

      assert.deepEqual(actual, expected);
    });

    it ('should return yes(x) from (no, yes) if parser result is non-empty', () => {
      const parser = str => list(
        tuple(string('remainder'), string('value'))
      );

      const expected = list(
        tuple(string('remainder'), string('yes'))
      );
      const actual = optionalApply(tuple(string('no'), () => string('yes')), parser, string(''));

      assert.deepEqual(actual, expected);
    });
  });

  describe('some', () => {
    it('should return parser that only returns result, and no remainder', () => {
      const parser = str => list(
        tuple(string(''), string('result'))
      );

      const expected = string('result');
      const actual = some(parser, string('string'));

      assert.deepEqual(actual, expected);
    });

    it('should return parser that only returns first result with no remainder', () => {
      const parser = str => list(
          tuple(string('remainder'), string('result1')),
          tuple(string(''), string('result2')),
          tuple(string(''), string('result3'))
        );

      const expected = string('result2');
      const actual = some(parser, string('string'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('first', () => {
    it('should return empty list if given parser has no results', () => {
      const expected = list();
      const actual = first(symbol('a'), string('string'));

      assert.deepEqual(actual, expected);
    });

    it('should return the first result if a parser is successful', () => {
      const expected = list(tuple(string(''), string('aa')));
      const actual = first(many(symbol('a')), string('aa'));

      assert.deepEqual(actual, expected);
    });
  });
});