import { assert } from 'chai';
import { epsilon, fail, satisfy, succeed, symbol, symbola, token } from '../src/elementary-parsers';
import {list, string, tuple} from '@soenderby/functional-utils';

describe('Elementary parsers', () => {
  describe('epsilon', () => {
    it('should not consume input, and return unmodified input', () => {
      const inputString = string('input text');

      const expected = list(tuple(inputString, tuple()));
      const actual = epsilon(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('fail', () => {
    it('should accept input, and generate nothing', () => {
      const inputString = string('input text');

      const expected = list();
      const actual = fail(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('satisfy', () => {
    it('should apply parser if given function evaluates to true', () => {
      const predicate = x => x === 'a';
      const inputString = string('abc');

      const expected = list(tuple(string('bc'), 'a'));
      const actual = satisfy(predicate, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply parser if given function evaluates to false', () => {
      const predicate = x => x === 'a';
      const inputString = string('b');

      const expected = list();
      const actual = satisfy(predicate, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('succeed', () => {
    it('should not consume input, and return given value', () => {
      const givenValue = string('value');
      const inputString = string('input text');

      const expected = list(tuple(inputString, givenValue));
      const actual = succeed(givenValue, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('symbol', () => {
    it('should parse a single char', () => {
      const charParameter = 'a';
      const inputString = string("an input text");

      const expected = list(tuple(string('n input text'), charParameter));
      const actual = symbol(charParameter, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse symbol, only if it is the first char in string', () => {
      const charParameter = 'a';
      const inputString = string("input text with a");

      const expected = list();
      const actual = symbol(charParameter, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse anything if no matching symbol', () => {
      const charParameter = 'a';
      const inputString = string("input text");

      const expected = list();
      const actual = symbol(charParameter, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('symbola', () => {
    it('should parse a single char', () => {
      const inputString = string("an input text");

      const expected = list(tuple(string('n input text'), 'a'));
      const actual = symbola(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse symbol, only if it is the first char in string', () => {
      const inputString = string("input text with a");

      const expected = list();
      const actual = symbola(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('token', () => {
    it('should parse a given substring', () => {
      const tokenParameter = string('token');
      const inputString = string("token and the rest");

      const expected = list(tuple(string(' and the rest'), tokenParameter ));
      const actual = token(tokenParameter, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse if matching token not at the beginning of input string', () => {
      const tokenParameter = string('token');
      const inputString = string("nothing then token and the rest");

      const expected = list();
      const actual = token(tokenParameter, inputString);

      assert.deepEqual(actual, expected);
    });
  });
});