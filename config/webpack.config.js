/* eslint-disable */
const { merge } = require('webpack-merge')

const baseConfig = require('./webpack.base')
const devConfig = require('./webpack.config.dev')
const proConfig = require('./webpack.config.build')

module.exports = () => {
    const env = process.env.NODE_ENV
    switch (env) {
        case 'development':
            return merge(baseConfig, devConfig);
        case 'production':
            return merge(baseConfig, proConfig);
        default:
            throw new Error('No matching configuration was found!');
    }
}