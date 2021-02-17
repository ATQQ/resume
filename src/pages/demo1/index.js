import './index.scss'
import { createLink, getSchema } from './../../utils/index'

function updateName(value) {
    document.getElementById('name').textContent = value
}
function updatePosition(value) {
    document.getElementById('position').textContent = value
}
function updateAvatar(value) {
    const $avatar = document.getElementById('avatar')
    if (!value) {
        $avatar.style.display = 'none'
    }
    $avatar.style.display = 'block'
    $avatar.querySelector('img').src = value
}

function createDom(des) {
    if (typeof des === 'string') {
        const $span = document.createElement('span')
        $span.textContent = des
        return $span
    }

    if (des instanceof Object) {
        const { type } = des
        if (type === 'a') {
            const { href, text } = des
            return createLink(text, href, true)
        }
    }
}

function parseIntroduceSchema(value) {
    let str = ''
    if (typeof value === 'string') {
        str = value
    }
    if (value instanceof Array) {
        str = value.map(_v => createDom(_v).outerHTML).join('')
    }
    return str
}

function updateLeftInfo(value) {
    const $leftInfo = document.getElementById('leftInfo')
    $leftInfo.innerHTML = ''
    const createInfoItemHtml = (item) => {
        const { title, introduce } = item
        const li = introduce.map(v => {
            return `<li>${parseIntroduceSchema(v)}</li>`
        }).join('')

        const domHtml = `
        <div class="info-item">
            <div class="title">
                ${title}
            </div>
            <ul>
                ${li}
            </ul>
        </div>
        `
        return domHtml
    }

    for (const item of value) {
        $leftInfo.innerHTML += createInfoItemHtml(item)
    }
}

function updateRightInfo(value) {
    const $rightInfo = document.getElementById('rightInfo')
    $rightInfo.innerHTML = ''
    const createInfoItemHtml = (item) => {
        const { title, introduce } = item
        const ul = introduce.map(v => {
            let str = ''
            const { ordinary, dot } = v
            str += ordinary.map(v => {
                return `<li>${parseIntroduceSchema(v)}</li>`
            }).join('')
            str += dot.map(v => {
                return `<li class='dot'>${parseIntroduceSchema(v)}</li>`
            }).join('')
            return `<ul>${str}</ul>`
        }).join('')
        const domHtml = `
        <div class="exp-info">
            <div class="title">
                ${title}
            </div>
            ${ul}
        </div>
        `
        return domHtml
    }

    for (const item of value) {
        $rightInfo.innerHTML += createInfoItemHtml(item)
    }
}

window.refresh = function () {
    const data = getSchema()
    const { name, position, avatar, left, right } = data || {}
    // 隐藏
    document.getElementById('resume').style.display = 'none'

    // 更新数据
    updateName(name)
    updatePosition(position)
    updateAvatar(avatar)
    updateLeftInfo(left || [])
    updateRightInfo(right || [])

    // 展示
    document.getElementById('resume').style.display = 'block'
}


refresh()