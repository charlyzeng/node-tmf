const {
  mockKey,
  spyInfoKey,
} = require('./const');

function mock(originFunc, mockFunc) {
  // eslint-disable-next-line no-param-reassign
  originFunc[mockKey] = mockFunc;
  // Object.defineProperty(originFunc, mockKey, {
  //   value: mockFunc,
  //   configurable: true,
  // });
  return originFunc[spyInfoKey];
}

module.exports = mock;
