module.exports = {
    root: true,
    env: {
        node: true,
        webextensions: true
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        '@vue/prettier',
        '@vue/prettier/@typescript-eslint'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
                singleQuote: true
            }
        ],
        '@typescript-eslint/camelcase': 'off',
        'no-console': 'off'
    }
}
