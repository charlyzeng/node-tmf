const $tfmSpyFlagMap = new Map();
const $tfmSpyInfoMap = new Map();

const spyInfoKey = '__tfmSpyInfo';

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

function $tfmWrapFunc(func) {
  return new Proxy(func, {
    apply(target, thisArg, args) {
      const returnValue = target.apply(thisArg, args);
      const isSpied = $tfmSpyFlagMap.get(target);
      if (isSpied) {
        // const spyInfo = $tfmSpyInfoMap.get(target) || {
        //   called: true,
        //   callCount: 0,
        //   callArgs: [],
        //   lastCallArgs: [],
        //   returnValues: [],
        //   lastReturnValue: undefined,
        // };
        // spyInfo.callCount += 1;
        // spyInfo.callArgs.push(args);
        // spyInfo.lastCallArgs = args;
        // spyInfo.returnValues.push(returnValue);
        // spyInfo.lastReturnValue = returnValue;
        // $tfmSpyInfoMap.set(target, spyInfo);

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
      if (prop === '__tfmSpy' && value === true) {
        $tfmSpyFlagMap.set(target, true);
        const spyInfo = {
          called: true,
          callCount: 0,
          callArgs: [],
          lastCallArgs: [],
          returnValues: [],
          lastReturnValue: undefined,
          restore() {
            $tfmSpyFlagMap.delete(target);
          },
        };
        Object.defineProperty(target, spyInfoKey, {
          value: spyInfo,
          configurable: true,
        });
      } else if (prop === '__tfmSpy' && value === false) {
        $tfmSpyFlagMap.delete(target);
      } else if (prop === '__tfmMock' && isFunction(value)) {
        $tfmSpyFlagMap.set(target, true);
        Object.defineProperty(target, prop, {
          value,
          configurable: true,
        });
      } else if (prop === '__tfmMock' && value === null) {
        $tfmSpyFlagMap.delete(target);
        Object.defineProperty(target, prop, {
          value: target,
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
