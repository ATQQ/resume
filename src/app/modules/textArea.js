import {
  debounce, getPageKey, isEqual, setSchema,
} from '../../utils'
import clickObjEditor from './clickObjEditor'
import {
  getNowActivePath, getSessionStorage, initObserver, setSessionStorage,
} from './public'
import editor from './schemaEditor'
import { resetToolsBtnStatus } from './toolsBtn'

// 右侧输入框
export function getTextArea() {
  return document.getElementById('domContext')
}

export function registerTextAreaInput() {
  const $textarea = getTextArea()
  $textarea.addEventListener('focusout', () => {
    // 便于触发点击事件
    // TODO: 优化异步setTimeout的执行顺序
    setTimeout(() => {
      $textarea.classList.toggle('focus')
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
      getSessionStorage('clickDom').textContent = this.value

      // 更新editor
      editor.activeResult.node.value = this.value
      editor.activeResult.node.dom.value.click()
      editor.refresh()

      // 更新到本地
      setSchema(editor.get(), getPageKey())
    }, 100),
  )
}
