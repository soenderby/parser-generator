import { apply, optionalApply } from './parser-tranformers';
import { satisfy } from './elementary-parsers';
import { many, option, seqKeepSecond, sequence } from './parser-combinators';
import { isDigit, foldl, foldr, snd, fst } from './utils';

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

/**
 * Parses string to floating point number
 * @param str - input string
 * @returns {list} - parse results
 */
const fixed = str => {
  tuple(xs2, tuple(v1, v2))
  // There may also be an need for type conversion here, as Haskell has the Num class, 
  // and in the article the result of integer is converted to this 
  // Also: not entirely sure the addition of the results are correct
  return apply(result => fst(snd(result)) + snd(snd(result)), 
    sequence(integer, optionalApply(
      tuple(0.0, x => x), option(
        seqKeepSecond(symbol('.'), fract)
      )
    ))
  , str);
}

export {
  digit,
  natural,
  fract, 
  fixed
}