const {
  mockKey,
  spyInfoKey,
} = require('./const');
const {
  ensureSpyable,
  getTypeSymbol,
} = require('./util');

const asyncFunc = async function () {};
const generatorFunc = function* () {};
const commonFunc = function () {};

function getDefaultMockFunc(originFunc) {
  const typeSymbol = getTypeSymbol(originFunc);
  switch (typeSymbol) {
    case 'AsyncFunction':
      return asyncFunc;
    case 'GeneratorFunction':
      return generatorFunc;
    default:
      return commonFunc;
  }
}

function mock(originFunc, mockFunc) {
  ensureSpyable(originFunc);
  // eslint-disable-next-line no-param-reassign
  originFunc[mockKey] = mockFunc || getDefaultMockFunc(originFunc);
  return originFunc[spyInfoKey];
}

module.exports = mock;
