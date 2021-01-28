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
  compulsion,
  compound,
  commaList,
  semicList,
  choice
} from '../src/parser-combinators';
import { fail, symbol, satisfy, token } from '../src/elementary-parsers';
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
  isDigit,
  string,
  concat,
  append,
  prepend
} from '../src/utils';
import { apply } from '../src/parser-tranformers';

const parseA = str => (head(str) === 'a') ? list(tuple(tail(str), 'a')) : list();

const parseSingleChar = str => list(tuple(tail(str), head(str)));

describe('Parser combinators', () => {
  describe('sequence', () => {
    it('should apply second parser to remainder of first', () => {
      const inputString = string("a token");

      const expected = list(
        tuple(string('token'), tuple('a', ' '))
      );
      const actual = sequence(parseSingleChar, parseSingleChar, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply two parsers in sequence', () => {
      const inputString = string('ab');

      const expected = list(
        tuple(string(''), tuple('a', 'b'))
      );
      const actual = sequence(parseSingleChar, parseSingleChar, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should work when the second parser returns multiple results', () => {
      const fakeParser = str => list(tuple(string(''), list(string('c'), string('c'))));
      const inputString = string('a');

      const expected = list(
        tuple(string(''), tuple('a', list(string('c'), string('c'))))
      );
      const actual = sequence(parseSingleChar, fakeParser, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should work when the first parser returns multiple results', () => {
      const fakeParser = str => list(tuple('a', list('c', 'c')));
      const inputString = string('a');

      const expected = list(tuple('', tuple(list('c', 'c'), 'a')));
      const actual = sequence(fakeParser, parseSingleChar, inputString);

      assert.deepEqual(actual, expected);
    });

  });

  describe('alternation', () => {
    it('should return all possible successes of choice between two parsers', () => {
      const parseOneItem = str => list(tuple(tail(str), take(1, str)));
      const parseTwoItems = str => list(tuple(drop(2, str), take(2, str)));

      const inputString = string('input');

      const expected = list(
        tuple(string('nput'), string('i')),
        tuple(string('put'), string('in'))
      );
      const actual = alternation(parseOneItem, parseTwoItems, inputString);

      assert.deepEqual(actual, expected);
    });

    // This is a test that should be run if the implementation of failing is changed
    
    it('given parsers where only one succeeds, should return both results', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));
      const failingParser = str => list(tuple(str, ''));

      const inputString = string('input');

      const expected = list(
        tuple(string('nput'), 'i'),
        tuple(string('input'), '')
      );
      const actual = alternation(parseOneItem, failingParser, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should only return success of first parser if second parser fails', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));

      const inputString = string('input');

      const expected = list(
        tuple(string('nput'), 'i')
      );
      const actual = alternation(parseOneItem, fail, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return empty list given parser that return empty', () => {
      const testParser = (str) => list();

      const expected = list();
      const actual = alternation(testParser, testParser, '');

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepFirst', () => {
    it('should apply two parsers in sequence, but return only the result of the first', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));

      const expected = list(tuple(string(''), 'a'));
      const actual = seqKeepFirst(parseOneItem, parseOneItem, string('ab'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('seqKeepSecond', () => {
    it('should apply two parsers in sequence, but return only the result of the second', () => {
      const parseOneItem = str => list(tuple(tail(str), head(str)));

      const expected = list(tuple(string(''), 'b'));
      const actual = seqKeepSecond(parseOneItem, parseOneItem, string('ab'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('many', () => {
    it('should apply a given parser multiple times if successful', () => {
      const inputString = string('aaab');

      const expected = list(
        tuple(string('b'), string('aaa')),
        tuple(string('ab'), string('aa')),
        tuple(string('aab'), string('a')),
        tuple(string('aaab'), string(''))
      );
      const actual = many(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should not apply a given parser if it fails the first time', () => {
      const inputString = string('baa');

      const expected = list(
        tuple(string('baa'), [])
      );
      const actual = many(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply a given parser multiple times until it fails', () => {
      const inputString = string('abaa');

      const expected = list(
        tuple(string('baa'), string('a')),
        tuple(string('abaa'), string(''))
      );
      const actual = many(parseA, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('many1', () => {
    it('should apply a given parser multiple times if successful', () => {
      const inputString = string('aaab');

      const expected = list(
        tuple(string('b'), string('aaa')),
        tuple(string('ab'), string('aa')),
        tuple(string('aab'), string('a'))
      );
      const actual = many1(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return empty list if it fails the first time', () => {
      const inputString = string('baa');

      const expected = list();
      const actual = many1(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should apply a given parser multiple times until it fails', () => {
      const inputString = string('abaa');

      const expected = list(
        tuple(string('baa'), string('a'))
      );
      const actual = many1(parseA, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('choice', () => {
    it('should iterate the alternation parser', () => {
      const expected = list(
        tuple(string('bc'), string('a')),
        tuple(string('c'), string('ab')),
        tuple(string(''), string('abc'))
      );

      const parserlist = list(
        token(string('a')),
        token(string('ab')),
        token(string('abc'))
      );

      const actual = choice(parserlist)(string('abc'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('option', () => {
    
    it('should return an empty result if parser was not recognised', () => {
      const inputString = string('baa');

      const expected = list(
        tuple(string('baa'), string(''))
      );
      const actual = option(parseA, inputString);

      assert.deepEqual(actual, expected);
    });

    it('should return a list with a single resulting element if parser was recognised', () => {
      const inputString = string('abaa');

      const expected = list(
        tuple(string('baa'), string('a')),
        tuple(string('abaa'), string(''))
      );
      const actual = option(parseA, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('pack', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = string('{pack}');
      
      const expected = list(
        tuple(string(''), string('pack'))
      );
      const actual = pack(symbol('{'), parseToken(string('pack')), symbol('}'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = string('{pack} remainder');
      
      const expected = list(
        tuple(string(' remainder'), string('pack'))
      );
      const actual = pack(symbol('{'), parseToken(string('pack')))(symbol('}'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('parenthesized', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it ('should not parse a section if missing start delimiter', () => {
      const inputString = string('pack)');

      const expected = list();
      const actual = parenthesized(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    })

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = string('(pack)');

      const expected = list(
        tuple(string(''), string('pack'))
      );
      const actual = parenthesized(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = string('(pack) remainder');

      const expected = list(
        tuple(string(' remainder'), string('pack'))
      );
      const actual = parenthesized(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('parenthesized', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it ('should not parse a section if missing start delimiter', () => {
      const inputString = string('pack)');

      const expected = list();
      const actual = parenthesized(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    })

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = string('(pack)');

      const expected = list(tuple(string(''), string('pack')));
      const actual = parenthesized(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = string('(pack) remainder');

      const expected = list(
        tuple(string(' remainder'), string('pack'))
      );
      const actual = parenthesized(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('bracketed', () => {
    const parseToken = token => str => list(tuple(drop(token.length, str), take(token.length, str)));

    it ('should not parse a section if missing start delimiter', () => {
      const inputString = string('pack]');

      const expected = list();
      const actual = bracketed(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    })

    it('should parse a section that is between a start and end delimiter', () => {
      const inputString = string('[pack]');

      const expected = list(
        tuple(string(''), string('pack'))
      );
      const actual = bracketed(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a section that is between a start and end delimiter, and return remainder', () => {
      const inputString = string('[pack] remainder');

      const expected = list(
        tuple(string(' remainder'), string('pack'))
      );
      const actual = bracketed(parseToken(string('pack')), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('listOf', () => {
    it('should parse an empty list', () => {
      const inputString = string('post list');

      const expected = list(
        tuple(string('post list'), list())
      );
      const actual = listOf(symbol('a'), symbol(','), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a non-empty list given parser for the items', () => {
      const inputString = string('a,a,a,post list');

      const expected = list(
        tuple(string(',post list'), list('a','a','a')),
        tuple(string(',a,post list'), list('a','a')),
        tuple(string(',a,a,post list'), list('a')),
        tuple(string('a,a,a,post list'), list())
      );
      const actual = listOf(symbol('a'), symbol(','), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('commaList', () => {
    it('should parse an empty list', () => {
      const inputString = string('post list');

      const expected = list(
        tuple(string('post list'), list())
      );
      const actual = commaList(symbol('a'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a non-empty list given parser for the items', () => {
      const inputString = string('a,a,a,post list');

      const expected = list(
        tuple(string(',post list'), list('a','a','a')),
        tuple(string(',a,post list'), list('a','a')),
        tuple(string(',a,a,post list'), list('a')),
        tuple(string('a,a,a,post list'), list())
      );
      const actual = commaList(symbol('a'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('semicList', () => {
    it('should parse an empty list', () => {
      const inputString = string('post list');

      const expected = list(
        tuple(string('post list'), list())
      );
      const actual = semicList(symbol('a'), inputString);

      assert.deepEqual(actual, expected);
    });

    it('should parse a non-empty list given parser for the items', () => {
      const inputString = string('a;a;a;post list');

      const expected = list(
        tuple(string(';post list'), list('a','a','a')),
        tuple(string(';a;post list'), list('a','a')),
        tuple(string(';a;a;post list'), list('a')),
        tuple(string('a;a;a;post list'), list())
      );
      const actual = semicList(symbol('a'), inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('chainLeft', () => {
    it('should apply parser for item and separator from left to right', () => {
      const inputString = string('1+2+3 rest');

      const operation = (e1, e2) =>  concat(append('+', prepend('(', e1)), append(')', e2));
      const separatorParser = str => list(tuple(drop(1, str), operation));

      // The parser for the separator should return a function that combines parse trees
      // So it should define an operation and not a token
      const expected = list(
        tuple(string(' rest'), string('((1+2)+3)')),
        tuple(string('+3 rest'), string('(1+2)')),
        tuple(string('+2+3 rest'), string('1'))
      );
      const actual = chainLeft(apply(c => list(c), satisfy(isDigit)), separatorParser, inputString);

      assert.deepEqual(actual, expected);
    });
  });

  describe('chainRight', () => {
    it('should apply parser for item and separator from right to left', () => {
      const inputString = string('1+2+3 rest');

      const operation = (e1, e2) =>  concat(append('+', prepend('(', e1)), append(')', e2));
      const separatorParser = str => list(tuple(drop(1, str), operation));

      // The parser for the separator should return a function that combines parse trees
      // So it should define an operation and not a token
      const expected = list(
        tuple(string(' rest'), string('(2+(3+1))')),
        tuple(string('+3 rest'), string('(2+1)')),
        tuple(string('+2+3 rest'), string('1'))
      );
      const actual = chainRight(apply(c => list(c), satisfy(isDigit)), separatorParser, inputString);
      // digit as parser
      assert.deepEqual(actual, expected);
    });
  });

  describe('greedy', () => {
    it('should return empty result if parser always fails', () => {
      const expected = list(
        tuple(string('b'), [])
      );
      const actual = greedy(symbol('a'), string('b'));

      assert.deepEqual(actual, expected);
    });

    it('should return the result containing all the results of the given parser', () => {
      const expected = list(
        tuple(string('b'), string('aaa'))
      );
      const actual = greedy(symbol('a'), string('aaab'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('greedy1', () => {
    it('should return empty list if parser fails first time', () => {
      const expected = list();
      const actual = greedy1(symbol('a'), string('b'));

      assert.deepEqual(actual, expected);
    });

    it('should return the result containing all the results of the given parser', () => {
      const expected = list(
        tuple(string('b'), string('aaa'))
      );
      const actual = greedy1(symbol('a'), string('aaab'));

      assert.deepEqual(actual, expected);
    });
  });

  describe('compulsion', () => {
    it('should not fail if the construct is not present', () => {
      const expected = list(
        tuple(string('string'), string(''))
      );
      const actual = compulsion(symbol('a'), string('string'));

      assert.deepEqual(actual, expected);
    });

    it('should accept the construct if it is present', () => {
      const expected = list(
        tuple(string('string'), string('a'))
      );
      const actual = compulsion(symbol('a'), string('astring'));

      assert.deepEqual(actual, expected);
    });
  });

});