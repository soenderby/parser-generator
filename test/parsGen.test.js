import { assert } from 'chai';
import { Nont } from '../src/bnf-parser';
import { satisfy } from '../src/elementary-parsers';
import { node } from '../src/gram-parser';
import { greedy1 } from '../src/parser-combinators';
import { just, some } from '../src/parser-tranformers';
import { parsGen, workingParsGen } from '../src/parsGen';
import { head, list, snd } from '../src/utils';

describe('parsGen', function() {
  this.timeout(10000)
  it('should generate a parser for a given CFG', () => {
    const blockGram = "BLOCK ::= begin BLOCK end BLOCK | .";
    const nontp = str => greedy1(satisfy(x => /[A-Z]+/.test(x)), str);
    const termp = str => greedy1(satisfy(x => /[a-z]+/.test(x)), str);

    const expected = node('BLOCK', list(
      node('begin', list()),
      node('BLOCK', list()),
      node('end', list()),
      node('BLOCK', list(
        node('begin', list()),
        node('BLOCK', list(
          node('begin', list()),
          node('BLOCK', list()),
          node('end', list()),
          node('BLOCK', list())
        )),
        node('end', list()),
        node('BLOCK', list())
      ))
    ));

    const actual = parsGen(nontp, termp, blockGram, Nont('BLOCK'))('begin end begin begin end end');
    //const actual = some(some(parsGen(nontp, termp, blockGram, Nont('BLOCK')), ''))('begin end begin begin end end');

    assert.deepEqual(actual, expected);
  });
});