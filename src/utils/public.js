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
