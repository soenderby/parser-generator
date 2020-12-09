import { assert } from 'chai';
import { symbol, token, satisfy, epsilon, succeed, fail } from '../src/elementary-parsers';
import {tuple, list, emptyList} from '../src/utils';

describe('Elementary parsers', () => {
  describe('symbol', () => {
    it('should parse a single char', () => {
      const charParameter = 'a';
      const inputString = "an input text";

      const expected = list(tuple('n input text', charParameter));
      const actual = symbol(charParameter, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse symbol, only if it is the first char in string', () => {
      const charParameter = 'a';
      const inputString = "input text with a";

      const expected = emptyList();
      const actual = symbol(charParameter, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse anything if no matching symbol', () => {
      const charParameter = 'a';
      const inputString = "input text";

      const expected = emptyList();
      const actual = symbol(charParameter, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('token', () => {
    it('should parse a given substring', () => {
      const tokenParameter = 'token';
      const inputString = "token and the rest";

      const expected = list(tuple(' and the rest', tokenParameter ));
      const actual = token(tokenParameter, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse if matching token not at the beginning of input string', () => {
      const tokenParameter = 'token';
      const inputString = "nothing then token and the rest";

      const expected = list();
      const actual = token(tokenParameter, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('satisfy', () => {
    it('should apply parser if given function evaluates to true', () => {
      const predicate = x => x === 'a';
      const inputString = 'abc';

      const expected = list(tuple('bc', 'a'));
      const actual = satisfy(predicate, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply parser if given function evaluates to false', () => {
      const predicate = x => x === 'a';
      const inputString = 'b';

      const expected = list();
      const actual = satisfy(predicate, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('epsilon', () => {
    it('should not consume input, and return unmodified input', () => {
      const inputString = 'input text';

      const expected = list(tuple(inputString, tuple()));
      const actual = epsilon(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('succeed', () => {
    it('should not consume input, and return given value', () => {
      const givenValue = 'value';
      const inputString = 'input text';

      const expected = list(tuple(inputString, givenValue));
      const actual = succeed(givenValue, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('fail', () => {
    it('should accept input, and generate nothing', () => {
      const inputString = 'input text';

      const expected = list();
      const actual = fail(inputString);

      assert.deepEqual(actual, expected);
    });
  });
});