// TODO: 拆分此文件
import '../assets/css/app.scss'
import html2canvas from 'html2canvas'
import {
  createLink,
  getDefaultSchema,
  getSchema,
  setSchema,
  debounce,
  copyRes,
  downloadTxtFile,
  traverseDomTreeMatchStr,
  highLightDom,
  getPathnameKey,
  createEmptySpan,
  Dom2PDF,
  cloneValue,
} from '../utils'
import { navTitle } from '../constants'
import { toast } from '../components/Toast'

window.html2canvas = html2canvas

// json编辑器
let editor = initEditor('jsonEditor')

// 点击的那一个
const clickObjEditor = (() => {
  let timer = null
  // eslint-disable-next-line no-undef
  return new JSONEditor(document.getElementById('clickEditor'), {
    onChange() {
      if (timer) {
        clearTimeout(timer)
      }
      if (!document.getElementById('domContext').ActiveValues) {
        return
      }
      timer = setTimeout(() => {
        const path = document.getElementById('domContext').activeObjPath
        const json = editor.get()
        let temp = json
        path.forEach((key, i) => {
          if (i + 1 === path.length) {
            temp[key] = clickObjEditor.get()
            editor.set(json)
            updatePage(json)
          } else {
            temp = temp[key]
          }
        })
      }, 200)
    },
    modes: ['tree', 'code'],
  })
})()
// 操作栈
const dataStack = []

init()

/**
 * 初始化
 */
function init() {
  toggleControlPanel()
  initNav()

  registerTextAreaInput()
  registerInputToolsBtn()
  registerIframePageLoad()

  // 注册按钮上的事件
  registerResetBtn()
  registerJSONBtn()
  registerToggle()
  registerPCPrint()
  registerJSPDF()
}
/**
 * 初始化导航栏
 */
