export function createLink(text, href, newTab = false) {
    const a = document.createElement('a')
    a.href = href
    a.text = text

    newTab && (a.target = '_blank')
    return a
}