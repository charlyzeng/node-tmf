const { spyableFlag } = require('./const');

const { toString } = Object.prototype;

function ensureSpyable(func) {
  if (typeof func !== 'function') {
    throw new TypeError('the target function must be typeof function');
  }
  if (func[spyableFlag] !== true) {
    throw new Error('the target function can not be spied or mocked, it may because it is not exported by module, or exported with unconfigurable, or exported nest is too deep');
  }
  return true;
}

function getTypeSymbol(target) {
  const str = toString.call(target);
  return str.substr(8, str.length - 9);
}

module.exports = {
  ensureSpyable,
  getTypeSymbol,
};
