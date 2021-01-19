import { concat, curry, foldr, fst, head, isEmpty, list, map, snd, tail, tuple } from './utils';
import { succeed, symbol, token } from './elementary-parsers';
import { apply, sp } from './parser-tranformers';
import { alternation, choice, listOf, many, seqKeepFirst, seqKeepSecond, sequence } from './parser-combinators';
import { constant } from './expression-parsers';
import { assoc } from './bnf-parser';

const uncurriedNode = (symbol, tree) => {
  return {
    symbol: symbol,
    tree: tree
  }
};

const node = curry(uncurriedNode);

const isTerminalNode = (elem) => {
  return isEmpty(elem.tree) ? true : false;
};

const uncurriedConcatSequence = (p1, p2, str) => {
  return apply(
    t => concat(list(fst(t)), snd(t)),
    sequence(p1, p2),
    str
  )
};

const concatSequence = curry(uncurriedConcatSequence);

const uncurriedListSequence = (parsers) => {
  return foldr(
    concatSequence,
    succeed(list()),
    parsers
  )
};

const listSequence = curry(uncurriedListSequence);

// Expects either a terminal or a nonterminal symbol
const uncurriedParsSym = (gram, sym, symbols) => {
  const sptoken = t => sp(token(t));
  const s = sym.value;

  if(sym.type === 'terminal') {
    // Possible this should use token instead of symbol
    return apply(node(s), apply(x => list(), sptoken(s)), symbols);
  }

  if(sym.type === 'nonterminal') {
    return apply(node(s), parsRhs(gram, assoc(gram, sym)), symbols);
  }
};

const parsSym = curry(uncurriedParsSym);

// Expects a list of symbols
// Should return a parser for an alternative
const uncurriedParsAlt = (gram, alt) => {
  return listSequence(map(sym => parsSym(gram, sym), alt));
};

const parsAlt = curry(uncurriedParsAlt);

// Expects a list of alternatives
const uncurriedParsRhs = (gram, rhs) => choice(map( alt => parsAlt(gram, alt), rhs));

const parsRhs = curry(uncurriedParsRhs)

const uncurriedParsGram = (gram, start, symbols) => {
  return parsSym(gram, start, symbols);
};

const parsGram = curry(uncurriedParsGram);

export {
  node,
  parsSym,
  parsAlt,
  parsRhs,
  parsGram,
  listSequence,
  concatSequence
}