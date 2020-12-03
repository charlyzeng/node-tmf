const {
  spyFlagKey,
  spyInfoKey,
} = require('./const');

function spy(func) {
  // eslint-disable-next-line no-param-reassign
  // Object.defineProperty(func, spyFlagKey, {
  //   value: true,
  //   configurable: true,
  // });
  func[spyFlagKey] = true;
  return func[spyInfoKey];
}

module.exports = spy;
