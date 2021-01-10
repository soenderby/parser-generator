import { apply, optionalApply } from './parser-tranformers';
import { satisfy, symbol } from './elementary-parsers';
import {
  alternation,
  chainRight, choice,
  commaList,
  many,
  many1,
  option,
  parenthesized,
  seqKeepSecond,
  sequence
} from './parser-combinators';
import {
  isDigit,
  foldl,
  foldr,
  snd,
  fst,
  tuple,
  isEmpty,
  isAlpha,
  isString,
  curry,
  drop,
  take,
  list,
  isList,
  head,
  map
} from './utils';
import {always, flip, identity, negate} from "ramda";

/**
 * Parses string to word (containing only alphabetical charachters)
 * @param {string} str - input string
 * @returns {list} - parse results
 */
const identifier = str => many1(satisfy(isAlpha), str)

/**
 * Parses single digit character to a single integer
 * Example "12" => list(tuple("2", 1))
 * @param str - input string
 * @returns {list} - parse results
 */
const digit = (str) => {
  const f = c => c - '0';

  return apply(f, satisfy(isDigit), str);
}

/**
 * Parses string to integer
 * Example "123" => list(tuple("", 123), ...)
 * @param str - input string
 * @returns {list} - parse results
 */
const natural = str => {
  const f = (prevValue, digit) => prevValue * 10 + digit;

  return apply(foldl(f, 0), many1(digit), str);
}

/**
 * Parses string to fraction
 * Example "123" => list(tuple("", 0.123), ...)
 * @param str - input string
 * @returns {list} list of success
 */
const fract = str => {
  // Not tested, so there may be a need to convert digit to appropriate type 
  const f = (digit, prevValue) => (prevValue + digit) / 10

  return apply(foldr(f, 0.0), many(digit), str)
}

/**
 * Parses string to integer
 * Example "-123" => list(tuple("", -123), ...)
 * @param {string} str - input string
 * @returns {list} list of success
 */
const integer = str => {
  const ap = t => {
    const f = fst(t);
    const x = snd(t);

    return f(x);
  }

  return apply(
    ap,
    sequence(
      optionalApply(
        tuple(identity, always(negate)),
        option(symbol('-'))
      ),
      natural
    ),
    str
  );
}

/**
 * Parses string to floating point number
 * Example "-123.4" => list(tuple("", -123.4), ...)
 * @param str - input string
 * @returns {list} - parse results
 */
const fixed = str => {
  const uncurriedPlus = t => fst(t) + snd(t);

  return apply(
    uncurriedPlus,
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

const float = str => {
  const power = e => e < 0 ? 1.0 / power(-e) : Math.pow(10, e);
  const f = (m,e) => m * power(e);

  return apply(
    t => f(fst(t), snd(t)),
    sequence(
      fixed,
      optionalApply(tuple(0.0, identity), option(seqKeepSecond(symbol('E'), integer)))
    ),
    str
  );
}

const variable = name => {
  return {
    operation: 'variable',
    name: name
  }
}

const constant = value => {
  return {
    operation: 'constant',
    value: value
  }
}

const uncurriedCallOperation = (name, args) => {
  return {
    operation: 'function',
    name: name,
    arguments: args
  }
}
const callOperation = curry(uncurriedCallOperation);

const uncurriedBinaryOperation = (operation, left, right) => {
  if(!isString(operation))
    throw new TypeError('expected operation to be string');

  return {
    operation: operation,
    operands: {
      left: left,
      right: right
    }
  }
}
const binaryOperation = curry(uncurriedBinaryOperation);

const addition = binaryOperation('addition');
const subtraction = binaryOperation('subtraction');
const multiplication = binaryOperation('multiplication');
const division = binaryOperation('division');

const fact = str => {
  const ap = t => {
    const x = fst(t);
    const f = snd(t);
    return f(x);
  };
  const flippedCallOperation = args => {
    if (!isList(args))
      throw TypeError('expected args to be list');

    return name => callOperation(name, head(args));
  }

  return alternation(
    alternation(
      apply(constant, integer),
      apply(
        ap,
        sequence(
          identifier,
          optionalApply(
            tuple(variable, flippedCallOperation),
            option(parenthesized(commaList(expr)))
          )
        )
      )
    ),
    parenthesized(expr),
    str
  );
}

/**
 * 
 * @param {List} ops - List of tuples containing operators and the associated tree constructors
 * @param {function(string): list} p - Parser for items between operators
 * @param {*} str - Input string
 */
const uncurriedGen = (ops, p, str) => {
  const f = t => apply(always(snd(t)), symbol(fst(t)));

  return chainRight(p, choice(map(f, ops)), str)
};
const gen = curry(uncurriedGen);

const multis = list(
  tuple('*', flip(multiplication)),
  tuple('/', flip(division)),
);

const addis = list(
  tuple('+', flip(addition)),
  tuple('-', flip(subtraction)),
);

//const expr = gen(addis, gen(multis, fact));

const expr = foldr(gen, fact, list(addis, multis));

export {
  identifier,
  digit,
  natural,
  fract,
  integer,
  fixed,
  float,
  binaryOperation,
  variable,
  callOperation,
  addition,
  subtraction,
  multiplication,
  division,
  constant,
  fact,
  expr
}