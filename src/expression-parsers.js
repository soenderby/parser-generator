import { apply, optionalApply } from './parser-tranformers';
import { satisfy, symbol } from './elementary-parsers';
import { many, option, seqKeepSecond, sequence } from './parser-combinators';
import { isDigit, foldl, foldr, snd, fst, tuple, isEmpty } from './utils';
import {identity} from "ramda";

/**
 * Parses single digit character to a single integer
 * @param str - input string
 * @returns {list} - parse results
 */
const digit = (str) => {
  const f = c => c - '0';

  return apply(f, satisfy(isDigit), str);
}

/**
 * Parses string to integer
 * @param str - input string
 * @returns {list} - parse results
 */
const natural = str => {
  const f = (prevValue, digit) => prevValue * 10 + digit;

  return apply(foldl(f, 0), many(digit), str);
}

/**
 * Parses string to fraction
 * @param str - input string
 * @returns {list} - parse results
 */
const fract = str => {
  // Not tested, so there may be a need to convert digit to appropriate type 
  const f = (digit, prevValue) => (prevValue + digit) / 10

  return apply(foldr(f, 0.0), many(digit), str)
}

// untested
const integer = str => {
  return sequence(
      optionalApply(
        tuple(v => v, x => v => -v),
        option(symbol('-'))
      ),
      natural,
      str
  );
}

/**
 * Parses string to floating point number
 * @param str - input string
 * @returns {list} - parse results
 */
const fixed = str => {
  return apply(
    t => snd(fst(t)) + snd(t),
    sequence(
      integer,
      optionalApply(
        tuple(0.0, identity),
        option(seqKeepSecond(symbol('.'), fract))
      )
    ),
    str
  );
}

export {
  digit,
  natural,
  fract, 
  fixed
}