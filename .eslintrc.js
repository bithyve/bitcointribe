module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [ 'react', '@typescript-eslint' ],
  rules: {
    'space-in-brackets': [ 'error', 'always', {
      'singleValue': true,
      'objectsInArrays': true,
      'arraysInArrays': true,
      'arraysInObjects': true,
      'objectsInObjects': true,
      'propertyName': true
    } ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'space-in-parens': [ 'error', 'always' ],
    'quotes': [ 'error', 'single' ]
  }
}
