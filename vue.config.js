const path = require('path')
const RenameWebpackPlugin = require('rename-webpack-plugin')
const WebpackCleanPlugin = require('webpack-clean')

module.exports = {
    outputDir: path.join(__dirname, '/extension/static/dist/'),

    shouldExtractCss: true, // CUSTOM option, see patch file

    chainWebpack: config => {
        config.entryPoints.delete('app')
        config.optimization.delete('splitChunks')

        for (const name of ['html', 'preload', 'prefetch']) {
            if (config.plugins.has(name)) {
                config.plugins.delete(name)
            }
        }

        config.plugin('extract-css').tap(args => {
            return [
                {
                    filename: 'css/[name].css',
                    chunkFilename: 'css/[name].css'
                }
            ]
        })

        config.module
            .rule('html')
            .test(/\.html$/)
            .use('html-loader')
            .loader('html-loader')

        const svgRule = config.module.rule('svg')
        svgRule.uses.clear()
        svgRule
            .use('babel-loader')
            .loader('babel-loader')
            .end()
            .use('vue-svg-loader')
            .loader('vue-svg-loader')
    },
    configureWebpack: {
        devtool: process.NODE_ENV === 'production' ? 'none' : 'cheap-module-eval-source-map',

        entry: {
            background: './src/js/App',
            start: './src/js/pages/start.js',
            popup: './src/js/pages/popup.js',
            'content-script': './src/js/ContentScript/ContentScript',

            startCss: './src/scss/start.scss',
            popupCss: './src/scss/popup.scss'
        },
        output: {
            filename: 'js/[name].js'
        },
        plugins: [
            new RenameWebpackPlugin({
                originNameReg: /(.*)Css\.css/,
                targetName: '$1.css'
            }),
            new WebpackCleanPlugin(['extension/static/dist/js/startCss.js', 'extension/static/dist/js/popupCss.js'])
        ]
    }
}
