import defaultSchema from '../constants/schema'
import { toast } from "../components/Toast/index"

export function createLink(text, href, newTab = false) {
    const a = document.createElement('a')
    a.href = href
    a.text = text
    a.target = newTab ? '_blank' : 'page'
    return a
}

export function getSchema(key = '') {
    if (!key) {
        key = window.location.pathname.replace(/\/$/, '')
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
        key = window.location.pathname.replace(/\/$/, '')
    }
    localStorage.setItem(key, JSON.stringify(data))
}

/**
 * 简单防抖
 */
export function debounce(fn, delay) {
    let timer = null
    return function () {
        if (timer) {
            clearTimeout(timer)
        }
        fn = fn.bind(this, ...arguments)
        timer = setTimeout(fn, delay)
    }
}


/**
 * 将结果写入的剪贴板
 * @param {String} text 
 */
export function copyRes(text) {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', text);
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
    }
    document.body.removeChild(input);
    toast.success("结果已成功复制到剪贴板")
}

export function downloadTxtFile(str, filename) {
    var blob = new Blob(['\ufeff' + str], { type: 'text/txt,charset=UTF-8' });
    const href = URL.createObjectURL(blob); // 创建blob地址
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
}