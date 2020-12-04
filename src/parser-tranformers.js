import { createResult } from './utils';

const removeLeadingWhitespace = parser => string => parser(string.trimStart(string));

// Only returns results with empty remainder
const just = parser => string => {
  const results = parser(string);
  return results.filter(res => res.snd === '');
}

// This applies a given funciton to the result of a given parser
// This can be used to add semantic functions to parsers
const apply = func => parser => string => {
  const result = parser(string);
  //return createResult({ result: result.result.map(x => func(x)), remainder: result.remainder});
  return func(result);
}

// It is possible that this should be able to handle lists of results.
// It should also fail if there are no results with an empty remainder
const some = parser => string => {
  const result = parser(string);
  return result.fst;
}

export {
  removeLeadingWhitespace,
  just,
  apply,
  some
}