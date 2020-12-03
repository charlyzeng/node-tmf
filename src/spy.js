const {
  spyFlagKey,
  spyInfoKey,
} = require('./const');

function spy(func) {
  // eslint-disable-next-line no-param-reassign
  func[spyFlagKey] = true;
  return func[spyInfoKey];
}

module.exports = spy;
