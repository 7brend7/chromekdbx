const path = require('path')

module.exports = {
    outputDir: 'server-dist',

    chainWebpack: config => {
        config.entryPoints.delete('app')
        config.optimization.delete('splitChunks')

        for (const name of ['html', 'preload', 'prefetch', 'define']) {
            if (config.plugins.has(name)) {
                config.plugins.delete(name)
            }
        }
    },
    configureWebpack: {
        target: 'node',
        entry: {
            server: './src/js/sync_server/server.ts'
        },
        output: {
            filename: '[name].js'
        }
    }
}
