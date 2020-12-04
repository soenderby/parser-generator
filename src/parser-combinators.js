import { createResult, tuple, concatIfDefined, map } from './utils';
import { epsilon, succeed } from './elementary-parsers';
import { apply } from './parser-tranformers';
import { compose, curry } from 'ramda';

// Execute two parsers in sequence. The second is applied to the remainder of the first
// This will not work if the given parsers can produce multiple results.
// This might need a refactor of elementary parser to work.
/*
const sequence = firstParser => secondParser => string => {
  const firstResult = firstParser(string);
  const secondResult = secondParser(firstResult.remainder);

  return createResult({
    result: [firstResult.result, secondResult.result].flat(),
    remainder: secondResult.remainder
  });
};
*/
function* uncurriedSequence(firstParser, secondParser, string) {
  const generator1 = firstParser(string);
  
  while(true){
    var cycle1 = generator1.next();

    if (cycle1.done)
      return;
    
    var generator2 = secondParser(cycle1.value.snd);

    while(true){
      var cycle2 = generator2.next(); 
      if (cycle2.done)
        break;
      else yield tuple(
        tuple(cycle1.value.fst, cycle2.value.fst),
        cycle2.value.snd
      );
    }
  }
};

const sequence = curry(uncurriedSequence);

//const //uncurriedSequence, sequence / sequence, curriedSequence

// Applies two parsers to the input string, and returns the possible results
// I believe this has to be altered quite significantly to match the behavior 
// described in the article, as that describes the implementation in a lazy language
const uncurriedAlternation = function* (firstParser, secondParser, string) {
  var generator1 = firstParser(string);
  var generator2 = secondParser(string);
  
  while(true) {
    var cycle = generator1.next();
    
    if (cycle.done)
      break;
    else 
      yield cycle.value;
  }
  while(true){
    var cycle = generator2.next();
    
    if (cycle.done)
      return;
    else yield cycle.value;
  }
};
const alternation = curry(uncurriedAlternation);

// These applies two parsers in sequence, but only keeps the result of one of them
// Selecting using array index seems fragile and hard to read
const seqKeepFirst = firstParser => secondParser => string => {
  return map(
    e => tuple( e.fst.fst, e.snd ), 
    sequence(firstParser, secondParser)(string)
  );
}

const seqKeepSecond = firstParser => secondParser => string => {
  const result = sequence(firstParser)(secondParser)(string);
  return tuple( result.fst[1], result.snd );
}

// Maybe refactor so that this returns a list of all success rather than just the final result
const many = parser => string => {
  // The one defined in the article does not work here
  // I suspect because javascript is not lazy in the same manner as haskell
  // Or maybe i just did it wrong

  var list = []
  const result1 = parser(string);
  // Check if there was no parse result
  // special case currently used for chainleft, as it throws error on .some if result1.fst is not array
  if(typeof result1.fst === 'object'){
    if(result1.fst.includes('') && result1.fst.some(x => typeof x === 'function'))
      return succeed([])(string);
  }
  if(result1.fst[0] === '' || result1.fst === '' )
    return succeed([])(string);

  list = list.concat(result1.fst);
  const recursiveRes =  many(parser)(result1.snd); 

  list = list.concat(recursiveRes.fst);
  return tuple( list, recursiveRes.snd ); 
}

const option = parser => string => {
  return alternation(parser)(apply(x => {})(epsilon))(string);
}

// Note after running the test: Holy shit, I can't believe that worked!
const uncurriedBlock = (startDelimiter, contentParser, endDelimiter, string) => {
  return seqKeepFirst(seqKeepSecond(startDelimiter)(contentParser))(endDelimiter)(string);
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