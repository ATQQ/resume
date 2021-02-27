import './assets/css/app.scss'
import { createLink, getDefaultSchema, getSchema, setSchema, debounce } from './utils'
import { navTitle } from './constants'
import html2canvas from 'html2canvas'

window.html2canvas = html2canvas;
const { jsPDF } = window.jspdf;
// json编辑器
const editor = initEditor('jsonEditor')

/**
 * 初始化导航栏
 */
function initNav(defaultPage = 'react1') {
    const $nav = document.querySelector('header nav')
    // 获取所有模板的链接
    const links = $nav.innerText.split(',').map(pageName => {
        const link = createLink(navTitle[pageName] || pageName, `./pages/${pageName}`)
        // iframe中打开
        return link
    })

    // 将使用文档放在最后
    const _i = links.findIndex(link => link.text === '使用文档')
    links.push(...links.splice(_i, 1))

    // 加入自定义的链接
    links.push(createLink('Github', 'https://github.com/ATQQ/resume', true))
    links.push(createLink('如何书写一份好的互联网校招简历', 'https://juejin.cn/post/6928390537946857479', true))

    // 渲染到页面中
    const t = document.createDocumentFragment()
    links.forEach(link => {
        t.appendChild(link)
    })
    $nav.innerHTML = ''
    $nav.append(t)

    // 默认页面
    changeIframePage(links.find(link => link.href.endsWith(defaultPage)).href)

    // 窄屏手动开/关导航栏
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

    // 切换Page
    $nav.addEventListener('click', function (e) {
        // TODO：待优化窄屏幕逻辑
        if (e.target.tagName.toLowerCase() === 'a') {
            if ($nav.style.display) {
                $nav.style.display = 'none'
            }
        }

        // 新窗口打开
        if (e.target?.target !== 'page') {
            return
        }

        // iframe中打开
        if (e.target.tagName.toLowerCase() === 'a') {
            e.preventDefault()
            changeIframePage(e.target.href)
        }
    })

    // 适配屏幕
    window.addEventListener('resize', debounce((e) => {
        // TODO:导航栏 后续优化
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
/**
 * 初始化
 */
function init() {
    // 初始化导航栏
    initNav()

    const $textarea = document.getElementById('domContext')
    $textarea.addEventListener('input', debounce(function () {
        if (!editor.searchBox?.activeResult?.node) {
            return
        }
        initObserver()
        // 更新点击dom
        $textarea.clickDom.textContent = this.value

        // 更新editor
        editor.searchBox.activeResult.node.value = this.value
        editor.refresh()

        // 更新到本地
        setSchema(editor.get(), getPageKey())
    }, 100))

    document.getElementById('page').onload = function (e) {
        // 其余逻辑
        editor.set(getSchema(getPageKey()))

        // 获取点击到的内容
        document.getElementById('page').contentDocument.body.addEventListener('click', function (e) {
            const $target = e.target
            const clickText = $target.textContent.trim()
            const matchDoms = traverseDomTreeMatchStr(document.getElementById('page').contentDocument.body, clickText)
            const mathIndex = matchDoms.findIndex(v => v === $target)

            if (mathIndex < 0) {
                return
            }
            // 解除上次点击的
            highLightDom($textarea.clickDom, 0)
            // 高亮这次的10s
            highLightDom($target, 10000)
            // 更新editor中的search内容
            editor.searchBox.dom.search.value = clickText
            editor.searchBox.dom.search.dispatchEvent(new Event('change'))

            // 更新到textarea中的内容
            $textarea.value = clickText
            // 记录点击的dom
            $textarea.clickDom = e.target
            let i = -1
            for (const r of editor.searchBox.results) {
                if (r.node.value === clickText) {
                    i++
                    // 匹配到json中的节点
                    if (i === mathIndex) {
                        // 高亮一下$textarea
                        $textarea.style.boxShadow = '0 0 1rem yellow'
                        setTimeout(() => {
                            $textarea.style.boxShadow = ''
                        }, 200)
                        return
                    }
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
        // 解除高亮
        highLightDom($textarea.clickDom, 0)
        window.print()
    })
    // jsPDF - 导出pdf
    document.getElementById('pdf').addEventListener('click', async function () {
        // 解除高亮
        highLightDom($textarea.clickDom, 0)

        // 图片转base64
        const $imgs = document.getElementById('page').contentDocument.body.querySelectorAll('img')
        if ($imgs.length > 0) {
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
        }


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
    initObserver()
    setSchema(data, getPageKey())
    refreshIframePage()
    // 因为mutationObserver是宏任务所以这里设为0
}

/**
 * 初始化JSON编辑器
 * @param {string} id 
 */
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

/**
 * 高亮变化的Dom
 */
function initObserver() {
    const config = { childList: true, subtree: true, characterData: true };
    const observer = new MutationObserver(debounce(function (mutationsList, observer) {
        for (const e of mutationsList) {
            let target = e.target
            if (e.type === 'characterData') {
                target = e.target.parentElement
            }
            highLightDom(target)
        }
    }, 100))

    observer.observe(document.getElementById('page').contentDocument.body, config);
    setTimeout(() => {
        observer.disconnect()
    }, 0)
}

function traverseDomTreeMatchStr(dom, str, res = []) {
    if (dom && dom.children && dom.children.length > 0) {
        for (const d of dom.children) {
            traverseDomTreeMatchStr(d, str, res)
        }
    } else if (dom?.textContent?.trim() === str) {
        res.push(dom)
    }

    return res
}

function highLightDom(dom, time = 500, color = '#fff566') {
    if (!dom?.style) return
    if (time === 0) {
        dom.style.backgroundColor = ''
        return
    }
    dom.style.backgroundColor = '#fff566'
    setTimeout(() => {
        dom.style.backgroundColor = ''
    }, time)
}

init()