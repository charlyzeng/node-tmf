const mockKey = '__tmfMock';
const spyFlagKey = '__tmfSpyFlag';
const spyInfoKey = '__tmfSpyInfo';
const spyableFlag = '__tmfSpyableFlag';
const typeErrorMsg = 'the target function must be typeof function';
const unspyableMsg = 'the target function can not be spied or mocked, it may because it is not exported by module, or exported with unconfigurable, or exported nest is too deep';

module.exports = {
  mockKey,
  spyFlagKey,
  spyInfoKey,
  spyableFlag,
  typeErrorMsg,
  unspyableMsg,
};
