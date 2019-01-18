module.exports = {
    root: true,
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module'
    },
    extends: 'airbnb-base',
    env: {
      browser: true,
      node: true
    },
    rules: {
      'no-new': 0,
      'global-require':  0,
      'no-restricted-globals': 0,
      'consistent-return': 0,
      'no-underscore-dangle': 0,
      'linebreak-style': 0,
      'no-console': 0,
      'semi': [2, 'never'],
      'prefer-template': 0,
      'operator-linebreak': [2, 'after', { 'overrides': { '?': 'before' } }],
      'comma-dangle': ['error', {
          arrays: 'never',
          objects: 'never',
          imports: 'never',
          exports: 'never',
          functions: 'ignore'
      }],
      'arrow-body-style': [0, 'as-needed'],
      'no-param-reassign': ['error', { props: false }],
      'prefer-destructuring': ['error', {
          array: false,
          object: false
      }, {
          enforceForRenamedProperties: false
      }],
      'prefer-const': 0,
      'arrow-parens': ['error', 'as-needed'],
      'no-shadow': 0,
      'no-param-reassign': 0,
      'no-plusplus': 0,
      'no-lonely-if': 0,
      'no-useless-concat': 0
    }
  }
  