module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true,
  },
  extends: [
    '@tencent/eslint-config-tencent',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    // 覆盖`@tencent/eslint-config-tencent`中默认规则
    indent: 'error',
    quotes: 'error',
  },
};
