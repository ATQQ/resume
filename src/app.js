import './assets/css/app.scss'
import { createLink, getDefaultSchema, getSchema, setSchema, debounce } from './utils'
import { navTitle } from './constants'
import html2canvas from 'html2canvas'

window.html2canvas = html2canvas;
const { jsPDF } = window.jspdf;
// json编辑器
const editor = initEditor('jsonEditor')


/**
 * 初始化
 */
function init() {
    const $nav = document.querySelector('header nav')
    // 获取所有模板的链接
    const links = $nav.innerText.split(',').map(pageName => {
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
    $nav.innerHTML = ''
    $nav.append(t)

    // 默认页面
    changeIframePage(links[0].href)

    // 导航栏
    document.getElementById('open-menu').addEventListener('click', function () {
        if (!$nav.style.display) {
            $nav.style.display = 'block'
            return
        }
        if ($nav.style.display === 'block') {
            $nav.style.display = 'none'
        } else {
            $nav.style.display = 'block'
        }
    })
    // 刷新iframe中的链接
    $nav.addEventListener('click', function (e) {
        if (e.target.tagName.toLowerCase() === 'a') {
            if ($nav.style.display) {
                $nav.style.display = 'none'
            }
        }
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

    const $textarea = document.getElementById('domContext')
    $textarea.addEventListener('input', debounce(function () {
        if (!editor.searchBox?.activeResult?.node) {
            return
        }
        editor.searchBox.activeResult.node.value = this.value
        editor.refresh()
        updatePage(editor.get())
    }, 200))
    document.getElementById('page').onload = function (e) {
        // 其余逻辑
        editor.set(getSchema(getPageKey()))

        // 获取点击到的内容
        document.getElementById('page').contentDocument.body.addEventListener('click', function (e) {
            const clickText = e.target.textContent.trim()
            editor.searchBox.dom.search.value = clickText
            // 更新到textarea
            $textarea.value = clickText
            editor.searchBox.dom.search.dispatchEvent(new Event('change'))
            document.getElementById('tipsNum').textContent = editor.searchBox.results.length
            for (const r of editor.searchBox.results) {
                if (r.node.value === clickText) {
                    $textarea.focus()
                    return
                }
                editor.searchBox.dom.input.querySelector('.jsoneditor-next').dispatchEvent(new Event('click'))
            }
        })
    }

    // 重置
    document.getElementById('reset').addEventListener('click', function () {
        if (confirm('是否初始化数据，这将会覆盖原有数据')) {
            const key = getPageKey()
            const data = getDefaultSchema(key)
            setSchema(data, key)
            editor.set(data)
            refreshIframePage()
            $textarea.value = ''
        }
    })
    // 显隐
    document.getElementById('toggle').addEventListener('click', function () {
        const $editor = document.getElementById('jsonEditor')
        if ($editor.getAttribute('hidden')) {
            $editor.removeAttribute('hidden')
        } else {
            $editor.setAttribute('hidden', 'hidden')
        }
    })
    // 打印 - 导出pdf
    document.getElementById('print').addEventListener('click', function () {
        window.print()
    })
    // jsPDF - 导出pdf
    document.getElementById('pdf').addEventListener('click', async function () {

        // 图片转base64
        const $imgs = document.getElementById('page').contentDocument.body.querySelectorAll('img')

        await new Promise((res) => {
            let _i = 0
            for (const $img of $imgs) {
                if (!$img.src.startsWith('http')) {
                    _i++;
                    if (_i === $imgs.length) {
                        res()
                    }
                    return
                }
                var image = new Image();
                image.src = $img.src + '?v=' + Math.random(); // 处理缓存
                image.crossOrigin = "*";  // 支持跨域图片
                image.onload = function () {
                    _i += 1
                    $img.src = getBase64Image(image)
                    if (_i === $imgs.length) {
                        res()
                    }
                }
                image.onerror = function () {
                    _i += 1
                    if (_i === $imgs.length) {
                        res()
                    }
                }
            }
        })

        // 导出pdf
        html2canvas(document.getElementById('page').contentDocument.body).then(canvas => {
            //返回图片dataURL，参数：图片格式和清晰度(0-1)
            var pageData = canvas.toDataURL('image/jpeg', 1.0);
            //方向默认竖直，尺寸ponits，格式a4[595.28,841.89]
            var doc = new jsPDF('', 'pt', 'a4');
            //addImage后两个参数控制添加图片的尺寸，此处将页面高度按照a4纸宽高比列进行压缩
            // doc.addImage(pageData, 'JPEG', 0, 0, 595.28, 592.28 / canvas.width * canvas.height);
            doc.addImage(pageData, 'JPEG', 0, 0, 595.28, 841.89);
            doc.save(`${Date.now()}.pdf`);
        });
    })

    // 适配屏幕
    window.addEventListener('resize', debounce((e) => {
        // 导航栏 后续优化
        const width = e.currentTarget.innerWidth
        if (width > 900) {
            $nav.style.display = ''
        }
        scalePage(width)
    }, 500))
    window.addEventListener('load', (e) => {
        scalePage(e.currentTarget.innerWidth)
    })

}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");  // 可选其他值 image/jpeg
    return dataURL;
}

function scalePage(width) {
    if (width < 800) {
        const scale = (width / 800).toFixed(2)
        document.getElementById('page').style.transform = `scale(${scale})`
        const pageHeight = document.getElementById('page').getBoundingClientRect().height
        document.getElementsByClassName('main')[0].style.height = `${pageHeight}px`
    } else {
        document.getElementById('page').style.transform = 'scale(1)'
        document.getElementsByClassName('main')[0].style.height = ''
    }

    // jsonEditor
    if (width <= 1200) {
        const pageHeight = document.getElementById('page').getBoundingClientRect().height
        document.getElementsByClassName('right')[0].style.top = `${pageHeight}px`
    }
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


function updatePage(data) {
    setSchema(data, getPageKey())
    refreshIframePage()
}

function initEditor(id) {
    let timer = null
    const editor = new JSONEditor(document.getElementById(id), {
        onChangeJSON(data) {
            if (timer) {
                clearTimeout(timer)
            }
            setTimeout(updatePage, 200, data)
        }
    })
    return editor
}

init()