function initNav(defaultPage = getActivePageKey() || 'react1') {
  const $nav = document.querySelector('header nav')

  // 优先根据别名顺序生成
  const titleKeys = Object.keys(navTitle)
    .concat($nav.innerText.split(','))
    .reduce((pre, now) => {
      if (!pre.includes(now)) {
        pre.push(now)
      }
      return pre
    }, [])
  // 获取所有模板的链接
  const links = titleKeys.map((titleKey) => {
    const link = createLink(navTitle[titleKey] || titleKey, `./pages/${titleKey}`)
    // iframe中打开
    return link
  })

  // 加入自定义的链接
  links.push(createEmptySpan())
  links.push(createLink('Github', 'https://github.com/ATQQ/resume', true))
  links.push(createLink('贡献模板', 'https://github.com/ATQQ/resume/blob/main/README.md', true))
  links.push(
    createLink(
      '如何书写一份好的互联网校招简历',
      'https://juejin.cn/post/6928390537946857479',
      true,
    ),
  )
  links.push(createLink('实现原理', 'https://juejin.cn/post/6934595007370231822', true))
  links.push(createLink('建议/反馈', 'https://www.wenjuan.com/s/MBryA3gI/', true))

  // 渲染到页面中
  const t = document.createDocumentFragment()
  links.forEach((link) => {
    t.appendChild(link)
  })
  $nav.innerHTML = ''
  $nav.append(t)

  // 默认页面
  const _link = links.find((link) => link?.href?.endsWith(defaultPage))
  changeIframePage(_link.href)
  activeLink(_link)

  // 窄屏手动开/关导航栏
  document.getElementById('open-menu').addEventListener('click', () => {
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
  $nav.addEventListener('click', (e) => {
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

    if (e.target.href === document.getElementById('page').src) {
      e.preventDefault()
      return
    }

    // 清空历史操作栈
    dataStack.splice(0, dataStack.length)
    document.getElementById('domContext').ActiveValues = null
    document.getElementById('domContext').value = ''
    // iframe中打开
    if (e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault()
      changeIframePage(e.target.href)
      activeLink(e.target)
    }
  })

  // 适配屏幕
  window.addEventListener(
    'resize',
    debounce((e) => {
      // TODO:导航栏 后续优化
      const width = e.currentTarget.innerWidth
      if (width > 900) {
        $nav.style.display = ''
      }
      scalePage(width)
    }, 500),
  )
  window.addEventListener('load', (e) => {
    scalePage(e.currentTarget.innerWidth)
  })
}
function registerIframePageLoad() {
  document.getElementById('page').onload = function (e) {
    // show control panel
    toggleControlPanel(false)

    // 初始化json编辑器内容
    editor.set(getSchema(getPageKey()))

    // 获取点击到的内容
    e.path[0].contentDocument.body.addEventListener('click', (e) => {
      const $target = e.target
      const clickText = $target.textContent.trim()
      const matchDoms = traverseDomTreeMatchStr(
        document.getElementById('page').contentDocument.body,
        clickText,
      )
      const mathIndex = matchDoms.findIndex((v) => v === $target)
      if ($target.tagName.toLowerCase() === 'a' && !$target.dataset.open) {
        e.preventDefault()
      }

      if (editor.mode === 'code') {
        changeEditorMode('tree')
      }
      if (mathIndex < 0) {
        return
      }
      // 解除上次点击的
      // TODO: 优化
      const $textarea = document.getElementById('domContext')
      highLightDom($textarea.clickDom, 0)
      // 高亮这次的10s
      highLightDom($target, 10000)
      // 更新editor中的search内容
      editor.searchBox.dom.search.value = clickText
      editor.searchBox.dom.search.dispatchEvent(new Event('change'))

      // 更新到textarea中的内容
      $textarea.value = clickText
      // 聚焦
      if (document.getElementById('focus').checked) {
        // $textarea.removeAttribute('disabled')
        $textarea.focus()
      }
      // 记录点击的dom
      $textarea.clickDom = e.target
      let i = -1
      for (const r of editor.searchBox.results) {
        if (r.node.value === clickText) {
          i += 1
          // 匹配到json中的节点
          if (i === mathIndex) {
            // 高亮一下$textarea
            $textarea.style.boxShadow = '0 0 1rem yellow'
            setTimeout(() => {
              $textarea.style.boxShadow = ''
            }, 200)
            editor.searchBox.activeResult.node.dom.value.click()
            return
          }
        }
        editor.searchBox.dom.input
          .querySelector('.jsoneditor-next')
          .dispatchEvent(new Event('click'))
      }
    })

    storageActivePagePath()
  }
}

// function activeToolsBtn(dataType) {
//   const $btn = document.querySelector(`button[data-type="${dataType}"]`)
//   $btn.classList.remove('disabled')
//   $btn.removeAttribute('disabled', 'disabled')
// }

function getNowActiveValues() {
  const json = editor.get()
  const path = document.getElementById('domContext').valuePath
  return {
    json,
    path,
  }
}

function resetToolsBtnStatus(disabledAll = false) {
  // document.querySelectorAll('.tools .left button').forEach(btn => {
  //     btn.classList.add('disabled')
  //     btn.setAttribute('disabled', 'disabled')
  // })
  if (disabledAll) {
    return
  }
  setTimeout(() => {
    const $textarea = document.getElementById('domContext')
    $textarea.ActiveValues = null
    if (!$textarea.clickDom) {
      return
    }

    const { json, path } = getNowActiveValues()
    // 默认允许 取消,复制内容,清空,回退
    // activeToolsBtn('cancel')
    // activeToolsBtn('copy')
    // activeToolsBtn('clear')
    // activeToolsBtn('back')

    // 最外层值类型 - 不提供额外操作
    if (!path || path.length === 1) {
      return
    }
    const data = path.reduce(
      (p, n) => {
        // 倒序放入对象
        if (p[0][n] instanceof Object) {
          p.unshift(p[0][n])
        } else {
          // 最后的key做为值插入
          p.unshift(n)
        }
        return p
      },
      [json],
    )
    $textarea.ActiveValues = data
    // 启用拷贝
    // activeToolsBtn('copy-child')
    // activeToolsBtn('delete')
  }, 100)
}
function registerInputToolsBtn() {
  // TODO: 优化冗余代码
  resetToolsBtnStatus(true)
  const $textarea = document.getElementById('domContext')
  document.querySelector('.tools').addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() !== 'button') return
    toast.success(e.target.textContent.trim())
    switch (e.target.dataset.type) {
      case 'copy':
        copyRes($textarea.value)
        break
      case 'clear':
        execClear()
        break
      case 'back':
        execBack()
        break
      case 'delete':
        execDelete()
        break
      case 'copy-child':
        execCopyChild()
        break
      case 'before':
        execBefore()
        break
      case 'after':
        execAfter()
        break
      default:
        break
    }
    $textarea.ActiveValues = null
  })
  function execClear() {
    if (!$textarea.value) {
      toast.warn('已经清空啦')
      return
    }
    dataStack.push(editor.get())
    $textarea.value = ''
    $textarea.dispatchEvent(new Event('input'))
  }
  function execDelete() {
    // 删除数组中的一项
    // TODO: 删除对象的某个属性,待看看反馈是否需要
    const data = $textarea.ActiveValues
    if (!data?.length) {
      toast.error('请选择要删除的内容')
      return
    }
    const lastData = data[data.length - 1]
    const _index = data.findIndex((v) => v instanceof Array)
    if (_index === -1) {
      toast.error('此节点无法删除,请使用json更改')
      return
    }
    const d1 = data[_index]
    let key = data[_index - 1]
    if (key instanceof Object) {
      key = d1.findIndex((v) => v === key)
    }

    if (d1 instanceof Array) {
      dataStack.push(editor.get())
      d1.splice(key, 1)
      updatePage(lastData, true)
    }
  }
  function execBack() {
    if (dataStack.length === 0) {
      toast.warn('没有可回退的内容')
      setTimeout(() => {
        toast.info('注:只能回退按钮操作')
      }, 1300)
      return
    }
    const t = dataStack.pop()
    updatePage(t, true)
  }
  function execCopyChild() {
    const data = $textarea.ActiveValues
    if (!data?.length) {
      toast.error('请选择要拷贝的内容')
      return
    }
    const lastData = data[data.length - 1]
    const _index = data.findIndex((v) => v instanceof Array)
    if (_index === -1) {
      toast.error('此节点无法拷贝,请使用json更改')
      return
    }
    const d1 = data[_index]
    let key = data[_index - 1]
    if (key instanceof Object) {
      key = d1.findIndex((v) => v === key)
    }

    if (d1 instanceof Array) {
      dataStack.push(editor.get())
      d1.splice(key, 0, cloneValue(d1[key]))
      updatePage(lastData, true)
    }
  }
  function execBefore() {
    const data = $textarea.ActiveValues
    if (!data?.length) {
      toast.error('请选择要移动的内容')
      return
    }
    const lastData = data[data.length - 1]
    const _index = data.findIndex((v) => v instanceof Array)
    if (_index === -1) {
      toast.error('此节点无法移动,请使用json更改')
      return
    }
    const d1 = data[_index]
    let key = data[_index - 1]
    if (key instanceof Object) {
      key = d1.findIndex((v) => v === key)
    }
    if (key === 0) {
      toast.warn('已经在最前面啦')
      return
    }
    if (d1 instanceof Array) {
      dataStack.push(editor.get());
      [d1[key], d1[key - 1]] = [d1[key - 1], d1[key]]
      updatePage(lastData, true)
    }
  }

  function execAfter() {
    const data = $textarea.ActiveValues
    if (!data?.length) {
      toast.error('请选择要移动的内容')
      return
    }
    const lastData = data[data.length - 1]
    const _index = data.findIndex((v) => v instanceof Array)
    if (_index === -1) {
      toast.error('此节点无法移动,请使用json更改')
      return
    }
    const d1 = data[_index]
    let key = data[_index - 1]
    if (key instanceof Object) {
      key = d1.findIndex((v) => v === key)
    }
    if (key === d1.length - 1) {
      toast.warn('已经在最后面啦')
      return
    }
    if (d1 instanceof Array) {
      dataStack.push(editor.get());
      [d1[key], d1[key + 1]] = [d1[key + 1], d1[key]]
      updatePage(lastData, true)
    }
  }
}
function registerTextAreaInput() {
  const $textarea = document.getElementById('domContext')
  $textarea.addEventListener('focusout', () => {
    // $textarea.setAttribute('disabled', 'disabled')
    // 便于触发点击事件
    // TODO: 优化异步setTimeout的执行顺序
    setTimeout(() => {
      $textarea.classList.toggle('focus')
      resetToolsBtnStatus(true)
    }, 150)
  })
  $textarea.addEventListener('focus', () => {
    $textarea.classList.toggle('focus')
    resetToolsBtnStatus()

    setTimeout(() => {
      const activeData = $textarea.ActiveValues
      if (!activeData || activeData.length <= 1) {
        return
      }
      const lastData = activeData[activeData.length - 1]
      const { path } = getNowActiveValues()
      for (const obj of activeData) {
        if (obj instanceof Object) {
          path.reduce((pre, key, idx) => {
            pre = pre[key]
            if (pre === obj) {
              // TODO: flag
              $textarea.activeObjPath = path.slice(0, idx + 1)
              clickObjEditor.set(obj)
            }
            return pre
          }, lastData)
          break
        }
      }
    }, 150)
  })
  $textarea.addEventListener(
    'input',
    debounce(function () {
      // TODO: continue
      // console.log(e.target.valuePath);
      if (!editor.searchBox?.activeResult?.node) {
        return
      }
      initObserver()
      // 更新点击dom
      $textarea.clickDom.textContent = this.value

      // 更新editor
      editor.searchBox.activeResult.node.value = this.value
      editor.searchBox.activeResult.node.dom.value.click()
      editor.refresh()

      // 更新到本地
      setSchema(editor.get(), getPageKey())
    }, 100),
  )
}

