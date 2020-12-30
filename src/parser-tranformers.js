import {curry, compose } from 'ramda';
import { tuple, map, snd, head, filter, isEmpty, dropWhile, fst, isFunction } from './utils';

/**
 * drops initial spaces from input string, and then applies a
 * given parser
 * @param {function} p - parser
 * @param {string} str - input string
 * @returns {list} parser output
 */
const uncurriedSp = (p, str) => p(dropWhile(s => s === ' ', str));
/** @see uncurriedSp */
const sp = curry(uncurriedSp);

/**
 * Only returns results with empty remainder
 * This could be improved with a filter function for lists
 * @param {function} p - parser
 * @param {string} str - input string
 * @returns {list} parser output
 */
const uncurriedJust = (p, str) => {
  return filter(
    elem => isEmpty(elem.fst),
    p(str)
  );
}
/** @see uncurriedJust */
const just = curry(uncurriedJust);

// This applies a given funciton to the result of a given parser
// This can be used to add semantic functions to parsers

/**
 * Returns a parser that does the same as the given parser, but applied the given
 * function to the resulting parse tree.
 * @param {function} f - function to apply
 * @param {function(string): list} p - parser
 * @param {string} xs - input string
 * @returns values of the form: [ (remainder, func(value)) ]
*/
const uncurriedApply = (f, p, xs) => {
  return map(res => {
    const ys = fst(res);
    const v = snd(res);

    return tuple(ys, f(v))
  }, p(xs));
}
const apply = curry(uncurriedApply);

/**
 * Transforms parser output to no or yes(x) depending on whether or not the parser fails
 * @param {tuple} t - (no, yes) where no is a constant and yes a function
 * @param {function(string): list} p
 * @param {string} str
 * @returns {*}
 */
const uncurriedOptionalApply = (t, p, str) => {
  const no = fst(t);
  const yes = snd(t);
  const f = list => isEmpty(list) ? no : yes(head(list));

  if (!isFunction(yes))
    throw TypeError('expected snd(t) to be function');

  return apply(f, p, str);
}
/** @see optionalApply */
const optionalApply = curry(uncurriedOptionalApply);

/**
 * checks whether or not c is a digit
 * @param {string} c - single character
 * @returns {boolean}
 */
const isDigit = c => {
  if (c.length !== 1)
    throw new Error('expects only a single character');

  return c === '0' || c === '1' || c === '2' || c === '3' || c === '4' || c === '5' || c === '6' || c === '7' || c === '8' || c === '9';
}

/**
 * Parses single digit character to a single integer
 * @param str - input string
 * @returns {list} - parse results
 */
const digit = (str) => {
  const f = c => c - '0';

  return apply(satisfy(isDigit, str), f);
}

/**
 * It is possible that this should be able to handle lists of results.
 * It should also fail if there are no results with an empty remainder
 * @param p - parser to be applied
 * @param str - input string
 */
const uncurriedSome = (p, str) => {
  return compose(
    snd,
    head,
    just(p)
  )(str);
}
/** @see uncurriedSome */
const some = curry(uncurriedSome);

export {
  sp,
  just,
  apply,
  optionalApply,
  digit,
  some
}