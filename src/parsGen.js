import { concat, curry, foldr, fst, head, isEmpty, list, map, snd, string, tail, tuple } from '@soenderby/functional-utils';
import { succeed, symbol, token } from './elementary-parsers';
import { apply, some, sp } from './parser-tranformers';
import { alternation, choice, listOf, many, seqKeepFirst, seqKeepSecond, sequence } from './parser-combinators';
import { constant } from './expression-parsers';
import { assoc, bnf } from './bnf-parser';
import { parsGram } from './gram-parser';

// Should return a parser for a language
// The parser given to the inner some parser accepts a string parameter that is not used,
// This is due to the fact that the just parser needs a string parameter, and passes 
// this parameter to the parser, so it expects the parser to accept a string
const uncurriedParsGen = (nontp, termp, bnfstring, start, str) => {
  return some(some(str => apply(
      gram => parsGram(gram, start),
      bnf(nontp, termp),
      string(bnfstring)
    ), ''))(str)
};

const parsGen = curry(uncurriedParsGen);

export{
  parsGen
}