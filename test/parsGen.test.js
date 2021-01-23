import { assert } from 'chai';
import { Nont } from '../src/bnf-parser';
import { satisfy } from '../src/elementary-parsers';
import { greedy1 } from '../src/parser-combinators';
import { parsGen } from '../src/parsGen';
import { list } from '../src/utils';

/*
describe('parsGen', () => {
  it('should generate a parser for a given CFG', () => {
    const blockGram = "BLOCK ::= begin BLOCK end BLOCK | .";
    const nontp = str => greedy1(satisfy(x => /[A-Z]+/.test(x)), str);
    const termp = str => greedy1(satisfy(x => /[a-z]+/.test(x)), str);

    const expected = list();
    const actual = parsGen(nontp, termp, blockGram, Nont('BLOCK'), '');

    assert.deepEqual(actual, expected);
  });
});
*/