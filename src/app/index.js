// TODO: 拆分此文件
import '../assets/css/app.scss'
import html2canvas from 'html2canvas'
import {
  setSchema, debounce, getPageKey, isEqual,
} from '../utils'
import {
  jsonDataStack,
  toggleControlPanel,
  getNowActivePath,
  initObserver,
  setSessionStorage,
  getSessionStorage,
} from './modules/public'
import initHeaderNav from './modules/header'

// 完整的json编辑器
import editor from './modules/schemaEditor'

// 点击部分的json编辑器
import clickObjEditor from './modules/clickObjEditor'
import {
  registerJSONBtn,
  registerJSPDF,
  registerPCPrint,
  registerResetBtn,
  registerToggle,
} from './modules/btns'
import registerIframePageLoad from './modules/iframePage'
import registerInputToolsBtn from './modules/toolsBtn'

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
  // 激活Page的拓展功能与右侧操作面板
  registerIframePageLoad()

  // 注册按钮上的事件
  registerResetBtn()
  registerJSONBtn()
  registerToggle()
  registerPCPrint()
  registerJSPDF()
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
