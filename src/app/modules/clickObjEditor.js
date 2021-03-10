// 右侧编辑点击的Editor

import { getSessionStorage, updatePage } from './public'
import schemaEditor from './schemaEditor'

class ClickObjEditor {
  constructor() {
    this.init()
  }

  init() {
    let timer = null
    // eslint-disable-next-line no-undef
    this.editor = new JSONEditor(document.getElementById('clickEditor'), {
      onChange: () => {
        if (timer) {
          clearTimeout(timer)
        }
        if (!getSessionStorage('activeValues')) {
          return
        }
        timer = setTimeout(() => {
          const path = getSessionStorage('activeObjPath')
          const json = schemaEditor.get()
          let temp = json
          path.forEach((key, i) => {
            if (i + 1 === path.length) {
              temp[key] = this.editor.get()
              schemaEditor.set(json)
              updatePage(json)
            } else {
              temp = temp[key]
            }
          })
        }, 200)
      },
      modes: ['tree', 'code'],
    })
  }

  static getInstance() {
    if (!ClickObjEditor.instance) {
      ClickObjEditor.instance = new ClickObjEditor('jsonEditor')
    }
    return ClickObjEditor.instance
  }

  get() {
    return this.editor.get()
  }

  set(data) {
    this.editor.set(data)
  }
}

export default ClickObjEditor.getInstance()
