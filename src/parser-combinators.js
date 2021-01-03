import { epsilon, succeed, symbol } from './elementary-parsers';
import { apply } from './parser-tranformers';
import { curry, chain } from 'ramda';
import {
    tuple,
    map,
    head,
    fst,
    snd,
    list,
    concat,
    fmap,
    foldl,
    foldr,
    recursiveList,
    piecewise,
    isEmpty,
    otherwise,
    emptyList, isList,
    isString
} from './utils';

/**
 * Execute two parsers in sequence. The second is applied to the remainder of the first
 * @param {function(string): list} p1 - first parser
 * @param {function(string): list} p2 - second parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedSequence = (p1, p2, str) => {
  return fmap(
    t1 => {
      const xs1 = fst(t1);
      const v1 = snd(t1);

      return map(
        t2 => {
          const xs2 = fst(t2);
          const v2 = snd(t2);

          return tuple(xs2, tuple(v1, v2));
        },
        p2(xs1)
      );
    },
    p1(str)
  );
}
/** @see uncurriedSequence */
const sequence = curry(uncurriedSequence);

/**
 * Applies two parsers to the input string, and returns the possible results
 * @param {function(string): list} p1 - first parser
 * @param {function(string): list} p2 - second parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedAlternation = (p1, p2, str) => concat(p1(str), p2(str));
/** @see uncurriedAlternation */
const alternation = curry(uncurriedAlternation);

/**
 * Applies two parsers in sequence, but only keeps the result of first
 * @param {function(string): list} p1 - first parser
 * @param {function(string): list} p2 - second parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedSeqKeepFirst = (p1, p2, str) => {
  return map(
    t => tuple(fst(t), fst(snd(t))),
    sequence(p1, p2, str)
  );
}
/** @see uncurriedSeqKeepFirst */
const seqKeepFirst = curry(uncurriedSeqKeepFirst);

/**
 * Applies two parsers in sequence, but only keeps the result of second
 * @param {function(string): list} p1 - first parser
 * @param {function(string): list} p2 - second parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedSeqKeepSecond = (p1, p2, str) => {
  return map(
      e => tuple(fst(e), snd(snd(e))),
      sequence(p1, p2, str)
  );
}
/** @see uncurriedSeqKeepSecond */
const seqKeepSecond = curry(uncurriedSeqKeepSecond);

/**
 * Applies a parser again and again until it fails
 * @param {function(string): list} p - parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedMany = (p, str) => {
  return alternation(
    apply(t => concat(list(fst(t)), snd(t)), sequence(p, many(p))),
    succeed(emptyList(str)),
    str
  );
};
/** @see uncurriedMany */
const many = curry(uncurriedMany);

/**
 * Applies a parser again and again until it fails (expects at least one parse)
 * @param {function(string): list} p - parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedMany1 = (p, str) => {
  return apply(
    t => concat(list(fst(t)), snd(t)),
    sequence(p, many(p)),
    str
  );
};
/** @see uncurriedMany1 */
const many1 = curry(uncurriedMany1);

/**
 * Returns a list with zero or one element, depending on whether p is satisfied
 * @param {function(string): list} p - parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedOption = (p, str) => {
  return alternation(
    apply(x => list(x), p),
    succeed(emptyList(str)),
    str
  );
}
/** @see uncurriedOption */
const option = curry(uncurriedOption);

/**
 * Parses a pack of symbols, starting with delimiter, content and ending in a deliminator
 * @param {function(string): list} s1 - startDelimiter
 * @param {function(string):list} p - contentParser
 * @param {function(string): list} s2 endDelimiter
 * @param {string} str - input string string
 * @returns {list}
 */
const uncurriedPack = (s1, p, s2, str) => {
  return seqKeepFirst(
      seqKeepSecond(s1, p),
      s2,
      str
  );
}
/** @see uncurriedPack */
const pack = curry(uncurriedPack);

/**
 * Parses symbols between two (matching) parenthesis
 * @param {function(string): list} p - parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedParenthesized = (p, str) => pack(symbol('('), p, symbol(')'), str);
/** @see uncurriedParenthesized */
const parenthesized = curry(uncurriedParenthesized);

/**
 * Parses symbols between two (matching) brackets
 * @param {function(string): list} p - parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedBracketed = (p, str) => pack(symbol('['), p, symbol(']'), str);
/** @see uncurriedBracketed */
const bracketed = curry(uncurriedBracketed);

/**
 * Parses symbols between 'begin' and 'end'
 * @param {function(string): list} p - parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedCompound = (p, str) => pack(symbol('begin'), p, symbol('end'), str);
/** @see compound */
const compound = curry(uncurriedCompound);

/**
 * Parses a list of items
 * @param {function(string): list} p - item parser
 * @param {function(string): list} s - separator parser
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedListOf = (p, s, str) => {
  return alternation (
    apply(
      t => list(fst(t), snd(t)),
      sequence(p, many(seqKeepSecond(s, p)))
    ),
    succeed(emptyList(str)),
    str
  );
}
/** @see uncurriedListOf */
const listOf = curry(uncurriedListOf);

/**
 * [Unfinished]
 * SeparatorParser should be accept a string and return a function that combines parse trees
 * according to the operation it describes
 * 
 * Parses list of items applies operation, defined by the separator, from left to right
 * @param {function(string): list} p - item parser
 * @param {function(string): list} s - separator parser, this should yield a function
 * @param {string} str - input string
 * @returns {list} parser results
 */
const uncurriedChainLeft = (p, s, str) => {
  const flippedApplyTwo = (x, tuple) => {
    const op = fst(tuple);
    const y = snd(tuple);

    return op(x, y);
  };
  
  return apply(
    t => foldl(flippedApplyTwo, fst(t), snd(t)), 
    sequence(p, many(sequence(s, p))),
    str
  );
}
/** @see uncurriedChainLeft */
const chainLeft = curry(uncurriedChainLeft);

/**
 * Parses list of items applies operation, defined by the separator, from right to left
 * 
 * @param {function(string): list} p - item parser
 * @param {function(string): list} s - separator parser, this should return a function
 * @param {string} str
 * @returns {list} parser results
 */
const uncurriedChainRight = (p, s, str) => {
  const applyOne = (tuple, y) => {
    const x = snd(tuple);
    const op = fst(tuple);

    return op(x, y);
  };

  return apply(
    t => foldr(applyOne, fst(t), snd(t)),//foldr(applyOne, snd(t), fst(t)), 
    sequence(p, many(sequence(s, p))),
    str
  );
};

/**
 * @see uncurriedChainRight
 */
const chainRight = curry(uncurriedChainRight);

export {
  sequence,
  alternation,
  seqKeepFirst,
  seqKeepSecond,
  many,
  many1,
  option,
  pack,
  parenthesized,
  bracketed,
  listOf,
  chainLeft,
  chainRight
}