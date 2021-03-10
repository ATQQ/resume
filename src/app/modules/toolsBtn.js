// 右侧输入框下方快捷操作json按钮组
import { toast } from '../../components/Toast'
import { cloneValue, copyRes } from '../../utils'
import {
  getNowActivePath,
  getSessionStorage,
  jsonDataStack,
  setSessionStorage,
  updatePage,
} from './public'
import editor from './schemaEditor'

const dataStack = jsonDataStack

export function registerInputToolsBtn() {
  // TODO: 优化冗余代码
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

export function resetToolsBtnStatus(disabledAll = false) {
  if (disabledAll) {
    return
  }
  setTimeout(() => {
    setSessionStorage('activeValues', null)
    if (!getSessionStorage('clickDom')) {
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
