const {
  mockKey,
  spyInfoKey,
} = require('./const');

function mock(originFunc, mockFunc) {
  // eslint-disable-next-line no-param-reassign
  originFunc[mockKey] = mockFunc;
  return originFunc[spyInfoKey];
}

module.exports = mock;
