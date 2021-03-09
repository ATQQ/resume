import { createEmptySpan, createLink, debounce } from '../../utils'
import { navTitle } from '../../constants'
import { jsonDataStack, scalePage } from '../../utils/public'

const dataStack = jsonDataStack

/**
 * 初始化导航栏
 */
export default function initNav(defaultPage = getActivePageKey() || 'react1') {
  const $nav = document.querySelector('header nav')

  // 优先根据别名顺序生成
  const titleKeys = Object.keys(navTitle)
    .concat($nav.innerText.split(','))
    .reduce((pre, now) => {
      if (!pre.includes(now)) {
        pre.push(now)
      }
      return pre
    }, [])
  // 获取所有模板的链接
  const links = titleKeys.map((titleKey) => {
    const link = createLink(navTitle[titleKey] || titleKey, `./pages/${titleKey}`)
    // iframe中打开
    return link
  })

  // 加入自定义的链接
  links.push(createEmptySpan())
  links.push(createLink('Github', 'https://github.com/ATQQ/resume', true))
  links.push(createLink('贡献模板', 'https://github.com/ATQQ/resume/blob/main/README.md', true))
  links.push(
    createLink(
      '如何书写一份好的互联网校招简历',
      'https://juejin.cn/post/6928390537946857479',
      true,
    ),
  )
  links.push(createLink('实现原理', 'https://juejin.cn/post/6934595007370231822', true))
  links.push(createLink('建议/反馈', 'https://www.wenjuan.com/s/MBryA3gI/', true))

  // 渲染到页面中
  const t = document.createDocumentFragment()
  links.forEach((link) => {
    t.appendChild(link)
  })
  $nav.innerHTML = ''
  $nav.append(t)

  // 默认页面
  const _link = links.find((link) => link?.href?.endsWith(defaultPage))
  changeIframePage(_link.href)
  activeLink(_link)

  // 窄屏手动开/关导航栏
  document.getElementById('open-menu').addEventListener('click', () => {
    if (!$nav.style.display) {
      $nav.style.display = 'block'
      return
    }
    if ($nav.style.display === 'block') {
      $nav.style.display = 'none'
    } else {
      $nav.style.display = 'block'
    }
  })

  // 切换Page
  $nav.addEventListener('click', (e) => {
    // TODO：待优化窄屏幕逻辑
    if (e.target.tagName.toLowerCase() === 'a') {
      if ($nav.style.display) {
        $nav.style.display = 'none'
      }
    }

    // 新窗口打开
    if (e.target?.target !== 'page') {
      return
    }

    if (e.target.href === document.getElementById('page').src) {
      e.preventDefault()
      return
    }

    // 清空历史操作栈
    dataStack.clear()
    document.getElementById('domContext').ActiveValues = null
    document.getElementById('domContext').value = ''
    // iframe中打开
    if (e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault()
      changeIframePage(e.target.href)
      activeLink(e.target)
    }
  })

  // 适配屏幕
  window.addEventListener(
    'resize',
    debounce((e) => {
      // TODO:导航栏 后续优化
      const width = e.currentTarget.innerWidth
      if (width > 900) {
        $nav.style.display = ''
      }
      scalePage(width)
    }, 500),
  )
  window.addEventListener('load', (e) => {
    scalePage(e.currentTarget.innerWidth)
  })
}

function getActivePageKey() {
  const activePath = localStorage.getItem('lastActivePage')
  return activePath?.slice(activePath.lastIndexOf('/') + 1)
}

function changeIframePage(src) {
  const page = document.getElementById('page')
  if (src) {
    page.src = src
  }
}

function activeLink(link) {
  Array.from(link.parentElement.children).forEach((el) => {
    el.classList.remove('active')
  })
  link.classList.remove('active')
  link.classList.add('active')
}
