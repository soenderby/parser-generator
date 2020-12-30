import { apply } from './parser-tranformers';
import { satisfy } from './elementary-parsers';
import { isDigit } from './utils';

/**
 * Parses single digit character to a single integer
 * @param str - input string
 * @returns {list} - parse results
 */
const digit = (str) => {
  const f = c => c - '0';

  return apply(satisfy(isDigit, str), f);
}

export {
  digit
}