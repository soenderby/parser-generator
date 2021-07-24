import { assert } from 'chai';
import { Nont, Term } from '../src/bnf-parser';
import { satisfy } from '../src/elementary-parsers';
import { node } from '../src/gram-parser';
import { greedy1 } from '../src/parser-combinators';
import { parsGen } from '../src/parsGen';
import { list, string } from '@soenderby/functional-utils';

describe('parsGen', function() {
  this.timeout(10000)
  it('should generate a parser for a given CFG', () => {
    const blockGram = "BLOCK ::= begin BLOCK end BLOCK | .";
    const nontp = str => greedy1(satisfy(x => /[A-Z]+/.test(x)), str);
    const termp = str => greedy1(satisfy(x => /[a-z]+/.test(x)), str);

    const expected = node(Nont(string('BLOCK')), list(
      node(Term(string('begin')), list()),
      node(Nont(string('BLOCK')), list()),
      node(Term(string('end')), list()),
      node(Nont(string('BLOCK')), list(
        node(Term(string('begin')), list()),
        node(Nont(string('BLOCK')), list(
          node(Term(string('begin')), list()),
          node(Nont(string('BLOCK')), list()),
          node(Term(string('end')), list()),
          node(Nont(string('BLOCK')), list())
        )),
        node(Term(string('end')), list()),
        node(Nont(string('BLOCK')), list())
      ))
    ));

    const actual = parsGen(nontp, termp, blockGram, Nont(string('BLOCK')))(string('begin end begin begin end end'));

    assert.deepEqual(actual, expected);
  });
});