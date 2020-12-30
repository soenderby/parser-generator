import * as R from 'ramda';
import * as chai from 'chai';

/* Data structures */
/**
 * Creates a new list
 * @callback list = function(): Generator<*, void, ?>
 * @returns { list | string }
 */
const list = (...args) => {
  if (args.length > 0 && args.every(isString))
    return args.join('');

  return function* () {
    for (const arg of args) {
      yield arg
    }
  }
}

/**
 * Creates an empty list of the same type as obj
 * @param {list | string} obj
 * @return {list | string}
 */
const emptyList = (obj) => {
  if (isString(obj))
    return '';

  if (isList(obj))
    return list();

  throw TypeError(`expects obj ${obj} to be string or list`);
}

const recursiveList = (...args) => {
  if (args.length < 2)
    throw Error('recursiveList expects at least 2 arguments');

  if (!isFunction(args[args.length - 1]))
    throw Error('recursiveList expects last argument to be function');

  return function* () {
    let baseCases = [];
    const recursiveCase = args[args.length - 1];

    // Returns a finite sequence of all base cases
    for (let i = 0; i < args.length - 1; i++) {
      const value = args[i];
      baseCases[i] = value;
      yield value;
    }

    // Returns an infinite sequence of subsequent recursive cases
    while (true) {
      const value = recursiveCase.apply(this, baseCases);
      baseCases = [...baseCases.slice(1), value];
      yield value;
    }
  }
}

/**
 * Create a new tuple of up to two arguments
 * @typedef {{fst: *, snd: *}} tuple
 * @returns {tuple}
 */
const tuple = (...args) => {
  if (args.length > 2)
    throw Error('tuple only supports up to 2 arguments')

  return {
    fst: args.length >= 1 ? args[0] : undefined,
    snd: args.length >= 2 ? args[1] : undefined,
  };
}

/* Data types (duck typing) */
/**
 * Determines whether or not obj is an array
 * @param {*} obj
 * @return {boolean}
 */
const isArray = obj => Array.isArray(obj);

/**
 * Determines whether or not obj is a function
 * @param {*} obj
 * @return {boolean}
 */
const isFunction = obj => typeof obj === 'function';

/**
 * Determines whether or not obj is a number
 * @param {*} obj
 * @return {boolean}
 */
const isNumber = obj => typeof obj === 'number';

/**
 * checks whether or not c is a digit
 * @param {string} c - single character
 * @returns {boolean}
 */
const isDigit = c => {
  if (c.length !== 1)
    throw new Error('expects only a single character');

  return c === '0' || c === '1' || c === '2' || c === '3' || c === '4' || c === '5' || c === '6' || c === '7' || c === '8' || c === '9';
}

/**
 * Determines whether or not obj is a list
 * @param {*} obj
 * @return {boolean}
 */
const isList = obj => obj !== null && obj !== undefined && obj.constructor.name === 'GeneratorFunction';

/**
 * Determines whether or not obj is a string
 * @param obj
 * @return {boolean}
 */
const isString = obj => typeof obj === 'string';

/**
 * Determines whether or not obj is a tuple
 * @param obj
 * @return {boolean}
 */
const isTuple = obj => obj.hasOwnProperty('fst') && obj.hasOwnProperty('snd');

/**
 * Determines whether or not obj is a boolean
 * @param obj
 * @return {boolean}
 */
const isBoolean = obj => typeof obj === 'boolean';

const isAllArray = (...args) => args.every(isArray);
const areAllList = (...args) => args.every(isList);
const areAllFunction = (...args) => args.every(isFunction);
const areAllString = (...args) => args.every(isString);

/* Common functions */
// based on https://www.maplesoft.com/support/help/Maple/view.aspx?path=examples%2Fpiecewise
const piecewise = (...outerArgs) => {
  if (outerArgs.length < 2)
    throw  Error("piecewise expects at least 2 arguments")

  if (outerArgs.length % 2 !== 0)
    throw Error("piecewise expects even number of arguments");

  for (let i = 0; i < outerArgs.length; i++) {
    if (!isFunction(outerArgs[i]))
      throw Error(`piecewise argument ${i} is not a function`);
  }

  return (...innerArgs) => {
    for (let i = 0; i < outerArgs.length; i += 2) {
      if (outerArgs[i].apply(this, innerArgs))
        return outerArgs[i + 1].apply(this, innerArgs);
    }
    throw Error('arguments do not fulfill any predicate');
  };
};
const otherwise = () => true;

