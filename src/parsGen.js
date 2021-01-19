import { concat, curry, foldr, fst, head, isEmpty, list, map, snd, tail, tuple } from './utils';
import { succeed, symbol, token } from './elementary-parsers';
import { apply, some, sp } from './parser-tranformers';
import { alternation, choice, listOf, many, seqKeepFirst, seqKeepSecond, sequence } from './parser-combinators';
import { constant } from './expression-parsers';
import { assoc, bnf } from './bnf-parser';
import { parsGram } from './gram-parser';

// Should return a parser for a language
const uncurriedParsGen = (nontp, termp, bnfstring, start, str) => {
  return some(
    apply(
      gram => parsGram(gram, start),
      bnf(nontp, termp),
      bnfstring
    ), str)
};

const parsGen = curry(uncurriedParsGen);

export{
  parsGen
}