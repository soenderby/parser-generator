import * as R from 'ramda';
import * as chai from 'chai';

/* Data structures */
const list = (...args) => {
  return function* (){
    for(let i = 0; i < args.length; i++){
      yield args[i];
    }
  }
}
const emptyList = () => list();

const tuple = (...args) => {
  if (args.length >= 3)
    throw 'tuple only supports up to 2 arguments'

  return {
    fst: args.length >= 1 ? args[0] : undefined,
    snd: args.length >= 2 ? args[1] : undefined,
  };
}

/* Data types (duck typing) */
const isFunction = obj => typeof obj === 'function';
const isList = obj => obj.constructor.name === 'GeneratorFunction';
const isString = obj => typeof obj === 'string';
const isTuple = obj => obj.hasOwnProperty('fst') && obj.hasOwnProperty('snd');

const areAllList = (...args) => args.every(isList);
const areAllFunction = (...args) => args.every(isFunction);
const areAllString = (...args) => args.every(isString);

/* Common functions */
// based on https://www.maplesoft.com/support/help/Maple/view.aspx?path=examples%2Fpiecewise
const piecewise = (...outerArgs) => {
  if (outerArgs.length < 2)
    throw  "piecewise expects at least 2 arguments"

  if (outerArgs.length % 2 !== 0)
    throw "piecewise expects even number of arguments";

  for(let i = 0; i < outerArgs.length; i++){
    if (!isFunction(outerArgs[i]))
      throw `piecewise argument ${i} is not a function`
  }

  return (...innerArgs) => {
    for(let i = 0; i < outerArgs.length; i += 2){
      if(outerArgs[i].apply(this, innerArgs))
        return outerArgs[i + 1].apply(this, innerArgs);
    }
    throw 'arguments do not fulfill any predicate';
  };
};
const otherwise = () => true;

const notSupportedError = obj => { throw `Does not support ${obj}` };

const curry = R.curry;

/* List functions */
const concatList = (list1, list2) => function* () {
  const iterator1 = list1();
  const iterator2 = list2();

  while(true){
    let iteration = iterator1.next();

    if (iteration.done)
      break;
    else yield iteration.value;
  }

  while(true){
    let iteration = iterator2.next();

    if (iteration.done)
      break;
    else yield iteration.value;
  }
}
const concat = piecewise(
  areAllList, concatList,
  otherwise, R.concat
);

const dropList = (n, list) => function*() {
  let iterator = list();

  for(let i = 0; i < n; i++){
    if(iterator.next().done)
      break;
  }

  while(true){
    let iteration = iterator.next();
    if(iteration.done)
      break;
    else yield iteration.value;
  }
}
const dropString = (n, str) => {
  return str.slice(n, str.length);
}
const drop = piecewise(
    (n, obj) => isList(obj), dropList,
    (n, obj) => isString(obj), dropString,
    otherwise, notSupportedError
);

const mapList = (f, list) => function* () {
  const iterator = list();

  while (true){
    let iteration = iterator.next();

    if(iteration.done)
      break;
    else yield f(iteration.value);
  }
}
const map = piecewise(
    (f, obj) => isList(obj), mapList,
    otherwise, R.map
);

const isEmptyList = (list) => {
  for(let e of list())
    return false;
  return true;
};
const isEmpty = piecewise(
  isList, isEmptyList,
  otherwise, R.isEmpty,
);

const isNonEmpty = obj => !isEmpty(obj);

const headList = (list) => {
  return list().next().value;
}
const head = piecewise(
  isList, headList,
  otherwise, R.head
);

const tailList = (list) => function* (){
  let iterator = list();
  iterator.next();

  while(true) {
    let iteration = iterator.next();

    if(iteration.done)
      break;
    else yield iteration.value;
  }
}
const tail = piecewise(
  isList, tailList,
  otherwise, R.tail
);

const takeList = (n, list) => function*() {
  let iterator = list();

  for(let i = 0; i < n; i++) {
    let iteration = iterator.next();

    if(iteration.done)
      break;
    else yield iteration.value;
  }
}
const take = piecewise(
    (n, obj) => isList(obj), takeList,
    otherwise, R.take
);

/* Test methods */
chai.use(function(_chai, utils) {
  // Overwrites the eql method, which is called recursively by assert.deepEqual, to support list comparisons
  utils.overwriteMethod(_chai.Assertion.prototype, 'eql', function(_super) {
    return function(str) {
      const { object, negate, message } = this.__flags;

      // List elements are only compared when both actual value and expected values are lists
      if (isList(str) && isList(object)) {
        const iterator1 = str.apply();
        const iterator2 = object.apply();

        // As lists can be infinite, the lists are only compared up to 100 elements
        for(let i = 0; i < 100; i++) {
          let iteration1 = iterator1.next();
          let iteration2 = iterator2.next();

          if (iteration1.done || iteration2.done)
            break;

          // The list elements are compared using
          if (negate) {
            new chai.Assertion(iteration1.value, message).to.not.deep.equal(iteration2.value);
          }
          else new chai.Assertion(iteration1.value, message).to.deep.equal(iteration2.value);
        }
      }
      // If expected value is list and actual value is not, an error is thrown
      else if(isList(str) && !negate){
        chai.assert.fail("#{this} to be a list");
      }
      else _super.apply(this, arguments);
    }
  })
});

/* Tuple methods */
const fstTuple = t => {
  return t.fst;
}
const fst = piecewise(
  isTuple, fstTuple,
  otherwise, notSupportedError
);

const sndTuple = t => {
  return t.snd;
}
const snd = piecewise(
    isTuple, sndTuple,
    otherwise, notSupportedError
);

export {
  concat,
  drop,
  emptyList,
  fst,
  head,
  isEmpty,
  isList,
  isNonEmpty,
  isTuple,
  list,
  map,
  otherwise,
  piecewise,
  snd,
  tail,
  take,
  tuple,
  curry
}