/* eslint-disable */

const path = require('path')
const webpack = require('webpack')
const { getEntryAndPage, getHtml, writeSchemaJS } = require('./fileUtil')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
//清理打包
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { entry, pages } = getEntryAndPage('src/pages')

// 生成 schema.js 文件
writeSchemaJS()

module.exports = {
  entry: {
    ...entry,
    app: path.resolve(__dirname, '../src/app/index.js'),
  },
  output: {
    filename: 'js/[name]-[contenthash:8].js',
    path: path.resolve(__dirname, './../dist'),
  },
  // target: ['web', 'es5'],
  resolve: {
    extensions: ['.js', '.jsx', '.vue'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
    modules: ['node_modules', path.resolve(__dirname, 'src')],
  },
  module: {
    // 配置loader
    rules: [
      {
        test: /\.(sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        loader: 'file-loader',
        options: {
          name: '[hash].[ext]',
          outputPath: './img',
          esModule: false,
        },
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader?cacheDirectory',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  // 配置插件
  plugins: [
    ...pages,
    getHtml('index.html', ['app'], 'src/app/index.html', '首页-简历自动生成', {
      pageNames: pages.map((page) => page.userOptions.title),
    }),
    new CleanWebpackPlugin(),
    //css分离(输出文件名))
    new MiniCssExtractPlugin({
      // 类似 webpackOptions.output里面的配置 可以忽略
      filename: 'css/[name]-[contenthash:8].css',
      chunkFilename: 'css/[id]-[contenthash:8].css',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public' }],
    }),
    new VueLoaderPlugin(),
  ],
}
