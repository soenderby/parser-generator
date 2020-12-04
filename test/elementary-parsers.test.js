import { assert } from 'chai';
import { symbol, token, satisfy, epsilon, succeed, fail } from '../src/elementary-parsers';
import { tuple } from '../src/utils';

describe('Elementary parsers', () => {
  describe('symbol', () => {
    it('should parse a single char', () => {
      const charParameter = 'a';
      const inputString = "an input text";

      const expected = tuple( charParameter, 'n input text');
      const actual = symbol(charParameter)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse symbol, only if it is the first char in string', () => {
      const charParameter = 'a';
      const inputString = "input text with a";

      const expected = tuple( '', inputString );
      const actual = symbol(charParameter)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse anything if no matching symbol', () => {
      const charParameter = 'a';
      const inputString = "input text";

      const expected = tuple( '', inputString );
      const actual = symbol(charParameter)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('token', () => {
    it('should parse a given substring', () => {
      const tokenParameter = 'token';
      const inputString = "token and the rest";

      const expected = tuple( tokenParameter, ' and the rest' );
      const actual = token(tokenParameter)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not parse if matching token not at the beginning of inputstring', () => {
      const tokenParameter = 'token';
      const inputString = "nothing then token and the rest";

      const expected = tuple( '', inputString );
      const actual = token(tokenParameter)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('satisfy', () => {
    it('should apply parser if given function evaluates to true', () => {
      const identityParser = input => tuple( input, '');
      const predicateFunction = x => x === 'a';
      const inputString = 'a';

      const expected = tuple( inputString, '');
      const actual = satisfy(predicateFunction)(identityParser)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply parser if given function evaluates to false', () => {
      const identityParser = input => tuple( input, '');
      const predicateFunction = x => x === 'a';
      const inputString = 'b';

      const expected = tuple( '', 'b');
      const actual = satisfy(predicateFunction)(identityParser)(inputString);

      assert.deepEqual(actual, expected);
    });

  });

  describe('epsilon', () => {
    it('should not consume input, and return unmodified input', () => {
      const inputString = 'input text';

      const expected = tuple( '', inputString );
      const actual = epsilon(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('succeed', () => {
    it('should not consume input, and return given value', () => {
      const givenValue = 'value';
      const inputString = 'input text';

      const expected = tuple( givenValue, inputString );
      const actual = succeed(givenValue)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('fail', () => {
    it('should accept input, and generate nothing', () => {
      const inputString = 'input text';

      const expected = [];
      const actual = [...fail(inputString)];

      assert.deepEqual(actual, expected);
    });
  });
});