import { assert } from 'chai';
import { sequence, alternation, seqKeepFirst, seqKeepSecond, many, option, block, listOf, chainLeft, chainRight } from '../src/parser-combinators';
import { tuple, parser} from '../src/utils';
import { fail } from '../src/elementary-parsers';

const parseA = string => string.charAt(0) === 'a' ?
  tuple(
       string.slice(0, 1),
       string.slice(1)
    )
  :
  tuple( '', string );

const symbol = symbol => string => string.charAt(0) === symbol ?
  tuple(
       string.slice(0, 1),
       string.slice(1)
    )
  :
  tuple( '', string );

describe('Parser combinators', () => {
  describe('sequence', () => {
    it('should apply second parser to remainder of first', () => {
      // parses a single arbitrary character
      const simple = parser(string => tuple( string.slice(0, 1),  string.slice(1)));
      const inputString = "a token";

      const expected = [tuple( tuple('a', ' '), 'token')];
      const actual = [...sequence(simple)(simple)(inputString)];

      assert.deepEqual(actual, expected);
    });

    it('should apply two parsers in sequence', () => {
      const parseOneItem = parser(string => tuple( string.slice(0, 1), string.slice(1) ));

      const inputString = 'ab';

      const expected = [tuple( tuple('a', 'b'), '')];
      const actual = [...sequence(parseOneItem)(parseOneItem)(inputString)];

      assert.deepEqual(actual, expected);
    });

    it('should work when the parsers return array as result', () => {
      const parseOneItem = parser(string => tuple( string.slice(0, 1), string.slice(1) ));
      const fakeParser = parser(string => tuple( ['c', 'c'], '' ));
      const inputString = 'a';

      const expected = [tuple( tuple('a', ['c', 'c']), '')];
      const actual = [...sequence(parseOneItem)(fakeParser)(inputString)];

      assert.deepEqual(actual, expected);
    });
  });

  describe('alternation', () => {
    it('should return all possible successes of choice between two parsers', () => {
      const parseOneItem = parser(string => tuple( string.slice(0, 1), string.slice(1) ));
      const parseTwoItems = parser(string => tuple( string.slice(0, 2), string.slice(2) ));

      const inputString = 'input';

      const expected = [
        tuple( 'i', 'nput'),
        tuple( 'in', 'put')
      ];

      const actual = [...alternation(parseOneItem, parseTwoItems)(inputString)];

      assert.deepEqual(actual, expected);
    });

    // This is a test that should be run if the implementation of failing is changed
    
    it('given parsers where only one succeeds, should both results', () => {
      const parseOneItem = parser(string => tuple( string.slice(0, 1), string.slice(1) ));
      const failingParser = parser(string => tuple( '',  string ));

      const inputString = 'input';

      const expected = [ 
        tuple( 'i', 'nput'),
        tuple( '', 'input' )
      ];

      const actual = [...alternation(parseOneItem)(failingParser)(inputString)];

      assert.deepEqual(actual, expected);
    });

    it('should not add undefined elements to the result', () => {
      const parseOneItem = parser(string => tuple( string.slice(0, 1), string.slice(1) ));
      const failingParser = fail;

      const inputString = 'input';

      const expected = [ 
        tuple( 'i', 'nput' )
      ];

      const actual = [...alternation(parseOneItem)(failingParser)(inputString)];

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepFirst', () => {
    it('should apply two parsers in sequence, but return only the result of the first', () => {
      const parseOneItem = parser(string => tuple( string.slice(0, 1), string.slice(1) ));

      const inputString = 'ab';

      const expected = [tuple( 'a', '' )];
      const actual = [...seqKeepFirst(parseOneItem)(parseOneItem)(inputString)];

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepSecond', () => {
    it('should apply two parsers in sequence, but return only the result of the second', () => {
      const parseOneItem = string => tuple( string.slice(0, 1), string.slice(1) );

      const inputString = 'ab';

      const expected = tuple( 'b', '' );
      const actual = seqKeepSecond(parseOneItem)(parseOneItem)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('many', () => {
    it('should apply a given parser multiple times if successful', () => {
      const inputString = 'aaab';

      const expected = tuple( ['a', 'a', 'a'], 'b' );
      const actual = many(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply a given parser if it fails the first time', () => {
      const inputString = 'baa';

      const expected = tuple( [], 'baa' );
      const actual = many(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply a given parser multiple times until it fails', () => {
      const inputString = 'abaa';

      const expected = tuple( ['a'], 'baa' );
      const actual = many(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('option', () => {
    
    it('should return an empty result if parser was not recognised', () => {
      const inputString = 'baa';

      const expected = [tuple( '', 'baa' )];
      const actual = option(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return a list with a single resulting element if parser was recognised', () => {
      const inputString = 'abaa';

      const expected = [tuple( 'a', 'baa' )];
      const actual = option(parseA)(inputString);

      assert.deepEqual(actual, expected);
    });
    
  });

  describe('block', () => {
    const parseToken = token => string => tuple( string.slice(0, token.length),  string.slice(token.length));

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = '{block}';
      
      const expected = tuple( 'block', '');
      const actual = block(symbol('{'))(parseToken('block'))(symbol('}'))(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = '{block} remainder';
      
      const expected = tuple( 'block', ' remainder');
      const actual = block(symbol('{'))(parseToken('block'))(symbol('}'))(inputString);

      assert.deepEqual(actual, expected);
    });

    // There should be a test that it fails correctly. Once I implement failing that is.
  });

  describe('listOf', () => {
    it('should parse an empty list', () => {
      const inputString = 'post list';

      const expected = tuple( [''], 'post list');
      const actual = listOf(symbol('a'))(symbol(','))(inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a non-empty list given parser for the items', () => {
      const inputString = 'a,a,apost list';

      const expected = tuple( ['a', 'a', 'a'], 'post list');
      const actual = listOf(symbol('a'))(symbol(','))(inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('chainLeft', () => {
    it('should apply parser for item and separator from left to right', () => {
      const inputString = '1+1+1 rest';

      const separatorParser = string => {
        return tuple( (elementOne => elementTwo => '(' + elementOne + '+' + elementTwo + ')'), string.slice(1) );
      } 
      // The parser for the separator should return a function that combines parse trees
      // So it should define an operation and not a token
      const expected = tuple( '(((1+1)+1)+1)', ' rest');
      const actual = chainLeft(symbol('1'))(separatorParser)(inputString);

      assert.deepEqual(actual, expected);
    });
  });
});