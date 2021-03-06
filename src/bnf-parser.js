import { concat, curry, fst, head, isEmpty, list, map, snd, tail, tuple, isArray, string } from './utils';
import { symbol, token } from './elementary-parsers';
import { apply, sp } from './parser-tranformers';
import { alternation, listOf, many, seqKeepFirst, seqKeepSecond, sequence, many1 } from './parser-combinators';

/* Environment */
const env = (a, b) => list(tuple(a, b));

/**
 *
 * @param {list: tuple} env - Environment containing the image
 * @param {*} x - value that should be associated
 */
const uncurriedAssoc = (env, x) => {
  const w = head(env);
  const ws = tail(env);

  const u = fst(w);
  const v = snd(w);

  if(JSON.stringify(x) === JSON.stringify(u) )
    return v;
  else
    return assoc(ws, x);
}

/**
 * @see uncurriedAssoc
 */
const assoc = curry(uncurriedAssoc);

/**
 *
 * @param {function} f - Function to apply to images in environment
 * @param {list} environment - Environment containing the images the function will be applied to.
 */
const uncurriedMapenv = (f, environment) => {
  if(isEmpty(environment))
    return list();

  return map(
    t => {
      const x = fst(t);
      const v = snd(t);

      return tuple(x, f(v));
    },
    environment
  );
}

/**
 * @see uncurriedMapenv
 */
const mapenv = curry(uncurriedMapenv);

/**
 * Constructor for a terminal token
 * @constructor
 * @param value - list of chars
 * @returns {{type: string, value: *[]}}
 */
const Term = value => {
  return {
    type: 'terminal',
    value: value
  }
}

/**
 * Constructor for a non-terminal token
 * @constructor
 * @param value - list of chars
 * @returns {{type: string, value: *[]}}
 */
const Nont = value => {
  return {
    type: 'nonterminal',
    value: value
  }
};

/**
 * Parser for grammers written using the bnf formalism
 * @param {function(string): list} nontp - parser for non-terminals
 * @param {function(string): list} termp - parser for terminals
 * @param {string} str - Input string
 * @returns {list} - Parser result
 */
const uncurriedBnf = (nontp, termp, str) => {
  const spsymbol = s => sp(symbol(s));
  const sptoken = t => sp(token(t));

  // Parses a non-terminal and creates the parse tree for it
  const nont = (str) =>
    apply(
      Nont,
      sp(nontp),
      str
    );

  // parses a terminal and creates the parse tree for it
  const term = (str) =>
    apply(
      Term,
      sp(termp),
      str
    );

  // When a parser in alternation returns an empty list, it is simply skipped
  // This is an issue, as this should be able to return an empty alternative
  // This might not be the only reason bnf is not working correctly
  const alt = (str) =>
    many(
      alternation(term, nont),
      str
    );

  const rhs = (str) => listOf(alt, spsymbol('|'), str);

  const rule = (str) =>
    sequence(
      nont,
      seqKeepSecond(
        sptoken(string('::=')),
        seqKeepFirst(
          rhs,
          spsymbol('.')
        )),
      str
    );

  return many(rule, str);
};

/**
 * @see uncurriedBnf
 */
const bnf = curry(uncurriedBnf);

export {
  env,
  assoc,
  mapenv,
  Term,
  Nont,
  bnf
};
