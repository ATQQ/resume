module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:react/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 'off',
    'no-use-before-define': 'off',
    'consistent-return': 'off',
    'no-restricted-syntax': 'off',
    'no-shadow': 'off',
    'new-cap': 'warn',
    'no-underscore-dangle': 'warn',
    'no-loop-func': 'warn',
    'import/prefer-default-export': 'warn',
    'no-param-reassign': 'warn',
    semi: ['error', 'never'],
  },
}
