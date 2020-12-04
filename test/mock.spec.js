const assert = require('power-assert');
const deep6 = require('./cases/deep6');
const { mock } = require('../lib');

describe('mock test', () => {
  it('TMF_MAX_DEPTH env param should work', () => {
    assert.equal(
      deep6.nest1.nest2.nest3.nest4.nest5.nest6(),
      'nest6',
    );
    const mockNest6 = mock(
      deep6.nest1.nest2.nest3.nest4.nest5.nest6,
      () => 'mock nest6',
    );
    assert.equal(
      deep6.nest1.nest2.nest3.nest4.nest5.nest6(),
      'mock nest6',
    );
    mockNest6.restore();
    assert.equal(
      deep6.nest1.nest2.nest3.nest4.nest5.nest6(),
      'nest6',
    );
  });
});
