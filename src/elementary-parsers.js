import { createResult, tuple } from './utils';

// There is likely no reason for this to not be curried
// Also used ternary operator as it saved one 'return' statement
const symbol = symbol => string => {
  return string.charAt(0) === symbol ?
    tuple(
      string.slice(0, 1),
      string.slice(1)
    )
  :
    tuple( 
      '',
      string
    )
}

// Same as symbol, but for strings instead of single characters
const token = token => string => {
  const potentialToken = string.slice(0, token.length);
  return potentialToken === token ?
    tuple(
      potentialToken,
      string.slice(potentialToken.length)
    )
  :
   tuple(
     '',
      string
    )
}

// Returns a parser if predicate is true for inputstring
const satisfy = predicateFuction => parser => {
  return string => predicateFuction(string) ? parser(string) : tuple( '', string );
}

// Returns empty result and entire inputstring as result
const epsilon = string => tuple( '', string );

// Always returns the given value as result, and the entire inputstring as remainder
const succeed = value => string => tuple( value, string );

// Not sure that this is needed when implementing in JavaScript
// It accepts a string so it matches the signature a parser,
// but it always returns an empty object
const fail = string => function* (){ return; }();


export {
  symbol,
  token,
  satisfy,
  epsilon,
  succeed,
  fail
}