const {
  spyableFlag,
  typeErrorMsg,
  unspyableMsg,
} = require('./const');

const { toString } = Object.prototype;

function ensureSpyable(func) {
  if (typeof func !== 'function') {
    throw new TypeError(typeErrorMsg);
  }
  if (func[spyableFlag] !== true) {
    throw new Error(unspyableMsg);
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
