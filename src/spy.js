const {
  spyFlagKey,
  spyInfoKey,
} = require('./const');
const {
  ensureSpyable,
} = require('./util');

function spy(func) {
  ensureSpyable(func);
  // eslint-disable-next-line no-param-reassign
  func[spyFlagKey] = true;
  return func[spyInfoKey];
}

module.exports = spy;
