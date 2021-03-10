import defaultSchema from '../constants/schema'
import { toast } from '../components/Toast/index'

export function createLink(text, href, newTab = false) {
  const a = document.createElement('a')
  a.href = href
  a.text = text
  a.target = newTab ? '_blank' : 'page'
  return a
}

export function createEmptySpan() {
  const span = document.createElement('span')
  return span
}

export function getSchema(key = '') {
  if (!key) {
    key = getPathnameKey(window.location.pathname)
  }
  let data = localStorage.getItem(key)
  if (!data) {
    setSchema(getDefaultSchema(key), key)
    return getSchema()
  }
  // 如果默认是空对象的则再取一次默认值
  if (data === '{}') {
    setSchema(getDefaultSchema(key), key)
    data = localStorage.getItem(key)
  }
  return JSON.parse(data)
}

export function getDefaultSchema(key) {
  const _key = key.slice(key.lastIndexOf('/') + 1)
  return defaultSchema[_key] || {}
}

export function setSchema(data, key = '') {
  if (!key) {
    key = getPathnameKey(window.location.pathname)
  }
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * 简单防抖
 */
export function debounce(fn, delay) {
  let timer = null
  return function (...rest) {
    if (timer) {
      clearTimeout(timer)
    }
    fn = fn.bind(this, ...rest)
    timer = setTimeout(fn, delay)
  }
}

/**
 * 将结果写入的剪贴板
 * @param {String} text
 */
export function copyRes(text) {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.setAttribute('value', text)
  input.select()
  if (document.execCommand('copy')) {
    document.execCommand('copy')
  }
  document.body.removeChild(input)
  toast.success('结果已成功复制到剪贴板')
}

export function downloadTxtFile(str, filename) {
  const blob = new Blob([`\ufeff${str}`], { type: 'text/txt,charset=UTF-8' })
  const href = URL.createObjectURL(blob) // 创建blob地址
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

export function getBase64Image(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)
  const dataURL = canvas.toDataURL('image/png')
  return dataURL
}

/**
 * 遍历目标Dom树，找出文本内容与目标一致的dom组
 */
export function traverseDomTreeMatchStr(dom, str, res = []) {
  if (dom?.children?.length > 0) {
    for (const d of dom.children) {
      traverseDomTreeMatchStr(d, str, res)
    }
  } else if (dom?.textContent?.trim() === str) {
    res.push(dom)
  }

  return res
}

/**
 * 高亮指定dom一段时间
 */
export function highLightDom(dom, time = 500, color = '#fff566') {
  if (!dom?.style) return
  if (time === 0) {
    dom.style.backgroundColor = ''
    return
  }
  dom.style.backgroundColor = color
  setTimeout(() => {
    dom.style.backgroundColor = ''
  }, time)
}

/**
 * 获取路由对应的的Schema Key
 */
export function getPathnameKey(pathname) {
  return pathname.replace(/\/$/, '')
}

export function TransferAllImgToBase64(dom) {
  return new Promise((res) => {
    if (!dom) {
      res()
      return
    }
    const $imgs = dom.querySelectorAll('img')
    if ($imgs.length === 0) {
      res()
      return
    }
    // 图片转base64
    let i = 0
    for (const $img of $imgs) {
      if (!$img.src.startsWith('http')) {
        i += 1
        if (i === $imgs.length) {
          res()
        }
      }
      const image = new Image()
      image.src = `${$img.src}?v=${Math.random()}` // 处理缓存
      image.crossOrigin = '*' // 支持跨域图片
      image.onload = function () {
        i += 1
        $img.src = getBase64Image(image)
        if (i === $imgs.length) {
          res()
        }
      }
      image.onerror = function () {
        i += 1
        if (i === $imgs.length) {
          res()
        }
      }
    }
  })
}

export function Dom2PDF(dom, filename) {
  TransferAllImgToBase64(dom).then(() => {
    window
      .html2canvas(dom, {
        dpi: 300,
        scale: 2,
      })
      .then((canvas) => {
        // 返回图片dataURL，参数：图片格式和清晰度(0-1)
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        // 方向默认竖直，尺寸ponits，格式a4[595.28,841.89]
        const doc = new window.jspdf.jsPDF('', 'pt', 'a4')
        // addImage后两个参数控制添加图片的尺寸，此处将页面高度按照a4纸宽高比列进行压缩
        doc.addImage(pageData, 'JPEG', 0, 0, 595.28, (592.28 / canvas.width) * canvas.height)
        // doc.addImage(pageData, 'JPEG', 0, 0, 595.28, 841.89);
        doc.save(filename)
      })
  })
}

export function cloneValue(value) {
  if (value instanceof Object) {
    return JSON.parse(JSON.stringify(value))
  }
  return value
}

export function getPageKey() {
  return getPathnameKey(document.getElementById('page').contentWindow.location.pathname)
}

export function isObject(a) {
  return a instanceof Object
}

export function isValueType(a) {
  return !isObject(a)
}

export function isSame(a, b) {
  // 为什么不用isNaN
  // 因为isNaN(undefined) 为true
  // eslint-disable-next-line no-self-compare
  return a === b || (a !== a && b !== b)
}

export function isSameType(a, b) {
  // 两者都是值类型
  if (typeof a === typeof b && !(a instanceof Object) && !(b instanceof Object)) {
    return true
  }

  // 两者都是对象
  if (a instanceof Object && b instanceof Object) {
    const aOk = a instanceof Array
    const bOk = b instanceof Array
    // 都是数组,或者都不是数组则ok --> aOK === bOk
    return aOk === bOk
  }
  return false
}
export function isEqual(a, b) {
  if (!isSameType(a, b)) {
    return false
  }
  if (isValueType(a)) {
    return a === b
  }
  // 都是数组
  if (Array.isArray(a)) {
    if (a.length !== b.length) {
      return false
    }

    // 逐项判断
    for (let i = 0; i < a.length; i += 1) {
      const _a = a[i]
      const _b = b[i]
      // 类型不等
      if (!isSameType(_a, _b)) {
        return false
      }

      // 值类型,值不等
      if (isValueType(_a) && !isSame(_a, _b)) {
        return false
      }

      // 对象 - 递归判断了
      if (isObject(_a) && !isEqual(_a, _b)) {
        return false
      }
    }
  } else {
    // 都是普通对象
    const aKeys = Reflect.ownKeys(a)
    const bKeys = Reflect.ownKeys(b)

    // 键数量不一致
    if (aKeys.length !== bKeys.length) {
      return false
    }

    for (const aKey of aKeys) {
      const _a = a[aKey]
      const _b = b[aKey]
      // 类型不等
      if (!isSameType(_a, _b)) {
        return false
      }

      // 值类型,值不等
      if (isValueType(_a) && !isSame(_a, _b)) {
        return false
      }

      // 对象 - 递归判断了
      if (isObject(_a) && !isEqual(_a, _b)) {
        return false
      }
    }
  }

  return true
}
