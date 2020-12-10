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
      'multiline': true 
    }, {
      'ObjectExpression': 'always',
      'ObjectPattern': {
        'multiline': true 
      },
      'ExportDeclaration': {
        'multiline': true, 'minProperties': 3 
      }
    } ]
  }
}
