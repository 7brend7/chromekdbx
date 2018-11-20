const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        background: './src/background.js'
    },
    output: {
        path: path.join(__dirname, '/extension/static/js/'),
        filename: '[name].js'
    },
    module: {
        "rules": [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
}