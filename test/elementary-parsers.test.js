import { assert } from 'chai';
import { symbol, token, satisfy, epsilon, succeed, fail } from '../src/elementary-parsers';

// factory for creating the parser result object
// used to ensure consistent output format
// This is a copy of the factory used in the production code
// It is meant to minimize the neccessary amount of refacoring
const createResult = ({ result = '', remainder = '' } = {}) => 
  Array.isArray(result) ? 
    { fst: result, snd: remainder }
  :
    { fst: result, snd: remainder };


describe('Elementary parsers', () => {
  describe('symbol', () => {
    it('should parse a single char', () => {
      const charParameter = 'a';
      const inputString = "an input text";

      const expected = createResult({ result: charParameter, remainder: 'n input text'});
      const actual = symbol(charParameter)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse symbol, only if it is the first char in string', () => {
      const charParameter = 'a';
      const inputString = "input text with a";

      const expected = createResult({ result: '', remainder: inputString });
      const actual = symbol(charParameter)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse anything if no matching symbol', () => {
      const charParameter = 'a';
      const inputString = "input text";

      const expected = createResult({ result: '', remainder: inputString });
      const actual = symbol(charParameter)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('token', () => {
    it('should parse a given substring', () => {
      const tokenParameter = 'token';
      const inputString = "token and the rest";

      const expected = createResult({ result: tokenParameter, remainder: ' and the rest' });
      const actual = token(tokenParameter)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse if matching token not at the beginning of inputstring', () => {
      const tokenParameter = 'token';
      const inputString = "nothing then token and the rest";

      const expected = createResult({ result: '', remainder: inputString });
      const actual = token(tokenParameter)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('satisfy', () => {
    it('should apply parser if given function evaluates to true', () => {
      const identityParser = input => createResult({ result: input, remainder: ''});
      const predicateFunction = x => x === 'a';
      const inputString = 'a';

      const expected = createResult({ result: inputString, remainder: ''});
      const actual = satisfy(predicateFunction)(identityParser)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply parser if given function evaluates to false', () => {
      const identityParser = input => createResult({ result: input, remainder: ''});
      const predicateFunction = x => x === 'a';
      const inputString = 'b';

      const expected = createResult({ result: '', remainder: 'b'});
      const actual = satisfy(predicateFunction)(identityParser)(inputString);

      assert.deepEqual(actual, expected);
    });

  });

  describe('epsilon', () => {
    it('should not consume input, and return unmodified input', () => {
      const inputString = 'input text';

      const expected = createResult({ result: '', remainder: inputString });
      const actual = epsilon(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('succeed', () => {
    it('should not consume input, and return given value', () => {
      const givenValue = 'value';
      const inputString = 'input text';

      const expected = createResult({ result: givenValue, remainder: inputString });
      const actual = succeed(givenValue)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('fail', () => {
    it('should accept input, and return empty object', () => {
      const inputString = 'input text';

      const expected = {};
      const actual = fail(inputString);

      assert.deepEqual(actual, expected);
    });
  });
});