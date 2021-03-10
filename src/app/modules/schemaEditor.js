// 右侧的完整json编辑器
import { getPageKey, getSchema } from '../../utils'
import { updatePage, setSessionStorage } from './public'

class SchemaEditor {
  constructor(id, mode) {
    this.init(id, mode)
  }

  init(id, mode = 'tree') {
    const timer = null
    // eslint-disable-next-line no-undef
    this.editor = new JSONEditor(document.getElementById(id), {
      onChange: () => {
        if (timer) {
          clearTimeout(timer)
        }
        setTimeout(updatePage, 200, this.editor.get())
      },
      limitDragging: true,
      modes: ['tree', 'code'],
      name: 'root',
      onEvent(data, e) {
        if (e.type === 'click' && document.activeElement.id === 'domContext') {
          setSessionStorage('valuePath', data.path)
        }
      },
      mode,
    })
    this.editor.mode = mode
  }

  get() {
    return this.editor.get()
  }

  set(json) {
    this.editor.set(json)
  }

  search(value) {
    this.editor.searchBox.dom.search.value = value
    this.editor.searchBox.dom.search.dispatchEvent(new Event('change'))
  }

  get mode() {
    return this.editor.mode
  }

  get searchResults() {
    return this.editor.searchBox.results
  }

  get activeResult() {
    return this.editor?.searchBox?.activeResult
  }

  refresh() {
    this.editor.refresh()
  }

  changeEditorMode(mode) {
    if (mode === 'tree') {
      document.getElementById('toggle').textContent = '切换为编辑模式'
      document.getElementById('jsonEditor').style.height = ''
    } else {
      document.getElementById('toggle').textContent = '切换为树形模式'
      document.getElementById('jsonEditor').style.height = '50vh'
    }
    this.editor.destroy()
    this.init('jsonEditor', mode)
    this.editor.set(getSchema(getPageKey()))
  }

  nextActive() {
    this.editor.searchBox.dom.input
      .querySelector('.jsoneditor-next')
      .dispatchEvent(new Event('click'))
  }

  static getInstance() {
    if (!SchemaEditor.instance) {
      SchemaEditor.instance = new SchemaEditor('jsonEditor')
    }
    return SchemaEditor.instance
  }
}

export default SchemaEditor.getInstance()
