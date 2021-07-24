import {curry, compose } from 'ramda';
import { tuple, map, snd, head, filter, isEmpty, dropWhile, fst, isFunction, equals, list, string } from '@soenderby/functional-utils';

/**
 * drops initial spaces from input string, and then applies a
 * given parser
 * @param {function} p - parser
 * @param {string} str - input string
 * @returns {list} parser output
 */
const uncurriedSp = (p, str) => p(dropWhile(equals(' '), str));

/** @see uncurriedSp */
const sp = curry(uncurriedSp);

/**
 * Only returns results with empty remainder
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

/**
 * Returns a parser that does the same as the given parser, but applies the given
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
  const f = list => isEmpty(list) ? no : yes(list);

  if (!isFunction(yes))
    throw TypeError('expected snd(t) to be function');

  return apply(f, p, str);
}
/** @see optionalApply */
const optionalApply = curry(uncurriedOptionalApply);

/**
 * parses text, guarantees empty rest string, picks the first solution, and delivers the parse tree only
 * @param p - parser to be applied
 * @param str - input string
 */
const uncurriedSome = (p, str) => {
  return compose(
    snd,
    head,
    just(p)
  )(string(str));
}
/** @see uncurriedSome */
const some = curry(uncurriedSome);

/**
 * Yields the first possible result of a parser, or an empty list
 *
 * @param {function(string): list} p - parser to transform
 * @param {string} str - input string
 * @returns {list} parser result
 */
const uncurriedFirst = (p, str) => {
  const r = p(str);

  return isEmpty(r) ? list()
                      : list(head(r));
}

/**
 * @see uncurriedFirst
 */
const first = curry(uncurriedFirst);

export {
  sp,
  just,
  apply,
  optionalApply,
  some,
  first
}
