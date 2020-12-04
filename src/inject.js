const fs = require('fs');
const path = require('path');
const Module = require('module');

const wrapperTail = fs
  .readFileSync(path.resolve(__dirname, './wrapper.js'), 'utf-8');

// 覆盖内置模块 Module 的 wrapper 属性，这样可以自定义 commonjs 模块的包装方式。
// 这里是修改在尾部注入一段代码，具体代码为 wrapper.js 文件的内容。
Module.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  `${wrapperTail}\n});`,
];

