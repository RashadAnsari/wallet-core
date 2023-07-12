module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    'no-constant-condition': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
  },
};
