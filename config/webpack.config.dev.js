/* eslint-disable */

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: './dist', //项目基本访问目录
        host: 'localhost', //服务器ip地址
        port: 8088, //端口
        open: true, //自动打开页面
    }
}