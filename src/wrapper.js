/* eslint-disable no-param-reassign */
const $tfmSpyFlagMap = new Map();
const $tfmSpyInfoMap = new Map();

const $tfmSpyFlagKey = '__tfmSpyFlag';
const $tfmSpyInfoKey = '__tfmSpyInfo';
const $tfmMockKey = '__tfmMock';

const { defineProperty } = Object;
Object.defineProperty = function (target, prop, descriptor) {
  return defineProperty.call(Object, target, prop, {
    ...descriptor,
    enumerable: true,
  });
};

function isFunction(target) {
  return typeof target === 'function';
}

function isObject(target) {
  return typeof target === 'object' && target !== null;
}

function getInitSpyInfo(target) {
  return {
    called: true,
    callCount: 0,
    callArgs: [],
    lastCallArgs: [],
    returnValues: [],
    lastReturnValue: undefined,
    restore() {
      $tfmSpyFlagMap.delete(target);
      delete target[$tfmSpyInfoKey];
      delete target[$tfmMockKey];
    },
  };
}

function $tfmWrapFunc(func) {
  return new Proxy(func, {
    apply(target, thisArg, args) {
      const mockFunc = target[$tfmMockKey];
      const funcToCall = mockFunc || target;

      const returnValue = funcToCall.apply(thisArg, args);
      const isSpied = $tfmSpyFlagMap.get(target);
      if (isSpied) {
        const spyInfo = target[$tfmSpyInfoKey];
        spyInfo.callCount += 1;
        spyInfo.callArgs.push(args);
        spyInfo.lastCallArgs = args;
        spyInfo.returnValues.push(returnValue);
        spyInfo.lastReturnValue = returnValue;
      }

      return returnValue;
    },
    set(target, prop, value) {
      if (prop === $tfmSpyFlagKey && value === true) {
        $tfmSpyFlagMap.set(target, true);
        Object.defineProperty(target, $tfmSpyInfoKey, {
          value: getInitSpyInfo(target),
          configurable: true,
        });
      } else if (prop === $tfmMockKey && isFunction(value)) {
        $tfmSpyFlagMap.set(target, true);
        Object.defineProperty(target, $tfmMockKey, {
          value,
          configurable: true,
        });
        Object.defineProperty(target, $tfmSpyInfoKey, {
          value: getInitSpyInfo(target),
          configurable: true,
        });
      } else {
        return Reflect.set(target, prop, value);
      }
    },
  });
}

function wrapAllChildFunc(target) {
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i += 1) {
    if (isFunction(target[keys[i]])) {
      Object.defineProperty(target, keys[i], {
        value: $tfmWrapFunc(target[keys[i]]),
      });
    }
  }
}

const out = module.exports;
if (isFunction(out)) {
  wrapAllChildFunc(out);
  module.exports = $tfmWrapFunc(module.exports);
  Object.defineProperty(module.exports, '__tfmSpyInfoMap', {
    value: $tfmSpyInfoMap,
  });
} else if (isObject(out)) {
  wrapAllChildFunc(out);
  Object.defineProperty(module.exports, '__tfmSpyInfoMap', {
    value: $tfmSpyInfoMap,
  });
}
