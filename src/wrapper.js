/* eslint-disable no-param-reassign */
const $tfmFlagMap = new Map();

const $tfmMockKey = '__tfmMock';
const $tfmSpyFlagKey = '__tfmSpyFlag';
const $tfmSpyInfoKey = '__tfmSpyInfo';

function $tfmIsFunction(target) {
  return typeof target === 'function';
}

function $tfmIsObject(target) {
  return typeof target === 'object' && target !== null;
}

function $tfmGetInitSpyInfo(target) {
  return {
    called: true,
    callCount: 0,
    callArgs: [],
    lastCallArgs: [],
    returnValues: [],
    lastReturnValue: undefined,
    restore() {
      $tfmFlagMap.delete(target);
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
      const isSpied = $tfmFlagMap.get(target);
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
        $tfmFlagMap.set(target, true);
        Object.defineProperty(target, $tfmSpyInfoKey, {
          value: $tfmGetInitSpyInfo(target),
          configurable: true,
        });
      } else if (prop === $tfmMockKey && $tfmIsFunction(value)) {
        $tfmFlagMap.set(target, true);
        Object.defineProperty(target, $tfmMockKey, {
          value,
          configurable: true,
        });
        Object.defineProperty(target, $tfmSpyInfoKey, {
          value: $tfmGetInitSpyInfo(target),
          configurable: true,
        });
      } else {
        return Reflect.set(target, prop, value);
      }
    },
  });
}

const $TFM_MAX_DEPTH = 5; // 最多递归5层
function $tfmWrapFuncByRecurse(target, depth) {
  depth = depth || 1;
  if (depth > $TFM_MAX_DEPTH) {
    return;
  }
  const keys = Object.keys(target);
  let key;
  for (let i = 0; i < keys.length; i += 1) {
    key = keys[i];
    if ($tfmIsFunction(target[key])) {
      const { configurable } = Object.getOwnPropertyDescriptor(target, key);
      if (configurable) {
        Object.defineProperty(target, key, {
          value: $tfmWrapFunc(target[key]),
        });
      }
      $tfmWrapFuncByRecurse(target[key], depth + 1);
    } else if ($tfmIsObject(target[key])) {
      $tfmWrapFuncByRecurse(target[key], depth + 1);
    }
  }
}

const $tfmModuleExports = module.exports;
if ($tfmIsFunction($tfmModuleExports)) {
  $tfmWrapFuncByRecurse($tfmModuleExports);
  module.exports = $tfmWrapFunc($tfmModuleExports);
} else if ($tfmIsObject($tfmModuleExports)) {
  $tfmWrapFuncByRecurse($tfmModuleExports);
}
