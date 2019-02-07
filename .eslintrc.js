module.exports = {
    extends: [
        'airbnb-base',
        'plugin:vue/recommended',
    ],
    parserOptions: {
        "parser": "babel-eslint",
    },
    rules: {
        "indent": "off",
        "vue/script-indent": "off",
        "padded-blocks": ['error', { blocks: 'never', classes: 'always', switches: 'never' }],
        "no-unused-expressions": ['error', { allowShortCircuit: true }],
        "no-underscore-dangle": "off",
        "class-methods-use-this": "off",
        "max-len": "off",
        "no-return-assign": "off",

        "vue/html-indent": ["error", 4],
        "vue/max-attributes-per-line": "off",
        "vue/no-v-html": "off",
        "vue/singleline-html-element-content-newline": "off",
    },
    env: {
        "webextensions": true,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.vue']
            }
        },
    },
};