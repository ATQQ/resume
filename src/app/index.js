// TODO: 拆分此文件
import '../assets/css/app.scss'
import html2canvas from 'html2canvas'
import {
  getDefaultSchema,
  getSchema,
  setSchema,
  debounce,
  copyRes,
  downloadTxtFile,
  traverseDomTreeMatchStr,
  highLightDom,
  getPageKey,
  Dom2PDF,
  cloneValue,
  isEqual,
} from '../utils'
import { toast } from '../components/Toast'
import {
  jsonDataStack,
  scrollIntoView,
  toggleControlPanel,
  getNowActivePath,
  updatePage,
  initObserver,
  refreshIframePage,
  setSessionStorage,
  getSessionStorage,
} from './modules/public'
import initHeaderNav from './modules/header'

// 完整的json编辑器
import editor from './modules/schemaEditor'

// 点击部分的json编辑器
import clickObjEditor from './modules/clickObjEditor'

window.html2canvas = html2canvas

// 操作栈
const dataStack = jsonDataStack

init()

/**
 * 初始化
 */
function init() {
  toggleControlPanel()
  initHeaderNav()

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
        editor.changeEditorMode('tree')
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
      editor.search(clickText)
      // editor.searchBox.dom.search.value = clickText
      // editor.searchBox.dom.search.dispatchEvent(new Event('change'))

      // 更新到textarea中的内容
      $textarea.value = clickText
      // 聚焦
      if (document.getElementById('focus').checked) {
        $textarea.focus()
        setTimeout(scrollIntoView, 0, $target)
      }
      // 记录点击的dom
      $textarea.clickDom = e.target
      let i = -1
      for (const r of editor.searchResults) {
        if (r.node.value === clickText) {
          i += 1
          // 匹配到json中的节点
          if (i === mathIndex) {
            // 高亮一下$textarea
            $textarea.style.boxShadow = '0 0 1rem yellow'
            setTimeout(() => {
              $textarea.style.boxShadow = ''
            }, 200)
            // 触发editor onEvent事件-用于捕获path
            editor.activeResult.node.dom.value.click()
            return
          }
        }
        editor.nextActive()
      }
    })

    storageActivePagePath()
  }
}

function resetToolsBtnStatus(disabledAll = false) {
  if (disabledAll) {
    return
  }
  setTimeout(() => {
    const $textarea = document.getElementById('domContext')
    setSessionStorage('activeValues', null)
    if (!$textarea.clickDom) {
      return
    }
    const json = editor.get()
    const path = getNowActivePath()
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
    setSessionStorage('activeValues', data)
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
    setSessionStorage('activeValues', null)
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
    const data = getSessionStorage('activeValues')
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
    const data = getSessionStorage('activeValues')
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
    const data = getSessionStorage('activeValues')
    console.log(data)
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
    const data = getSessionStorage('activeValues')
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
      const activeData = getSessionStorage('activeValues')
      if (!activeData || activeData.length <= 1) {
        return
      }
      const lastData = activeData[activeData.length - 1]
      const path = getNowActivePath()
      for (const obj of activeData) {
        if (obj instanceof Object) {
          path.reduce((pre, key, idx) => {
            pre = pre[key]
            if (isEqual(pre, obj)) {
              setSessionStorage('activeObjPath', path.slice(0, idx + 1))
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
      if (!editor.activeResult?.node) {
        return
      }
      initObserver()
      // 更新点击dom
      $textarea.clickDom.textContent = this.value

      // 更新editor
      editor.activeResult.node.value = this.value
      editor.activeResult.node.dom.value.click()
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
      editor.changeEditorMode('code')
      return
    }
    editor.changeEditorMode('tree')
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

function storageActivePagePath() {
  localStorage.setItem('lastActivePage', getPageKey())
}
