import { assert } from 'chai';
import { sequence, alternation, seqKeepFirst, seqKeepSecond, many, option, block, listOf, chainLeft, chainRight } from '../src/parser-combinators';
import { tuple, parser} from '../src/utils';
import { fail } from '../src/elementary-parsers';

// factory for creating the parser result object
// used to ensure consistent output format
// This is a copy of the factory used in the production code
// It is meant to minimize the neccessary amount of refacoring
const createResult = ({ result = '', remainder = '' } = {}) => 
  Array.isArray(result) ? 
    { fst: result, snd: remainder }
  :
    { fst: result, snd: remainder };

const parseA = string => string.charAt(0) === 'a' ?
  createResult({
      result: string.slice(0, 1),
      remainder: string.slice(1)
    })
  :
  createResult({ result: '', remainder: string });

const symbol = symbol => string => string.charAt(0) === symbol ?
  createResult({
      result: string.slice(0, 1),
      remainder: string.slice(1)
    })
  :
  createResult({ result: '', remainder: string });

describe('Parser combinators', () => {
  describe('sequence', () => {
    it('should apply second parser to remainder of first', () => {
      // parses a single arbitrary character
      const simple = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));
      const inputString = "a token";

      const expected = [createResult({ result: tuple('a', ' '), remainder: 'token'})];
      const actual = [...sequence(simple)(simple)(inputString)];

      assert.deepEqual(actual, expected);
    });

    it('should apply two parsers in sequence', () => {
      const parseOneItem = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));

      const inputString = 'ab';

      const expected = [createResult({ result: tuple('a', 'b'), remainder: ''})];
      const actual = [...sequence(parseOneItem)(parseOneItem)(inputString)];

      assert.deepEqual(actual, expected);
    });

    it('should work when the parsers return array as result', () => {
      const parseOneItem = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));
      const fakeParser = parser(string => createResult({ result: ['c', 'c'], remainder: '' }));
      const inputString = 'a';

      const expected = [createResult({ result: tuple('a', ['c', 'c']), remainder: ''})];
      const actual = [...sequence(parseOneItem)(fakeParser)(inputString)];

      assert.deepEqual(actual, expected);
    });
  });

  describe('alternation', () => {
    it('should return all possible successes of choice between two parsers', () => {
      const parseOneItem = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));
      const parseTwoItems = parser(string => createResult({ result: string.slice(0, 2), remainder: string.slice(2) }));

      const inputString = 'input';

      const expected = [
        createResult({ result: 'i', remainder: 'nput'}),
        createResult({ result: 'in', remainder: 'put'})
      ];

      const actual = [...alternation(parseOneItem, parseTwoItems)(inputString)];

      assert.deepEqual(actual, expected);
    });

    // This is a test that should be run if the implementation of failing is changed
    
    it('given parsers where only one succeeds, should both results', () => {
      const parseOneItem = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));
      const failingParser = parser(string => createResult({ result: '', remainder: string }));

      const inputString = 'input';

      const expected = [ 
        createResult({ result: 'i', remainder: 'nput'}),
        createResult({ result: '', remainder: 'input' })
      ];

      const actual = [...alternation(parseOneItem)(failingParser)(inputString)];

      assert.deepEqual(actual, expected);
    });

    it('should not add undefined elements to the result', () => {
      const parseOneItem = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));
      const failingParser = fail;

      const inputString = 'input';

      const expected = [ 
        createResult({ result: 'i', remainder: 'nput'})
      ];

      const actual = [...alternation(parseOneItem)(failingParser)(inputString)];

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepFirst', () => {
    it('should apply two parsers in sequence, but return only the result of the first', () => {
      const parseOneItem = parser(string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) }));

      const inputString = 'ab';

      const expected = [createResult({ result: 'a', remainder: '' })];
      const actual = [...seqKeepFirst(parseOneItem)(parseOneItem)(inputString)];

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepSecond', () => {
    it('should apply two parsers in sequence, but return only the result of the second', () => {
      const parseOneItem = string => createResult({ result: string.slice(0, 1), remainder: string.slice(1) });

      const inputString = 'ab';

      const expected = createResult({ result: 'b', remainder: '' });
      const actual = seqKeepSecond(parseOneItem)(parseOneItem)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('many', () => {
    it('should apply a given parser multiple times if successful', () => {
      const inputString = 'aaab';

      const expected = createResult({ result: ['a', 'a', 'a'], remainder: 'b' });
      const actual = many(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply a given parser if it fails the first time', () => {
      const inputString = 'baa';

      const expected = createResult({ result: [], remainder: 'baa' });
      const actual = many(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply a given parser multiple times until it fails', () => {
      const inputString = 'abaa';

      const expected = createResult({ result: ['a'], remainder: 'baa' });
      const actual = many(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('option', () => {
    
    it('should return an empty result if parser was not recognised', () => {
      const inputString = 'baa';

      const expected = [createResult({ result: '', remainder: 'baa' })];
      const actual = option(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return a list with a single resulting element if parser was recognised', () => {
      const inputString = 'abaa';

      const expected = [createResult({ result: 'a', remainder: 'baa' })];
      const actual = option(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });
    
  });

  describe('block', () => {
    const parseToken = token => string => createResult({result: string.slice(0, token.length), remainder: string.slice(token.length)});

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = '{block}';
      
      const expected = createResult({result: 'block', remainder: ''});
      const actual = block(symbol('{'))(parseToken('block'))(symbol('}'))(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = '{block} remainder';
      
      const expected = createResult({result: 'block', remainder: ' remainder'});
      const actual = block(symbol('{'))(parseToken('block'))(symbol('}'))(inputString);

      assert.deepEqual(actual, expected);
    });

    // There should be a test that it fails correctly. Once I implement failing that is.
  });

  describe('listOf', () => {
    const symbol = symbol => string => string.charAt(0) === symbol ?
    createResult({
        result: string.slice(0, 1),
        remainder: string.slice(1)
      })
    :
    createResult({ result: '', remainder: string });

    it('should parse an empty list', () => {
      const inputString = 'post list';

      const expected = createResult({result: [''], remainder: 'post list'});
      const actual = listOf(symbol('a'))(symbol(','))(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a non-empty list given parser for the items', () => {
      const inputString = 'a,a,apost list';

      const expected = createResult({result: ['a', 'a', 'a'], remainder: 'post list'});
      const actual = listOf(symbol('a'))(symbol(','))(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('chainLeft', () => {
    it('should apply parser for item and separator from left to right', () => {
      const inputString = '1+1+1 rest';

      const separatorParser = string => {
        return createResult({ result: (elementOne => elementTwo => '(' + elementOne + '+' + elementTwo + ')'), remainder: string.slice(1) });
      } 
      // The parser for the separator should return a function that combines parse trees
      // So it should define an operation and not a token
      const expected = createResult({result: '(((1+1)+1)+1)', remainder: ' rest'});
      const actual = chainLeft(symbol('1'))(separatorParser)(inputString);

      assert.deepEqual(actual, expected);
    });
  });
});