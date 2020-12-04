import { assert } from 'chai';
import { removeLeadingWhitespace, just, apply, some } from '../src/parser-tranformers';

// factory for creating the parser result object
// used to ensure consistent output format
// This is a copy of the factory used in the production code
// It is meant to minimize the neccessary amount of refacoring
const createResult = ({ result = '', remainder = '' } = {}) => 
  Array.isArray(result) ? 
    { fst: result, snd: remainder }
  :
    { fst: result, snd: remainder };

describe('Parser transformers', () => {
  describe('removeLeadingWhitespace', () => {
    it('should make a parser ignore leading whitespace', () => {
      const parseOneItem = string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) });
      const inputString = '   \n a';

      const expected = createResult({ result: 'a', remainder: '' });
      const actual = removeLeadingWhitespace(parseOneItem)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should leave trailing whitespace', () => {
      const parseOneItem = string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) });
      const inputString = '   \n ab   ';

      const expected = createResult({ result: 'a', remainder: 'b   ' });
      const actual = removeLeadingWhitespace(parseOneItem)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('just', () => {
    it('should only return results of given parser with empty remainder', () => {
      // fake parser, ignores parameter
      const parser = string => [ 
        createResult({ result: 'result1', remainder: 'not empty' }),
        createResult({ result: 'result2', remainder: '' }),
        createResult({ result: 'result3', remainder: 'also not empty' })
      ];

      const expected = [ 
        createResult({ result: 'result2', remainder: '' })
      ];
      const actual = just(parser)('string');

      assert.deepEqual(actual, expected);
    });
  });

  describe('apply', () => {
    // This is a test where only the sub element result is passed to the given function
    /*
    it('should apply given function to the result', () => {
      const parser = string => createResult({ result: 'result', remainder: '' });
      const givenFunction = string => string.toUpperCase();

      const expected = createResult({ result: 'RESULT', remainder: '' });
      const actual = apply(givenFunction)(parser)('string');

      assert.deepEqual(actual, expected);
    });
    */

   it('should apply given function to the result', () => {
    const parser = string => createResult({ result: 'result', remainder: '' });
    const givenFunction = result => createResult({ result: result.fst.toUpperCase(), remainder: result.snd});

    const expected = createResult({ result: 'RESULT', remainder: '' });
    const actual = apply(givenFunction)(parser)('string');

    assert.deepEqual(actual, expected);
  });
  });

  describe('some', () => {
    it('should return parser that only returns result, and no remainder', () => {
      const parser = string => createResult({ result: 'result', remainder: '' });

      const expected = 'result';
      const actual = some(parser)('string');

      assert.deepEqual(actual, expected);
    });
  });
});