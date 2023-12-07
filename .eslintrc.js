module.exports = {
    env: {
        es6: true, // sets the 'ecmaVersion' parser option to 6
        node: true
    },
    extends: ['eslint:recommended'],
    plugins: ['import'],
    rules: {
        'no-console': 0,
        'no-control-regex': 0,
        'no-regex-spaces': 0,
        'block-scoped-var': 1,
        'no-eval': 1,
        'no-extra-bind': 1,
        'no-new-func': 2,
        'no-new-wrappers': 2,
        'no-new': 1,
        'no-octal-escape': 1,
        'no-proto': 2,
        'no-throw-literal': 2,
        'no-shadow': [2, {builtinGlobals: false, hoist: 'all', allow: ['context','next']}],
        'no-use-before-define': [2, {functions: false}],
        'new-cap': [2, {capIsNew: false}],
        'no-array-constructor': 2,
        'no-lonely-if': 1,
        'no-unneeded-ternary': 1,
        'spaced-comment': [1, 'always', {markers: ['*']}],
        'no-var': 1,
        'prefer-const': 1,
        'semi':1,
        'import/no-unresolved': [2, {commonjs: true, caseSensitive: true, ignore: ['webos-service']}],
        'import/named': 2,
        'import/first': 1,
        'import/no-duplicates': 2,
        eqeqeq: [1, 'smart']
    },
    globals: {
        'afterAll': false,
        'afterEach': false,
        'beforeAll': false,
        'beforeEach': false,
        'describe': false,
        'expect': false,
        'it': false,
        'pending': false,
        'jasmine': false,
        'fail': false
    },
    "parserOptions": {
        "ecmaVersion": 2017
    }
};
