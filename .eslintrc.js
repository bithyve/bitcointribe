module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': [ 'react', '@typescript-eslint' ],
  'rules': {
    'no-case-declarations': 'off',
    'no-fallthrough': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-empty-pattern': 'off',
    'eslint-disable no-case-declarations': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'computed-property-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'space-in-parens': [ 'error', 'always' ],
    'quotes': [ 'error', 'single' ],

    'comma-spacing': [ 'error', {
      'before': false, 'after': true
    } ],

    'semi': [ 'error', 'never' ],

    'indent': [ 'error', 2, {
      'SwitchCase': 2
    } ],
    'object-curly-newline': [ 'error', {
      'ObjectExpression': 'always',
      'ObjectPattern': {
        'multiline': true
      }
    } ],
    'eol-last': [ 'error', 'always' ],
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'prefer-const': [ 'warn', {
      'destructuring': 'all',
      'ignoreReadBeforeAssign': true
    } ],
  }
}
