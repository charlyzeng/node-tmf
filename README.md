- [node-tmf](#node-tmf)
- [为什么需要](#为什么需要)
- [示例](#示例)
- [安装](#安装)
  - [使用 npm](#使用-npm)
  - [使用 yarn](#使用-yarn)
- [使用方法](#使用方法)
  - [第一步](#第一步)
  - [第二步](#第二步)
- [API](#api)
  - [mock](#mock)
  - [spy](#spy)
  - [返回值`SpyInfo`说明](#返回值spyinfo说明)
- [局限性](#局限性)
  - [局限一](#局限一)
  - [局限二](#局限二)
  - [局限三](#局限三)
- [原理说明](#原理说明)
- [结语](#结语)

# node-tmf
全称 `node test module function`, 指用于在 Node 端对模块导出的函数做单元测试。

# 为什么需要
单元测试过程中，一般会 mock 掉不能正常运行的函数，比如数据库操作函数、网络请求函数。于此，常用的工具库有 sinon. 以下为一段示例：

```javascript
// user.js
const db = require('db');
exports.getUser = (userId) => {
  return db.queryUser(userId);
};

// user.test.js
const db = require('db');
const sinon = require('sinon');
const user = require('./user');

describe('user test', () => {
  it('#getUser()', () => {
    // mock 掉 db 对象中的 `getUser` 方法，使得在接下来的
    // 单元测试执行过程中真正的 `db.getUser` 不会被执行，
    // 这样就能保证即使没有数据库的支持，单元测试也能正常执行。
    const queryUser = sinon.stub(db, 'queryUser');
    const user = user.getUser(123);
    // 还原 mock
    queryUser.restore();

    // 确认`db.queryUser`确实被调用了
    assert.ok(queryUser.called);
    // 确认`db.queryUser`的入参是正确的
    assert.equal(queryUser.lastCallArguments, [123]);
  });
});
```

如上，我们一般是对对象的某个属性**方法**进行 mock, 如果某个方法恰巧就是模块默认导出函数，**没有挂载的父对象**，这种情况就难以处理。比如，简单修改以上的 `user.js`:

```javascript
// user.js
const queryUser = require('queryUser');
exports.getUser = (userId) => {
  return queryUser(userId);
};

// 或者
const { queryUser } = require('db');
exports.getUser = (userId) => {
  return queryUser(userId);
};
```

如上，这两种情况似乎就难以 mock. `node-tmf` 在这两种情况能发挥较大做用，在示例中说明。

# 示例
```javascript
// user.js
const queryUser = require('queryUser');
exports.getUser = (userId) => {
  return queryUser(userId);
};

// 或者
const { queryUser } = require('db');
exports.getUser = (userId) => {
  return queryUser(userId);
};

// user.test.js
const queryUser = require('queryUser');
// 或者如下，视具体情况而定。
const { queryUser } = require('db');

const { mock } = require('node-tmf');
const user = require('./user');

describe('user test', () => {
  it('#getUser()', () => {
    // 将指定的 `queryUser` mock 成你想要的函数，这样，原本真正对接数据库的
    // 函数将不会被执行。
    const mockQueryUser = mock(queryUser, () => ({ name: 'Tom' }));
    const user = user.getUser(123);
    // 还原 mock. 还原后，再次调用 `queryUser` 则又会执行真正的数据库调用。
    queryUser.restore();

    // 确认`queryUser`确实被调用了
    assert.ok(queryUser.called);
    // 确认`queryUser`的入参是正确的
    assert.equal(queryUser.lastCallArguments, [123]);
    // 确认 `queryUser` 的返回值符合预期。注意，这里的返回值是指 mock 后的
    // 函数的返回值
    assert.deepEqual(queryUser.lastReturnValue, { name: 'Tom' });
  });
});
```

# 安装

## 使用 npm
```shell
$ npm install node-tmf --save-dev
```

## 使用 yarn
```shell
$ yarn add node-tmf
```

# 使用方法
以 mocha 为例，需要分两步：

## 第一步
在单元测试运行程序中添加 `-r, --require` 参数。
```json
// package.json
{
  "scripts": {
    "test": "mocha -r node-tmf/lib/inject.js test/**/*.test.js"
  }
}
```

## 第二步
在单元测试代码中，引入 `node-tmf` 模块对目标方法机型 mock 或者 spy. 具体可参考示例。

# API
## mock
> `function(originFunc: Function, mockFunction?: Function): SpyInfo`

`mock` 函数用于将原函数 `originFunc` mock 成指定的 `mockFunction`. 当 `mockFunction` 为空时，则会为期分配一个默认的空函数。空函数的类型自动保持与 `originFunc` 类型一致，即 `Function`, `AsyncFunction`, 或者 `GeneratorFunction`.

返回说明：`mock` 方法返回的 `SpyInfo` 记录着函数的调用情况，具体参数见 [返回值SpyInfo说明](#返回值)

## spy
> `function(targetFunc: Function): SpyInfo`

`spy` 函数用于监听并收集目标函数 `targetFunc` 的执行信息，只是充当一个间谍函数。也就是说，原本的目标函数 `targetFunc` 逻辑仍然会被执行（mock 的则不会）。

返回说明：`spy` 方法返回的 `SpyInfo` 记录着函数的调用情况，具体参数见 [返回值SpyInfo说明](#返回值)

## 返回值`SpyInfo`说明
```javascript
{
  called: boolean,      // 函数是否被执行过
  callCount: number,    // 函数被执行次数
  callArgs: any[][],    // 按顺序记录函数每次执行时的入参
  lastCallArgs: any[],  // 函数最后一次执行时的入参
  returnValues: any[],  // 按照顺序记录函数每次执行的返回值
  lastReturnValue: any, // 函数最后一次执行的返回值
}
````

示例：

```javascript
// math.js
exports.add = (a, b) => a + b;

// math.test.js
const tmf = require('node-tmf');
const { add } = require('./math');

describe('math', () => {
  it('#add()', () => {
    const spyAdd = tmf.spy(add);
    assert.equal(add(1, 2), 3);
    assert.equal(add(3, 4), 7);
    assert.ok(spyAdd.called);
    assert.equal(spyAdd.callCount, 2);
    assert.deepEqual(spyAdd.callArgs, [[1, 2], [3, 4]]);
    assert.equal(spyAdd.lastCallArgs, [3, 4]);
    assert.equal(spyAdd.returnValues, [3, 7]);
    assert.equal(spyAdd.lastReturnValue, 7);
  });
});
```

# 局限性
## 局限一
不能 mock 或 spy 异步挂载的方法。例如，以下模块的 `add` 能够被 mock 和 spy, 但 `mul` 方法则不能被 mock 或 spy.
```javascript
exports.add = (a, b) => a + b;

setTimeout(() => {
  exports.sub = (a, b) => a - b;
});
```

## 局限二
使用 `Object.defineProperty` 方法并设置 `configurable: false` 的导出方法不能被 mock 或者 spy. 例如，以下模块的 `add` 能够被 mock 和 spy, 但 `mul` 方法则不能被 mock 或 spy.
```javascript
exports.add = (a, b) => a + b;

Object.defineProperty(exports, 'sub', {
  value: ((a, b) => a - b),
  configurable: false, // configurable 默认为 false
});
```
## 局限三
`node-tmf` 会限制导出函数的层级深度，最多五层。例如，以下 `funcInDepth5` 方法能够被 mock 或 spy, `funcInDepth6` 方法则不能。
```
module.exports = {
  nest1: {
    nest2: {
      nest3: {
        nest4: {
          funcInDepth5: () => 5,
          nest5: {
            funcInDepth6: () => 6,
          },
        },
      },
    },
  },
};
```

不过，你可以通过设置 `TMF_MAX_DEPTH` 环境变量，自定义最大层级深度。以上，可以通过设置 `TMF_MAX_DEPTH` 环境变量为 `6` 解决问题。

# 原理说明
`node-tmf` 通过覆盖 `Module.wrapper` 重写了 `require` 方法，在每个 `require` 的模块中注入了一段代码，这段代码会递归遍历本模块导出方法，并为其包装一层 `Proxy`, 通过 `Proxy` 截获函数的调用，并依赖其实现 `mock` 和 `spy` 方法。

# 结语
`node-tmf` 并不是一个完整的单元测试辅助库，它只是对一些极端情况的补充，实际情况中，一般是以 `sinon` 为主，`node-tmf` 为辅。对此，你可以把 `node-tmf` 当做是一个补丁，专门用于应付**模块默认导出函数，和源码中以解构形式导入函数**的极端情况。