const notSupportedError = obj => {
  throw Error(`Does not support ${obj}`);
};

/**
 * Curries functions (alias of R.curry)
 */
const curry = R.curry;

/* List functions */
/**
 * Concatenates two lists of the same type
 * @param {array | list | string} list1
 * @param {array | list | string} list2
 * @returns {array | list | string}
 */
const concat = (list1, list2) => {
  if ((isArray(list1) && isArray(list2)) || (isString(list1) && isString(list2)))
    return R.concat(list1, list2);

  if (isList(list1) && isList(list2)){
    return function* () {
      for (const item of list1()) {
        yield item;
      }
      for (const item of list2()) {
        yield item;
      }
    }
  }
  throw TypeError(`cannot concat list1 ${list1} and list2 ${list2}`);
}

/**
 * Drops n number of elements of a list
 * @param {number} n - number of elements to skip
 * @param {array | list | string} list
 * @returns {array | list | string}
 */
const drop = (n, list) => {
  if (!isNumber(n))
    throw TypeError(`expected n ${n} to be a number`);

  if (isArray(list) || isString(list))
    return R.drop(n, list);

  if (isList(list)){
    return function* () {
      let iterator = list();

      for (let i = 0; i < n; i++) {
        if (iterator.next().done)
          break;
      }
      for (const item of iterator) {
        yield item;
      }
    }
  }
  throw TypeError(`expected list ${list} to be array, string or list`);
}

/**
 * Drops elements as long as predicate is satisfied
 * @param {function(*): boolean} f - predicate
 * @param {array | list | string} list
 * @returns {array | list | string}
 */
const dropWhile = (f, list) => {
  if (!isFunction(f))
    throw TypeError(`expected n ${n} to be a function`);

  if (isArray(list) || isString(list))
    return R.dropWhile(f, list);

  if (isList(list)){
    return function* () {
      let iterator = list();

      while(true) {
        let iteration = iterator.next();
        let isSatisfied = f(iteration.value);

        if (!isBoolean(isSatisfied))
          throw TypeError('expected f to return boolean');

        if (!isSatisfied || iteration.done)
          break;
      }
      for (const item of iterator) {
        yield item;
      }
    }
  }
  throw TypeError(`expected list ${list} to be array, string or list`);
}

const equals = R.equals;

/**
 * Applies f to all elements in list
 * @param {function} f
 * @param {list | *} list
 * @returns {list | *}
 */
const map = (f, list) => {
  if (!isFunction(f))
    throw TypeError(`expected f ${f} to be a function`);

  if (isList(list)){
    return function* () {
      for (let item of list()) {
        yield f(item);
      }
    }
  }
  return R.map(f, list);
}

/** @see R.max */
const max = R.max;

/**
 * Applies f to all elements in list and flattens list
 * @param {function:list | *} f
 * @param {list | *} obj
 */
const fmap = (f, obj) =>  {
  if (!isFunction(f))
    throw TypeError(`expected f ${f} to be a function`);

  if (isList(obj)) {
    return function* () {
      for (let item of obj()) {
        let result = f(item);

        if (!isList(result))
          throw TypeError(`expected f ${f} to return a list when obj is a list`);

        yield* result();
      }
    }
  }
  return R.chain(f, obj);
}

/**
 * Filters list for elements
 * @param {function} f - predicate
 * @param {list | *} obj - list
 * @returns {list | *}
 */
const filter = (f, obj) => {
  if (!isFunction(f))
    throw TypeError(`expected f ${f} to be a function`);

  if (isList(obj)) {
    return function* () {
      for (let item of obj()) {
        let result = f(item);

        if (!isBoolean(result))
          throw TypeError(`expected f ${f} to return a boolean`);

        if(result)
          yield item;
      }
    }
  }
  return R.filter(f, obj);
}

/**
 * Determines whether or not a list has any elements
 * @param {array| list | string} obj - list of elements
 * @returns {boolean}
 */
const isEmpty = (obj) => {
  if (isString(obj) || isArray(obj))
    return R.isEmpty(obj);

  if (isList(obj))
    return obj().next().done;

  throw TypeError(`expected obj ${obj} to be array, string or list`);
}

