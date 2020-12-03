function spy(func) {
  const key = '__tfmSpy';
  const key2 = '__tfmSpyInfo';
  // eslint-disable-next-line no-param-reassign
  func[key] = true;
  return func[key2];
}

module.exports = spy;
