const webpack = require('webpack');
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

const jsConf = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        background: './src/js/App.js',
        start: './src/js/pages/start.js',
        popup: './src/js/pages/popup.js',
        'content-script': './src/js/ContentScript/ContentScript.js'
    },
    output: {
        path: path.join(__dirname, '/extension/static/js/'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                use: "vue-loader"
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/transform-runtime']
                    }
                }
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            {
                test: /\.svg$/,
                loader: 'vue-svg-loader',
            },
        ]
    },
    resolve: {
        extensions: [
            '.js',
            '.vue'
        ],
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};

const cssConf = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        start: './src/scss/start.scss',
        popup: './src/scss/popup.scss'
    },
    output: {
        path: path.join(__dirname, '/extension/static/css/'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
    ],
};

module.exports = [cssConf, jsConf];