function registerToggle() {
  // 切换模式
  document.getElementById('toggle').addEventListener('click', () => {
    if (editor.mode === 'tree') {
      changeEditorMode('code')
      return
    }
    changeEditorMode('tree')
  })
}

function registerPCPrint() {
  // 打印 - 导出pdf
  document.getElementById('print').addEventListener('click', () => {
    // 解除高亮
    highLightDom(document.getElementById('domContext').clickDom, 0)

    if (window.print) {
      window.print()
      return
    }
    toast.error('PC上才能使用此按钮')
  })
}

function registerJSPDF() {
  // jsPDF - 导出pdf
  document.getElementById('pdf').addEventListener('click', () => {
    const dom = document.getElementById('page').contentDocument.body
    if (!dom) return
    // 解除高亮
    highLightDom(document.getElementById('domContext').clickDom, 0)
    Dom2PDF(dom, `${Date.now()}.pdf`)
  })
}
function toggleControlPanel(hide = true) {
  if (hide) {
    // hide control panel
    document.getElementsByClassName('right')[0].setAttribute('hidden', 'hidden')
    return
  }
  // hide control panel
  document.getElementsByClassName('right')[0].removeAttribute('hidden')
}
/**
 * 激活重置按钮
 */
function registerResetBtn() {
  // 重置
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('是否初始化数据，这将会覆盖原有数据')) {
      const key = getPageKey()
      const data = getDefaultSchema(key)
      setSchema(data, key)
      editor.set(data)
      refreshIframePage(true)
      document.getElementById('domContext').value = ''
    }
  })
}
/**
 * 激活JSON下载/复制按钮
 */
