import { epsilon, succeed } from './elementary-parsers';
import { apply } from './parser-tranformers';
import { curry, chain } from 'ramda';
import {tuple, map, head, fst, snd, list, concat, fmap, recursiveList} from './utils';

// Execute two parsers in sequence. The second is applied to the remainder of the first
/*
  should return data with structure:
  list(
    tuple(
      second parser remainder,
      tuple(
        result of first parser, 
        result of second parser
      )
    )
    ...
  )
*/
const uncurriedSequence = (firstParser, secondParser, str) =>
  fmap(
    t1 => {
      const xs1 = fst(t1);
      const v1 = snd(t1);

      return map(
        t2 => {
          const xs2 = fst(t2);
          const v2 = snd(t2);

          return tuple(xs2, tuple(v1, v2));
        },
        secondParser(xs1)
      );
    },
    firstParser(str)
  );
const sequence = curry(uncurriedSequence);

// Applies two parsers to the input string, and returns the possible results
const uncurriedAlternation = (p1, p2, str) => concat(p1(str), p2(str));
const alternation = curry(uncurriedAlternation);

// These applies two parsers in sequence, but only keeps the result of one of them
const uncurriedSeqKeepFirst = (p1, p2, str) => {
  return map(
    t => tuple( t.fst, t.snd.fst ),
    sequence(p1, p2, str)
  );
}
const seqKeepFirst = curry(uncurriedSeqKeepFirst);

const uncurriedSeqKeepSecond = (p1, p2, str) => {
  return map(
      e => tuple( e.fst, e.snd.snd ),
      sequence(p1, p2, str)
  );
}
const seqKeepSecond = curry(uncurriedSeqKeepSecond);

const uncurriedMany = (p, str) => {
  return recursiveList(
    p(str),
    previousP => sequence(p, previousP, str)
  );
};
const many = curry(uncurriedMany);

const uncurriedOption = (p, str) => {
  return alternation(
      apply(p, x => list(x)),
      apply(epsilon, x => list()),
      str
  );
}
const option = curry(uncurriedOption);

// Note after running the test: Holy shit, I can't believe that worked!
const uncurriedBlock = (startDelimiter, contentParser, endDelimiter, string) => {
  return seqKeepFirst(
      seqKeepSecond(startDelimiter, contentParser),
      endDelimiter,
      string
  );
}
const block = curry(uncurriedBlock);

const uncurriedListOf = (itemParser, separatorParser, string) => {
  return sequence(itemParser)(many(seqKeepSecond(separatorParser)(itemParser)))(string);
}

const listOf = curry(uncurriedListOf);

// SeparatorParser should be accept a string and return a function that combines parse trees
// according to the operation it describes
const uncurriedChainLeft = (itemParser, separatorParser, string) => {
  return apply()(sequence(itemParser, many(sequence(separatorParser, itemParser)), string));
}

const chainLeft = curry(uncurriedChainLeft);


export {
  sequence,
  alternation,
  seqKeepFirst,
  seqKeepSecond,
  many,
  option,
  block,
  listOf,
  chainLeft
}