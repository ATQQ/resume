/* eslint-disable */


// 压缩css
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')


module.exports = {
    mode: 'production',
    devtool: 'source-map',
    // 配置插件
    plugins: [
        new optimizeCssAssetsWebpackPlugin(),
    ],
}