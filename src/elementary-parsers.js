import {
  tuple,
  head,
  tail,
  isEmpty,
  list,
  take,
  drop,
  curry,
  equals
} from '@soenderby/functional-utils'

/**
 * This parser only parses the symbol 'a'
 * @param {string} str - input string symbols
 * @return {list} - list of success
 */
const symbola = (str) => {
  const x = head(str);
  const xs = tail(str);

  return isEmpty(str) ? list()
                      : x === 'a' ? list(tuple(xs, 'a'))
                                  : list();
};

/**
 * This parses parses a predefined symbol
 * @param {string} a - symbol to parse
 * @param {string} str - input string symbols
 * @returns {list} - list of success
 */
const uncurriedSymbol = (a, str) => {
  const x = head(str);
  const xs = tail(str);

  return isEmpty(str) ? list()
                      : a === x ? list(tuple(xs, x))
                                : list();
}
/** @see uncurriedSymbol */
const symbol = curry(uncurriedSymbol);

/**
 * This parser parses a predefined token
 * Similar to symbol, but for strings instead of single characters
 * @param k - token to parse
 * @param xs - input string symbols
 * @returns {list} - list of success
 */
const uncurriedToken = (k, xs) => {
  const n = k.length;

  return equals(k, take(n, xs)) ? list(tuple(drop(n, xs), k))
                           : list();
};
/** @see uncurriedToken */
const token = curry(uncurriedToken);

/**
 * This parser parses an arbitrary token if it satisfies the predicate
 * @param {function(*): boolean} p - predicate
 * @param str - input string symbols
 * @returns {list} - list of success
 */
const uncurriedSatisfy = (p, str) => {
  const x = head(str);
  const xs = tail(str);

  return isEmpty(str) ? list()
                      : p(x) ? list(tuple(xs, x))
                             : list();
}
/** @see uncurriedSatisfy */
const satisfy = curry(uncurriedSatisfy);

/**
 * Always returns the given value as result, and the entire xs as remainder
 * @param v - value to return
 * @param xs - input string symbols
 * @returns {list} - list of success
 */
const uncurriedSucceed = (v, xs) => list(tuple(xs, v));
/** @see uncurriedSucceed */
const succeed = curry(uncurriedSucceed);

/**
 * @returns zero-tuple and entire inputstr as result
 */
const epsilon = succeed(tuple());

/**
 * Accepts a str so it matches the signature a parser,
 * but it always returns an empty object
 * @param str {string}
 * @returns {list}
 */
const fail = str => list();

export {
  epsilon,
  fail,
  satisfy,
  succeed,
  symbol,
  symbola,
  token
}