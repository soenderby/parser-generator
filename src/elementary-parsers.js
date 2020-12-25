import {
  tuple,
  piecewise,
  head,
  tail,
  isEmpty,
  isNonEmpty,
  otherwise,
  list,
  emptyList,
  take,
  drop,
  curry
} from './utils';

const uncurriedSymbol = (symbol, str) => {
  const isSymbol = s => head(s) === symbol;

  return piecewise(
      isEmpty, s => list(),
      isNonEmpty, piecewise(
          isSymbol, s => list(tuple(tail(s), symbol)),
          otherwise, s => list()
      )
  )(str);
}
const symbol = curry(uncurriedSymbol);

// Same as symbol, but for strings instead of single characters
const uncurriedToken = (token, str) => {
  const n = token.length;
  const isToken = s => token === take(n, s);

  return piecewise(
      isToken, s => list(tuple(drop(n, s), token)),
      otherwise, emptyList
  )(str);
};
const token = curry(uncurriedToken);

// Returns a parser if predicate is true for input string
const uncurriedSatisfy = (predicate, str) => {
  const isSatisfying = s => predicate(head(s));

  return piecewise(
      isEmpty, emptyList,
      isNonEmpty, piecewise(
          isSatisfying, s => list(tuple(tail(s), head(s))),
          otherwise, emptyList
      )
  )(str);
}
const satisfy = curry(uncurriedSatisfy);

// Always returns the given value as result, and the entire inputstr as remainder
const uncurriedSucceed = (value, str) => {
  return list(tuple(str, value));
}
const succeed = curry(uncurriedSucceed);

// Returns empty result and entire inputstr as result
const epsilon = succeed(tuple());

// Not sure that this is needed when implementing in JavaScript
// It accepts a str so it matches the signature a parser,
// but it always returns an empty object
const fail = str => list();

export {
  symbol,
  token,
  satisfy,
  epsilon,
  succeed,
  fail
}