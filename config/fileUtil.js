/* eslint-disable */

const path = require('path')
const fs = require('fs')
// 打包html
const htmlWebpackPlugin = require('html-webpack-plugin');
/**
 * 递归获取指定目录中的所有文件路径
 * @param {String} dir 目录名 
 * @returns {Array<String>} directorys 文件相对路径数组
 */
let getDirFiles = (dir) => {
    let result = []
    let files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach(file => {
        if (file.isFile()) {
            result.push(path.join(dir, file.name))
        } else {
            result.push(...getDirFiles(path.join(dir, file.name)))
        }
    })
    return result;
}

/**
 * 获取指定目录中所有文件,限定文件类型
 * @param {String} dir 目录
 * @param {String} type 文件类型(后缀) js/.js 
 */
let getDirFileByType = (dir, type) => {
    return getDirFiles(dir).filter(file => path.extname(file).endsWith(type))
}

/**
 * 获取指定目录中的所有文件的绝对路径
 * @param {String} dir 目录名 
 */
let getDirFilesWithFullPath = (dir) => {
    return getDirFiles(dir).map(file => path.resolve(file))
}


function getEntry(url, suffix = ".js") {
    const files = getDirFileByType(url, suffix)
    return files.reduce((pre, file) => {
        const filename = path.basename(file)
        const key = filename.slice(0, filename.lastIndexOf(suffix))
        pre[key] = './' + file
        return pre
    }, {})
}

function getHtml(filename, chunks, template, title = '', options = {}) {
    const minify = process.env.NODE_ENV === 'production'
    return new htmlWebpackPlugin({
        filename,
        minify: {
            collapseWhitespace: minify,
            removeComments: minify,
            removeRedundantAttributes: minify,
            removeScriptTypeAttributes: minify,
            removeStyleLinkTypeAttributes: minify,
            useShortDoctype: minify
        },
        chunks, //引入对应的js
        template,
        title: title,
        scriptLoading: 'defer',
        favicon: './src/assets/favicon.png',
        meta: {
            viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no',
            description: '在线简历生成',
            keywords: '校招简历，简历模板，简历生成，在线简历模板，在线简历生成',
            render: 'webkit'
        },
        hash: true, // 清除缓存
        ...options
    })
}

function getPagesConfig(baseDir = 'src/pages') {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true })
    const pageEntry = {}
    dirs.forEach(dir => {
        if (dir.isDirectory()) {
            const { name } = dir
            const jsFilesPath = getDirFileByType(path.resolve(baseDir, name), 'js')
            const entry = jsFilesPath.reduce((pre, current) => {
                const key = current.slice(current.indexOf(name), current.length - 3).split('/').join('_')
                pre[key] = current
                return pre
            }, {})
            pageEntry[name] = entry
        }
    })
    return pageEntry
}

function getEntryAndPage(baseDir = 'src/pages') {
    const pageConfig = getPagesConfig(baseDir)
    const pageName = Object.keys(pageConfig)
    const entry = pageName.reduce((pre, name) => {
        pre = {
            ...pre,
            ...pageConfig[name]
        }
        return pre
    }, {})
    const pages = pageName.map(name => {
        const pageDir = `${name}/index.html`
        const page = getHtml(`pages/${pageDir}`, Object.keys(pageConfig[name]), `${baseDir}/${pageDir}`, name)
        return page
    })
    return {
        entry,
        pages
    }
}

/**
 * 自动创建src/constants/schema.js 文件
 */
function writeSchemaJS() {
    const files = getDirFilesWithFullPath('src/constants/schema')
    const { dir } = path.parse(files[0])
    const targetFilePath = path.resolve(dir, '../', 'schema.js')
    const names = files.map(file => path.parse(file).name)
    const res = `${names.map(n => {
        return `import ${n} from './schema/${n}'`
    }).join('\n')}

export default{
    ${names.join(',')}
}`
    fs.writeFileSync(targetFilePath, res)
}
module.exports = {
    getDirFiles,
    getDirFileByType,
    getDirFilesWithFullPath,
    getEntry,
    getHtml,
    getEntryAndPage,
    writeSchemaJS
}
