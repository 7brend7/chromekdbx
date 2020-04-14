module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "webextensions": true
    },
    "extends": [
        "plugin:vue/essential",
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "parser": "@typescript-eslint/parser",
        "sourceType": "module"
    },
    "plugins": [
        "vue",
        "@typescript-eslint"
    ],
    "rules": {
        "indent": ["error", 4],
        "semi": ["error", "never"],
        "max-len": ["error", { "code": 180 }],
        "import/extensions": ["error", "never"],
        "no-unused-vars": "off",
        "no-async-promise-executor": "off",
        'no-unused-expressions': ['error', { allowShortCircuit: true }],
    },
    "settings": {
        "import/resolver": {
            "node": {
                extensions: ['.js', '.vue', '.ts'],
                paths: ['./src']
            }
        }
    }
};
