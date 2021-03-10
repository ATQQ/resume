import '../assets/css/app.scss'
import html2canvas from 'html2canvas'

import { toggleControlPanel } from './modules/public'
import initHeaderNav from './modules/header'

import {
  registerJSONBtn,
  registerJSPDF,
  registerPCPrint,
  registerResetBtn,
  registerToggle,
} from './modules/btns'
import registerIframePageLoad from './modules/iframePage'
import { registerInputToolsBtn } from './modules/toolsBtn'
import { registerTextAreaInput } from './modules/textArea'

window.html2canvas = html2canvas

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
