import { curry, compose } from 'ramda';
import { tuple, map, snd, head } from './utils';

const uncurriedRemoveLeadingWhitespace = (parser, string) => parser(string.trimStart(string));

const removeLeadingWhitespace = curry(uncurriedRemoveLeadingWhitespace);

// Only returns results with empty remainder
// This could be improved with a filter function for lists
const uncurriedJust = (parser, string) => 
  map(
    res => {
      if(res.fst === '')
        return res
    },
    parser(string)
  );

const just = curry(uncurriedJust);

// This applies a given funciton to the result of a given parser
// This can be used to add semantic functions to parsers

/*
  Returns a parser that does the same as the given parser, but applied the given
  function to the resulting parse tree.
  Returns values of the form:
      [ (remainder, func(value)) ]
*/
const uncurriedApply = (func, parser, string) => {
  return map(res => tuple(res.fst, func(res.snd)), parser(string) );
}

const apply = curry(uncurriedApply);

// It is possible that this should be able to handle lists of results.
// It should also fail if there are no results with an empty remainder
const some = parser => string => {
  return compose(
    snd,
    head,
    just
  )(parser(string))
}

export {
  removeLeadingWhitespace,
  just,
  apply,
  some
}