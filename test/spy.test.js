const assert = require('power-assert');
const sum = require('./mod1');
const { mul } = sum;
const { spy } = require('../src');

describe('spy test', () => {
  it('spy for module when exports is function', () => {
    let spySum = spy(sum);

    assert.equal(spySum.called, false);
    assert.equal(sum(1, 2), 3);
    assert.equal(sum(3, 4), 7);
    assert(spySum.called);
    assert.equal(spySum.callCount, 2);
    assert.deepEqual(spySum.callArgs, [[1, 2], [3, 4]]);
    assert.deepEqual(spySum.lastCallArgs, [3, 4]);
    assert.deepEqual(spySum.returnValues, [3, 7]);
    assert.deepEqual(spySum.lastReturnValue, 7);
    spySum.restore();

    spySum = spy(sum);
    assert.equal(spySum.called, false);
    assert(sum(5, 6), 11);
    assert(sum(7, 8), 15);
    assert(sum(9, 10), 19);
    assert(spySum.called);
    assert.equal(spySum.callCount, 3);
    assert.deepEqual(spySum.callArgs, [[5, 6], [7, 8], [9, 10]]);
    assert.deepEqual(spySum.lastCallArgs, [9, 10]);
    assert.deepEqual(spySum.returnValues, [11, 15, 19]);
    assert.deepEqual(spySum.lastReturnValue, 19);
  });

  it('spy for module when exports[prop] is function', () => {
    let spyMul = spy(mul);

    assert.equal(spyMul.called, false);
    assert.equal(mul(1, 2), 2);
    assert.equal(mul(3, 4), 12);
    assert(spyMul.called);
    assert.equal(spyMul.callCount, 2);
    assert.deepEqual(spyMul.callArgs, [[1, 2], [3, 4]]);
    assert.deepEqual(spyMul.lastCallArgs, [3, 4]);
    assert.deepEqual(spyMul.returnValues, [2, 12]);
    assert.deepEqual(spyMul.lastReturnValue, 12);
    spyMul.restore();

    spyMul = spy(mul);
    assert.equal(spyMul.called, false);
    assert(mul(5, 6), 30);
    assert(mul(7, 8), 56);
    assert(mul(9, 10), 90);
    assert(spyMul.called);
    assert.equal(spyMul.callCount, 3);
    assert.deepEqual(spyMul.callArgs, [[5, 6], [7, 8], [9, 10]]);
    assert.deepEqual(spyMul.lastCallArgs, [9, 10]);
    assert.deepEqual(spyMul.returnValues, [30, 56, 90]);
    assert.deepEqual(spyMul.lastReturnValue, 90);
  });
});
