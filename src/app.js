import './assets/css/app.scss'

function initNav() {
    const pages = document.querySelector('header')
    const links = pages.innerText.split(',').map(pageName => {
        const a = document.createElement('a')
        a.href = `./pages/${pageName}`
        a.text = pageName
        return a
    })
    const t = document.createDocumentFragment()
    links.forEach(link => {
        t.appendChild(link)
    })
    pages.innerHTML = ''
    pages.append(t)
    const page = document.getElementById('page')

    pages.addEventListener('click', function (e) {
        if (e.target.tagName.toLowerCase() === 'a') {
            const a = e.target
            page.src = a.href
        }
        e.preventDefault()
    })
    page.src = links[0].href
}

initNav()