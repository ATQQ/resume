import './assets/css/app.scss'
import { createLink, getDefaultSchema, getSchema, setSchema } from './utils'
import { navTitle } from './constants'

// json编辑器
const editor = initEditor('jsonEditor')


/**
 * 初始化
 */
function init() {
    const pages = document.querySelector('header')
    // 获取所有模板的链接
    const links = pages.innerText.split(',').map(pageName => {
        const link = createLink(navTitle[pageName] || pageName, `./pages/${pageName}`)
        // iframe中打开
        return link
    })

    // 插入自定义的链接
    links.push(createLink('Github', 'https://github.com/ATQQ/resume', true))
    links.push(createLink('如何书写一份好的互联网校招简历', 'https://juejin.cn/post/6928390537946857479', true))

    // 插入所有模板的链接
    const t = document.createDocumentFragment()
    links.forEach(link => {
        t.appendChild(link)
    })
    pages.innerHTML = ''
    pages.append(t)

    // 默认页面
    changeIframePage(links[0].href)

    // 刷新iframe中的链接
    pages.addEventListener('click', function (e) {
        if (e.target?.target !== 'page') {
            return
        }
        if (e.target.tagName.toLowerCase() === 'a') {
            e.preventDefault()
            // 存取数据，href为key
            const a = e.target
            changeIframePage(a.href)
        }
    })

    document.getElementById('page').onload = function (e) {
        // 其余逻辑
        editor.set(getSchema(getPageKey()))
    }

    const $resetBtn = document.getElementById('reset')
    $resetBtn.addEventListener('click', function () {
        if (confirm('是否初始化数据，这将会覆盖原有数据')) {
            const key = getPageKey()
            const data = getDefaultSchema(key)
            setSchema(data, key)
            editor.set(data)
            refreshIframePage()
        }
    })
    document.getElementById('toggle').addEventListener('click', function () {
        const $editor = document.getElementById('jsonEditor')
        if ($editor.getAttribute('hidden')) {
            $editor.removeAttribute('hidden')
        } else {
            $editor.setAttribute('hidden', 'hidden')
        }
    })
}

function getPageKey() {
    return document.getElementById('page').contentWindow.location.pathname.replace(/\/$/, '')
}

function changeIframePage(src) {
    const page = document.getElementById('page')
    if (src) {
        page.src = src
    }
}

function refreshIframePage() {
    const page = document.getElementById('page')
    if (page.contentWindow.refresh) {
        page.contentWindow.refresh()
        return
    }
    page.contentWindow.location.reload()
}



function initEditor(id) {
    let timer = null
    const editor = new JSONEditor(document.getElementById(id), {
        onChangeJSON(data) {
            setSchema(data, getPageKey())
            // 做个简单的页面更新防抖
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(refreshIframePage, 1000)
        }
    })
    return editor
}

init()