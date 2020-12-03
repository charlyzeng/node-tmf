/* eslint-disable no-param-reassign */
(function () {
  const flagMap = new Map();

  const mockKey = '__tfmMock';
  const spyFlagKey = '__tfmSpyFlag';
  const spyInfoKey = '__tfmSpyInfo';

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
        flagMap.delete(target);
        delete target[spyInfoKey];
        delete target[mockKey];
      },
    };
  }

  function wrapFunc(func) {
    return new Proxy(func, {
      apply(target, thisArg, args) {
        const mockFunc = target[mockKey];
        const funcToCall = mockFunc || target;

        const returnValue = funcToCall.apply(thisArg, args);
        const isSpied = flagMap.get(target);
        if (isSpied) {
          const spyInfo = target[spyInfoKey];
          spyInfo.callCount += 1;
          spyInfo.callArgs.push(args);
          spyInfo.lastCallArgs = args;
          spyInfo.returnValues.push(returnValue);
          spyInfo.lastReturnValue = returnValue;
        }

        return returnValue;
      },
      set(target, prop, value) {
        if (prop === spyFlagKey && value === true) {
          flagMap.set(target, true);
          Object.defineProperty(target, spyInfoKey, {
            value: getInitSpyInfo(target),
            configurable: true,
          });
        } else if (prop === mockKey && isFunction(value)) {
          flagMap.set(target, true);
          Object.defineProperty(target, mockKey, {
            value,
            configurable: true,
          });
          Object.defineProperty(target, spyInfoKey, {
            value: getInitSpyInfo(target),
            configurable: true,
          });
        } else {
          return Reflect.set(target, prop, value);
        }
      },
    });
  }

  const MAX_DEPTH = 5; // 最多递归5层
  function wrapFuncByRecurse(target, depth) {
    depth = depth || 1;
    if (depth > MAX_DEPTH) {
      return;
    }
    const keys = Object.keys(target);
    let key;
    for (let i = 0; i < keys.length; i += 1) {
      key = keys[i];
      if (isFunction(target[key])) {
        Object.defineProperty(target, key, {
          value: wrapFunc(target[key]),
        });
        wrapFuncByRecurse(target[key], depth + 1);
      } else if (isObject(target[key])) {
        wrapFuncByRecurse(target[key], depth + 1);
      }
    }
  }

  const output = module.exports;
  if (isFunction(output)) {
    wrapFuncByRecurse(output);
    module.exports = wrapFunc(output);
  } else if (isObject(output)) {
    wrapFuncByRecurse(output);
  }
}());
