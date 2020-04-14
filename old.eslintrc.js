module.exports = {
    root: true,
    extends: [
        // 'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'airbnb-base',
        'plugin:vue/recommended',
        '@vue/typescript',
    ],
    plugins: ['@typescript-eslint'],
    /* parser: "@typescript-eslint/parser",

    parserOptions: {
        "parser": "babel-eslint",
    }, */
    rules: {
        indent: ['error', 4],
        semi: ['error', 'never'],

        'vue/script-indent': 'off',
        'padded-blocks': ['error', { blocks: 'never', classes: 'always', switches: 'never' }],
        'no-unused-expressions': ['error', { allowShortCircuit: true }],
        'no-underscore-dangle': 'off',
        'class-methods-use-this': 'off',
        'max-len': 'off',
        'no-return-assign': 'off',

        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': 'off',
        'vue/no-v-html': 'off',
        'vue/singleline-html-element-content-newline': 'off',

        '@typescript-eslint/rule-name': 'error',

        'no-debug': 'error',
    },
    env: {
        webextensions: true,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.vue'],
            },
        },
    },
}
