/**
 * 注入到每个 commonjs 模块尾部的代码，在此文件的顶级命名空间的所有
 * 变量均需以`$tmf`开头，以避免命名冲突。
 */

/* eslint-disable no-param-reassign */
// 记录本模块中每个已被间谍的函数的集合
const $tmfFlagSet = new WeakSet();

const $tmfMockKey = '__tmfMock';
const $tmfSpyFlagKey = '__tmfSpyFlag';
const $tmfSpyInfoKey = '__tmfSpyInfo';
const $tmfSpyableFlag = '__tmfSpyableFlag';

function $tmfIsFunction(target) {
  return typeof target === 'function';
}

function $tmfIsObject(target) {
  return typeof target === 'object' && target !== null;
}

function $tmfGetInitSpyInfo(target) {
  return {
    called: false,
    callCount: 0,
    callArgs: [],
    lastCallArgs: [],
    returnValues: [],
    lastReturnValue: undefined,
    restore() {
      $tmfFlagSet.delete(target);
      delete target[$tmfSpyInfoKey];
      delete target[$tmfMockKey];
    },
  };
}

function $tmfWrapFunc(func) {
  return new Proxy(func, {
    apply(target, thisArg, args) {
      const mockFunc = target[$tmfMockKey];
      const funcToCall = mockFunc || target;
      const returnValue = funcToCall.apply(thisArg, args);
      const isSpied = $tmfFlagSet.has(target);
      if (isSpied) {
        const spyInfo = target[$tmfSpyInfoKey];
        spyInfo.called = true;
        spyInfo.callCount += 1;
        spyInfo.callArgs.push(args);
        spyInfo.lastCallArgs = args;
        spyInfo.returnValues.push(returnValue);
        spyInfo.lastReturnValue = returnValue;
      }

      return returnValue;
    },
    set(target, prop, value) {
      if (prop === $tmfSpyFlagKey && value === true) {
        $tmfFlagSet.add(target);
        Object.defineProperty(target, $tmfSpyInfoKey, {
          value: $tmfGetInitSpyInfo(target),
          configurable: true,
        });
      } else if (prop === $tmfMockKey && $tmfIsFunction(value)) {
        $tmfFlagSet.add(target);
        Object.defineProperty(target, $tmfMockKey, {
          value,
          configurable: true,
        });
        Object.defineProperty(target, $tmfSpyInfoKey, {
          value: $tmfGetInitSpyInfo(target),
          configurable: true,
        });
      } else {
        return Reflect.set(target, prop, value);
      }
    },
    get(target, prop, receiver) {
      // 已被 Proxy 包装过的函数，该字段才为 true, 标识函数是否可以被间谍
      if (prop === $tmfSpyableFlag) {
        return true;
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

// 默认最多递归5层
let $TMF_MAX_DEPTH = 5;
// 可通过环境变量设置
if (parseInt(process.env.TMF_MAX_DEPTH, 10) > 0) {
  $TMF_MAX_DEPTH = parseInt(process.env.TMF_MAX_DEPTH, 10);
}
function $tmfWrapFuncByRecurse(target, depth) {
  depth = depth || 1;
  if (depth > $TMF_MAX_DEPTH) {
    return;
  }
  const keys = Object.keys(target);
  let key;
  for (let i = 0; i < keys.length; i += 1) {
    key = keys[i];
    if ($tmfIsFunction(target[key])) {
      const { configurable } = Object.getOwnPropertyDescriptor(target, key);
      if (configurable) {
        Object.defineProperty(target, key, {
          value: $tmfWrapFunc(target[key]),
        });
      }
      $tmfWrapFuncByRecurse(target[key], depth + 1);
    } else if ($tmfIsObject(target[key])) {
      $tmfWrapFuncByRecurse(target[key], depth + 1);
    }
  }
}

const $tmfModuleExports = module.exports;
if ($tmfIsFunction($tmfModuleExports)) {
  $tmfWrapFuncByRecurse($tmfModuleExports);
  module.exports = $tmfWrapFunc($tmfModuleExports);
} else if ($tmfIsObject($tmfModuleExports)) {
  $tmfWrapFuncByRecurse($tmfModuleExports);
}
