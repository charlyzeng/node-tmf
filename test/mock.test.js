const assert = require('power-assert');
const sum = require('./cases/mod1');
const { mul } = sum;
const asyncFunc = require('./cases/async');
const generatorFunc = require('./cases/generator');
const deep5 = require('./cases/deep5');
const deep6 = require('./cases/deep6');
const { unspyableMsg } = require('../lib/const');
const { mock } = require('../lib');

describe('mock test', () => {
  it('mock for module when exports is function', () => {
    const mockSum = mock(sum, (a, b) => a + b + 10);

    assert.equal(mockSum.called, false);
    assert.equal(sum(1, 2), 13);
    assert.equal(sum(3, 4), 17);
    assert(mockSum.called);
    assert.equal(mockSum.callCount, 2);
    assert.deepEqual(mockSum.callArgs, [[1, 2], [3, 4]]);
    assert.deepEqual(mockSum.lastCallArgs, [3, 4]);
    assert.deepEqual(mockSum.returnValues, [13, 17]);
    assert.deepEqual(mockSum.lastReturnValue, 17);
    mockSum.restore();

    assert.equal(sum(1, 2), 3);
    assert.equal(sum(3, 4), 7);
  });

  it('mock for module when exports[prop] is function', () => {
    const spyMul = mock(mul, (a, b) => a * b * 10);

    assert.equal(spyMul.called, false);
    assert.equal(mul(1, 2), 20);
    assert.equal(mul(3, 4), 120);
    assert(spyMul.called);
    assert.equal(spyMul.callCount, 2);
    assert.deepEqual(spyMul.callArgs, [[1, 2], [3, 4]]);
    assert.deepEqual(spyMul.lastCallArgs, [3, 4]);
    assert.deepEqual(spyMul.returnValues, [20, 120]);
    assert.deepEqual(spyMul.lastReturnValue, 120);
    spyMul.restore();

    assert.equal(mul(1, 2), 2);
    assert.equal(mul(3, 4), 12);
  });

  it('mock should have an right default func', async () => {
    assert.equal(sum(1, 2), 3);
    const mockSum = mock(sum);
    assert.equal(sum(1, 2), undefined);
    mockSum.restore();
    assert.equal(sum(1, 2), 3);

    assert.equal(await asyncFunc(), 'async');
    const mockAsyncFunc = mock(asyncFunc);
    const asyncResult = asyncFunc();
    const asyncValue = await asyncResult;
    assert.ok(asyncResult, Promise);
    assert.equal(asyncValue, undefined);
    mockAsyncFunc.restore();
    assert.equal(await asyncFunc(), 'async');

    let originGeneratorResult = generatorFunc();
    assert.deepEqual(originGeneratorResult.next(), {
      done: false,
      value: 1,
    });
    assert.deepEqual(originGeneratorResult.next(), {
      done: false,
      value: 2,
    });
    assert.deepEqual(originGeneratorResult.next(), {
      done: true,
      value: 3,
    });
    const mockGeneratorFunc = mock(generatorFunc);
    const generatorResult = generatorFunc();
    assert.deepEqual(generatorResult.next(), {
      done: true,
      value: undefined,
    });
    mockGeneratorFunc.restore();
    originGeneratorResult = generatorFunc();
    assert.deepEqual(originGeneratorResult.next(), {
      done: false,
      value: 1,
    });
    assert.deepEqual(originGeneratorResult.next(), {
      done: false,
      value: 2,
    });
    assert.deepEqual(originGeneratorResult.next(), {
      done: true,
      value: 3,
    });
  });

  it('should work when the target depth is 5', () => {
    assert.equal(deep5.nest1.nest2.nest3.nest4.nest5(), 'nest5');
    const mockNest5 = mock(
      deep5.nest1.nest2.nest3.nest4.nest5,
      () => 'mock nest5',
    );
    assert.equal(deep5.nest1.nest2.nest3.nest4.nest5(), 'mock nest5');
    mockNest5.restore();
    assert.equal(deep5.nest1.nest2.nest3.nest4.nest5(), 'nest5');
  });

  it('should throw an error when the target depth is 6', () => {
    assert.throws(
      () => mock(deep6.nest1.nest2.nest3.nest4.nest5.nest6),
      {
        message: unspyableMsg,
      },
    );
  });
});
