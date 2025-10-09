module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'no-underscore-dangle': ['error', { allowAfterThis: true, allow: ['_directories'] }],
    'class-methods-use-this': 'off',
    'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
};