function registerJSONBtn() {
  document.querySelector('.json-btns').addEventListener('click', (e) => {
    switch (e.target.dataset.type) {
      case 'copy':
        copyRes(JSON.stringify(editor.get()))
        break
      case 'download':
        toast.success('开始下载')
        downloadTxtFile(JSON.stringify(editor.get()), `${Date.now()}.json`)
        break
      default:
        break
    }
  })
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
  } else {
    document.getElementsByClassName('right')[0].style.top = ''
  }
}

function getPageKey() {
  return getPathnameKey(document.getElementById('page').contentWindow.location.pathname)
}

function activeLink(link) {
  Array.from(link.parentElement.children).forEach((el) => {
    el.classList.remove('active')
  })
  link.classList.remove('active')
  link.classList.add('active')
}

function storageActivePagePath() {
  localStorage.setItem('lastActivePage', getPageKey())
}

function getActivePageKey() {
  const activePath = localStorage.getItem('lastActivePage')
  return activePath?.slice(activePath.lastIndexOf('/') + 1)
}

function changeIframePage(src) {
  const page = document.getElementById('page')
  if (src) {
    page.src = src
  }
}

function refreshIframePage(isReload = false) {
  const page = document.getElementById('page')
  if (isReload) {
    page.contentWindow.location.reload()
    return
  }
  if (page.contentWindow.refresh) {
    page.contentWindow.refresh()
    return
  }
  page.contentWindow.location.reload()
}

/**
 * 更新子页面
 */
function updatePage(data, isReload = false) {
  initObserver()
  setSchema(data, getPageKey())
  refreshIframePage(isReload)
}

/**
 * 切换json编辑器的模式
 */
function changeEditorMode(mode) {
  if (mode === 'tree') {
    document.getElementById('toggle').textContent = '切换为编辑模式'
    document.getElementById('jsonEditor').style.height = ''
  } else {
    document.getElementById('toggle').textContent = '切换为树形模式'
    document.getElementById('jsonEditor').style.height = '50vh'
  }
  editor.destroy()
  editor = initEditor('jsonEditor', mode)
  editor.set(getSchema(getPageKey()))
}
/**
 * 高亮变化的Dom
 */
function initObserver() {
  const config = { childList: true, subtree: true, characterData: true }
  const observer = new MutationObserver(
    debounce((mutationsList) => {
      for (const e of mutationsList) {
        let { target } = e
        if (e.type === 'characterData') {
          target = e.target.parentElement
        }
        highLightDom(target)
      }
    }, 100),
  )

  observer.observe(document.getElementById('page').contentDocument.body, config)
  setTimeout(() => {
    observer.disconnect()
  }, 0)
}

/**
 * 初始化JSON编辑器
 * @param {string} id
 */
function initEditor(id, mode = 'tree') {
  const timer = null
  // eslint-disable-next-line no-undef
  const editor = new JSONEditor(document.getElementById(id), {
    onChange() {
      if (timer) {
        clearTimeout(timer)
      }
      setTimeout(updatePage, 200, editor.get())
    },
    limitDragging: true,
    modes: ['tree', 'code'],
    name: 'root',
    onEvent(data, e) {
      if (e.type === 'click' && document.activeElement.id === 'domContext') {
        document.activeElement.valuePath = data.path
      }
    },
    mode,
  })
  editor.mode = mode
  return editor
}
