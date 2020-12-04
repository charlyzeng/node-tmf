const {
  spyableFlag,
  typeErrorMsg,
  unspyableMsg,
} = require('./const');

const { toString } = Object.prototype;

/**
 * 确认目标函数是可以监听的
 *
 * @param {function} func 目标函数
 */
function ensureSpyable(func) {
  if (typeof func !== 'function') {
    throw new TypeError(typeErrorMsg);
  }
  if (func[spyableFlag] !== true) {
    throw new Error(unspyableMsg);
  }
  return true;
}

/**
 * 获取类型说
 *
 * @param {*} target 待获取类型的数据
 * @returns {string}
 */
function getTypeSymbol(target) {
  const str = toString.call(target);
  return str.substr(8, str.length - 9);
}

module.exports = {
  ensureSpyable,
  getTypeSymbol,
};
