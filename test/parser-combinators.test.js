import { assert } from 'chai';
import {
  sequence,
  alternation,
  seqKeepFirst,
  seqKeepSecond,
  many,
  many1,
  option,
  pack,
  listOf,
  chainLeft,
  chainRight,
  parenthesized,
  bracketed,
  greedy,
  greedy1,
  compulsion
} from '../src/parser-combinators';
import { fail, symbol, satisfy } from '../src/elementary-parsers';
import {
  tuple,
  piecewise,
  head,
  tail,
  isEmpty,
  isNonEmpty,
  otherwise,
  list,
  emptyList,
  take,
  drop,
  curry,
  isDigit
} from '../src/utils';
import { digit } from '../src/expression-parsers';

const parseA = str => (head(str) === 'a') ? list(tuple(tail(str), 'a')) : list();

const parseSingleChar = str => list(tuple(tail(str), head(str)));

describe('Parser combinators', () => {
  describe('sequence', () => {
    it('should apply second parser to remainder of first', () => {
      const inputString = "a token";

      const expected = list(tuple('token', tuple('a', ' ')));
      const actual = sequence(parseSingleChar, parseSingleChar, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply two parsers in sequence', () => {
      const inputString = 'ab';

      const expected = list(tuple('', tuple('a', 'b')));
      const actual = sequence(parseSingleChar, parseSingleChar, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should work when the second parser returns multiple results', () => {
      const fakeParser = str => list(tuple('', list('c', 'c')));
      const inputString = 'a';

      const expected = list(tuple('', tuple('a', list('c', 'c'))));
      const actual = sequence(parseSingleChar, fakeParser, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should work when the first parser returns multiple results', () => {
      const fakeParser = str => list(tuple('a', list('c', 'c')));
      const inputString = 'a';

      const expected = list(tuple('', tuple(list('c', 'c'), 'a')));
      const actual = sequence(fakeParser, parseSingleChar, inputString);

      assert.deepEqual(actual, expected);
    });

  });

  describe('alternation', () => {
    it('should return all possible successes of choice between two parsers', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));
      const parseTwoItems = str => list(tuple(drop(2, str), take(2, str)));

      const inputString = 'input';

      const expected = list(
        tuple('nput', 'i'),
        tuple('put', 'in')
      );
      const actual = alternation(parseOneItem, parseTwoItems, inputString);

      assert.deepEqual(actual, expected);
    });

    // This is a test that should be run if the implementation of failing is changed
    
    it('given parsers where only one succeeds, should both results', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));
      const failingParser = str => list(tuple(str, '' ));

      const inputString = 'input';

      const expected = list(
        tuple('nput', 'i'),
        tuple('input', '')
      );
      const actual = alternation(parseOneItem, failingParser, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should only return success of first parser if second parser fails', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));

      const inputString = 'input';

      const expected = list(
        tuple('nput', 'i')
      );
      const actual = alternation(parseOneItem, fail, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepFirst', () => {
    it('should apply two parsers in sequence, but return only the result of the first', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));

      const expected = list(tuple('', 'a'));
      const actual = seqKeepFirst(parseOneItem, parseOneItem, 'ab');

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepSecond', () => {
    it('should apply two parsers in sequence, but return only the result of the second', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));

      const expected = list(tuple('', 'b'));
      const actual = seqKeepSecond(parseOneItem, parseOneItem, 'ab');

      assert.deepEqual(actual, expected);
    });
  });

  describe('many', () => {
    it('should apply a given parser multiple times if successful', () => {
      const inputString = 'aaab';

      const expected = list(tuple('b', 'aaa'), tuple('ab', 'aa'), tuple('aab', 'a'), tuple('aaab', ''));
      const actual = many(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply a given parser if it fails the first time', () => {
      const inputString = 'baa';

      const expected = list(tuple('baa', ''));
      const actual = many(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply a given parser multiple times until it fails', () => {
      const inputString = 'abaa';

      const expected = list(tuple('baa', 'a'), tuple('abaa', ''));
      const actual = many(parseA, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('many1', () => {
    it('should apply a given parser multiple times if successful', () => {
      const inputString = 'aaab';

      const expected = list(tuple('b', 'aaa'), tuple('ab', 'aa'), tuple('aab', 'a'));
      const actual = many1(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return empty list if it fails the first time', () => {
      const inputString = 'baa';

      const expected = list();
      const actual = many1(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply a given parser multiple times until it fails', () => {
      const inputString = 'abaa';

      const expected = list(tuple('baa', 'a'));
      const actual = many1(parseA, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('option', () => {
    
    it('should return an empty result if parser was not recognised', () => {
      const inputString = 'baa';

      const expected = list(tuple('baa', ''));
      const actual = option(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return a list with a single resulting element if parser was recognised', () => {
      const inputString = 'abaa';

      const expected = list(tuple('baa', 'a'), tuple('abaa', ''));
      const actual = option(parseA, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('pack', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = '{pack}';
      
      const expected = list(tuple( '', 'pack' ));
      const actual = pack(symbol('{'), parseToken('pack'), symbol('}'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = '{pack} remainder';
      
      const expected = list(tuple( ' remainder', 'pack' ));
      const actual = pack(symbol('{'), parseToken('pack'))(symbol('}'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('parenthesized', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it ('should not parse a section if missing start delimiter', () => {
      const inputString = 'pack)';

      const expected = list();
      const actual = parenthesized(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    })

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = '(pack)';

      const expected = list(tuple( '', 'pack' ));
      const actual = parenthesized(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = '(pack) remainder';

      const expected = list(tuple( ' remainder', 'pack' ));
      const actual = parenthesized(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('parenthesized', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it ('should not parse a section if missing start delimiter', () => {
      const inputString = 'pack)';

      const expected = list();
      const actual = parenthesized(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    })

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = '(pack)';

      const expected = list(tuple( '', 'pack' ));
      const actual = parenthesized(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = '(pack) remainder';

      const expected = list(tuple( ' remainder', 'pack' ));
      const actual = parenthesized(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('bracketed', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it ('should not parse a section if missing start delimiter', () => {
      const inputString = 'pack]';

      const expected = list();
      const actual = bracketed(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    })

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = '[pack]';

      const expected = list(tuple( '', 'pack' ));
      const actual = bracketed(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = '[pack] remainder';

      const expected = list(tuple( ' remainder', 'pack' ));
      const actual = bracketed(parseToken('pack'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('listOf', () => {
    it('should parse an empty list', () => {
      const inputString = 'post list';

      const expected = list(tuple('post list', ''));
      const actual = listOf(symbol('a'), symbol(','), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a non-empty list given parser for the items', () => {
      const inputString = 'a,a,a,post list';

      const expected = list(
        tuple(',post list', 'aaa'),
        tuple(',a,post list', 'aa'),
        tuple(',a,a,post list', 'a'),
        tuple('a,a,a,post list', '')
      );
      const actual = listOf(symbol('a'), symbol(','), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('chainLeft', () => {
    it('should apply parser for item and separator from left to right', () => {
      const inputString = '1+2+3 rest';

      const separatorParser = str => list(tuple(drop(1, str), (e1, e2) => `(${e1}+${e2})`));

      // The parser for the separator should return a function that combines parse trees
      // So it should define an operation and not a token
      const expected = list(
        tuple(' rest', '((1+2)+3)'),
        tuple('+3 rest', '(1+2)'),
        tuple('+2+3 rest', '1')
      );
      const actual = chainLeft(satisfy(isDigit), separatorParser, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('chainRight', () => {
    it('should apply parser for item and separator from right to left', () => {
      const inputString = '1+2+3 rest';

      const separatorParser = str => list(tuple(drop(1, str), (e1, e2) => `(${e1}+${e2})`));

      // The parser for the separator should return a function that combines parse trees
      // So it should define an operation and not a token
      const expected = list(
        tuple(' rest', '(2+(3+1))'),
        tuple('+3 rest', '(2+1)'),
        tuple('+2+3 rest', '1')
      );
      const actual = chainRight(satisfy(isDigit), separatorParser, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('greedy', () => {
    it('should return empty result if parser always fails', () => {
      const expected = list(tuple('b', ''));
      const actual = greedy(symbol('a'), 'b');

      assert.deepEqual(actual, expected);
    });

    it('should return the result containing all the results of the given parser', () => {
      const expected = list(tuple('b', 'aaa'));
      const actual = greedy(symbol('a'), 'aaab');

      assert.deepEqual(actual, expected);
    });
  });

  describe('greedy1', () => {
    it('should return empty list if parser fails first time', () => {
      const expected = list();
      const actual = greedy1(symbol('a'), 'b');

      assert.deepEqual(actual, expected);
    });

    it('should return the result containing all the results of the given parser', () => {
      const expected = list(tuple('b', 'aaa'));
      const actual = greedy1(symbol('a'), 'aaab');

      assert.deepEqual(actual, expected);
    });
  });

  describe('compulsion', () => {
    it('should not fail if the construct is not present', () => {
      const expected = list(tuple('string', ''));
      const actual = compulsion(symbol('a'), 'string');

      assert.deepEqual(actual, expected);
    });

    it('should accept the construct if it is present', () => {
      const expected = list(tuple('string', 'a'));
      const actual = compulsion(symbol('a'), 'astring');

      assert.deepEqual(actual, expected);
    });
  });

});