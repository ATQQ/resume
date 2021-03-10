// TODO: 拆分此文件
import '../assets/css/app.scss'
import html2canvas from 'html2canvas'
import {
  setSchema, debounce, copyRes, getPageKey, cloneValue, isEqual,
} from '../utils'
import { toast } from '../components/Toast'
import {
  jsonDataStack,
  toggleControlPanel,
  getNowActivePath,
  updatePage,
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
