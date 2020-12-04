// factory for creating the parser result object
// Consider whether or not every result should be an array, or just the ones with multiple values
const createResult = ({ result = '', remainder = '' } = {}) => 
  Array.isArray(result) ? 
    { result, remainder }
  :
    { result: [result], remainder };

// This is the constructor for a tuple datatype with two elements
const tuple = ( first, second ) => ({
  fst: first,
  snd: second,
  //value: { fst: first, snd: second }
});

const concatIfDefined = (array, elements) => {
  if(typeof elements !== 'undefined')
    return array.concat(elements);
  else
    return array;
}

const parser = parse => string => function* () {
    yield parse(string); 
}(); 

const map = (f, generator) => function* () {
  var cycle;

  for(var i = 0; i < 10; i++){
    cycle = generator.next();
    
    if (cycle.done)
      return;
   else yield f(cycle.value); 
  }
}();

export {
  createResult,
  tuple,
  concatIfDefined,
  parser,
  map
}