/**
 * Determines whether or not a list has any elements (inverse of isEmpty)
 * @param {array | list | string} obj - list of elements
 * @returns {boolean}
 */
const isNonEmpty = obj => !isEmpty(obj);

/**
 * Takes the first element of a list
 * @param {array | list | string} obj - list of elements
 * @returns {*}
 */
const head = (obj) => {
  if (isArray(obj) || isString(obj))
    return R.head(obj);

  if (isList(obj))
    return obj().next().value;

  throw TypeError(`expected obj ${obj} to be array, string or list`);
}

/**
 * Drops first element in a list
 * @param {array | list | string} obj - list of elements
 * @returns {array | list | string}
 */
const tail = (obj) => {
  if (isArray(obj) || isString(obj))
    return R.tail(obj);

  if (isList(obj)) {
    return function* () {
      let iterator = obj();

      iterator.next();

      for (const item of iterator)
        yield item;
    }
  }
  throw TypeError(`expected obj ${obj} to be array, string or list`);
}

/**
 * Takes n number of elements in a list
 * @param {number} n - number of elements to take
 * @param {array | list | string} obj - list of elements
 * @returns {array | list | string}
 */
const take = (n, obj) => {
  if (!isNumber(n))
    throw TypeError(`expected n ${n} to be a number`);

  if (isArray(obj) || isString(obj))
    return R.take(n, obj);

  if (isList(obj)){
    return function* () {
      let iterator = obj();

      for (let i = 0; i < n; i++) {
        let iteration = iterator.next();

        if (iteration.done)
          break;
        else yield iteration.value;
      }
    }
  }
  throw TypeError(`expected obj ${obj} to be array, string or list`);
}

/* Test methods */
/**
 * Converts list into an array
 * @param {list} list
 * @param {number} maxLength - maximum number of elements copied into array
 * @returns {[]}
 */
const listToArray = (list, maxLength = 100) => {
  const array = [];
  const iterator = list.apply();

  for (let i = 0; i < maxLength; i++) {
    let iteration = iterator.next();

    if (iteration.done)
      break;
    else array.push(iteration.value);
  }
  return array;
}

/**
 * Converts list-type properties to array-type properties of an objects and any sub-objects
 * @param {*} obj
 * @param {number} maxLength - maximum number of list elements copied into array
 * @param {number} depth - maximum depth into sub-objects
 * @returns {*}
 */
const listToArrayRecursively = (obj, maxLength = 100, depth = 0) => {
  const func = e => listToArrayRecursively(e, maxLength, depth + 1);

  if (depth > 10)
    return obj;

  if (isList(obj))
    return listToArray(obj).map(func);
  if (isArray(obj))
    return obj.map(func);
  else if (typeof obj === 'object') {
    let output = {};
    for (let key of Object.keys(obj))
      output[key] = func(obj[key]);
    return output;
  } else return obj;
}

/**
 * Chai plugin, which overwrites the eql method, which is called recursively by assert.deepEqual, to support list comparisons
 */
chai.use(function (_chai, utils) {
  //
  utils.overwriteMethod(_chai.Assertion.prototype, 'eql', function (_super) {
    return function (str, i = 0) {
      if (i === 0) {
        str = listToArrayRecursively(str);
        this.__flags.object = listToArrayRecursively(this.__flags.object);
      }
      _super.apply(this, [str, i + 1]);
    }
  });
});

/* Tuple methods */
/**
 * Takes the first element of a tuple
 * @param {tuple} obj - tuple
 * @returns {*}
 */
const fst = obj => {
  if (!isTuple(obj))
    throw TypeError(`expected obj ${obj} to be a tuple`);

  return obj.fst;
}

/**
 * Takes the second element of a tuple
 * @param {tuple} obj - tuple
 * @returns {*}
 */
const snd = obj => {
  if (!isTuple(obj))
    throw TypeError(`expected obj ${obj} to be a tuple`);

  return obj.snd;
}

export {
  concat,
  drop,
  emptyList,
  fst,
  head,
  isDigit,
  isEmpty,
  isList,
  isNonEmpty,
  isTuple,
  isFunction,
  list,
  listToArray,
  listToArrayRecursively,
  map,
  fmap,
  filter,
  otherwise,
  piecewise,
  snd,
  tail,
  take,
  tuple,
  curry,
  recursiveList,
  isString,
  dropWhile,
  equals,
  max
}