import * as R from 'ramda';

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
const concatString = (str1, str2) => {
  return str1 + str2;
}
const concat = piecewise(
  areAllList, concatList,
  areAllString, concatString,
  otherwise, notSupportedError
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
    otherwise, notSupportedError
);

const isEmptyList = (list) => {
  for(let e of list())
    return false;
  return true;
};
const isEmptyString = str => {
  return str.length === 0;
}
const isEmpty = piecewise(
  isList, isEmptyList,
  isString, isEmptyString,
  otherwise, notSupportedError
);

const isNonEmptyList = (list) => {
  for(let e of list())
    return true;
  return false;
}
const isNonEmptyString = str => {
  return str.length !== 0;
}
const isNonEmpty = piecewise(
    isList, isNonEmptyList,
    isString, isNonEmptyString,
    otherwise, notSupportedError
);

const headList = (list) => {
  return list().next().value;
}
const headString = (str) => {
  return str.charAt(0);
}
const head = piecewise(
  isList, headList,
  isString, headString
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
const tailString = (str) => {
  return str.slice(1, str.length);
}
const tail = piecewise(
  isList, tailList,
  isString, tailString,
  otherwise, notSupportedError
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
const takeString = (n, str) => {
  return str.slice(0, n);
}
const take = piecewise(
    (n, obj) => isList(obj), takeList,
    (n, obj) => isString(obj), takeString,
    otherwise, notSupportedError
);



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