import { assert } from 'chai';
import { removeLeadingWhitespace, just, apply, some } from '../src/parser-tranformers';
import { tuple, list } from '../src/utils';

describe('Parser transformers', () => {
  describe('removeLeadingWhitespace', () => {
    it('should make a parser ignore leading whitespace', () => {
      const parseOneItem = string => list(tuple(string.slice(1), string.slice(0, 1)));
      const inputString = '   \n a';

      const expected = list(tuple( '', 'a' ));
      const actual = removeLeadingWhitespace(parseOneItem, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should leave trailing whitespace', () => {
      const parseOneItem = string => list(tuple( string.slice(1), string.slice(0, 1) ));
      const inputString = '   \n ab   ';

      const expected = list(tuple( 'b   ', 'a' ));
      const actual = removeLeadingWhitespace(parseOneItem, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('just', () => {
    it('should only return results of given parser with empty remainder', () => {
      // fake parser, ignores parameter
      const parser = string => list( 
        tuple( 'b   ', 'a' ),
        tuple( '', 'result2' ),
        tuple( 'also not empty', 'result3' )
      );

      const expected = list(tuple( '', 'result2' ));
      const actual = just(parser, 'string');

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
    const parser = string => list(tuple( '', 'result' ));
    const givenFunction = parseTree => parseTree.toUpperCase();

    const expected = list(tuple( '', 'RESULT' ));
    const actual = apply(givenFunction, parser, 'string');

    assert.deepEqual(actual, expected);
  });
  });

  describe('some', () => {
    it('should return parser that only returns result, and no remainder', () => {
      const parser = string => list(tuple('' , 'result'));

      const expected = 'result';
      const actual = some(parser, 'string');

      assert.deepEqual(actual, expected);
    });

    it('should return parser that only returns first result with no remainder', () => {
      const parser = string => list(
          tuple('remainder', 'result1'),
          tuple('', 'result2'),
          tuple('', 'result3')
        );

      const expected = 'result2';
      const actual = some(parser, 'string');

      assert.deepEqual(actual, expected);
    });
  });
});