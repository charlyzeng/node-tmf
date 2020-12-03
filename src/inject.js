const fs = require('fs');
const path = require('path');
const Module = require('module');

const wrapperTail = fs
  .readFileSync(path.resolve(__dirname, './wrapper.js'), 'utf-8');

Module.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  `${wrapperTail}\n});`,
];

