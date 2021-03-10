import {
  debounce, getPageKey, highLightDom, setSchema,
} from '../../utils'

class JsonDataStack {
  constructor() {
    this.stack = []
  }

  static getInstance() {
    if (!JsonDataStack.instance) {
      JsonDataStack.instance = new JsonDataStack()
    }
    return JsonDataStack.instance
  }

  get length() {
    return this.stack.length
  }

  push(json) {
    this.stack.push(json)
  }

  pop() {
    return this.stack.pop()
  }

  clear() {
    this.stack = []
  }
}

export const jsonDataStack = JsonDataStack.getInstance()

export function scalePage(width) {
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

export function scrollIntoView(dom) {
  dom?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
}

export function toggleControlPanel(hide = true) {
  if (hide) {
    // hide control panel
    document.getElementsByClassName('right')[0].setAttribute('hidden', 'hidden')
    return
  }
  document.getElementsByClassName('right')[0].removeAttribute('hidden')
}

export function getNowActivePath() {
  const path = getSessionStorage('valuePath')
  return path
}
const sessionMap = new Map()
export function setSessionStorage(key, value) {
  if (value === null || value === undefined) {
    sessionMap.delete(key)
    return
  }
  sessionMap.set(key, value)
}

export function getSessionStorage(key) {
  return sessionMap.get(key)
}

/**
 * 更新子页面
 */
export function updatePage(data, isReload = false) {
  initObserver()
  setSchema(data, getPageKey())
  refreshIframePage(isReload)
}

/**
 * 高亮Page中变化的Dom
 */
export function initObserver() {
  const config = { childList: true, subtree: true, characterData: true }
  const $pageBody = document.getElementById('page').contentDocument.body
  if (!$pageBody) {
    return
  }
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

  observer.observe($pageBody, config)
  setTimeout(() => {
    observer.disconnect()
  }, 0)
}

export function refreshIframePage(isReload = false) {
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
