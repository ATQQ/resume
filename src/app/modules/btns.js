import {
  copyRes,
  Dom2PDF,
  downloadTxtFile,
  getDefaultSchema,
  getPageKey,
  highLightDom,
  setSchema,
} from '../../utils'
// 完整的json编辑器
import editor from './schemaEditor'
import { toast } from '../../components/Toast'

// 点击部分的json编辑器
import clickObjEditor from './clickObjEditor'
import { getSessionStorage, refreshIframePage } from './public'
import { getTextArea } from './textArea'

/**
 * 激活重置按钮
 */
export function registerResetBtn() {
  // 重置
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('是否初始化数据，这将会覆盖原有数据')) {
      const key = getPageKey()
      const data = getDefaultSchema(key)
      setSchema(data, key)

      editor.set(data)
      clickObjEditor.set({})
      refreshIframePage(true)
      getTextArea().value = ''
    }
  })
}
/**
 * 激活JSON下载/复制按钮
 */
export function registerJSONBtn() {
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

export function registerToggle() {
  // 切换模式
  document.getElementById('toggle').addEventListener('click', () => {
    if (editor.mode === 'tree') {
      editor.changeEditorMode('code')
      return
    }
    editor.changeEditorMode('tree')
  })
}

export function registerPCPrint() {
  // 打印 - 导出pdf
  document.getElementById('print').addEventListener('click', () => {
    // 解除高亮
    highLightDom(getSessionStorage('clickDom'), 0)

    if (window.print) {
      window.print()
      return
    }
    toast.error('PC上才能使用此按钮')
  })
}

export function registerJSPDF() {
  // jsPDF - 导出pdf
  document.getElementById('pdf').addEventListener('click', () => {
    const dom = document.getElementById('page').contentDocument.body
    if (!dom) return
    // 解除高亮
    highLightDom(getSessionStorage('clickDom'), 0)
    Dom2PDF(dom, `${Date.now()}.pdf`)
  })
}
