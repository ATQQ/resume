// import { getSchema } from "../../utils"
// import './index.scss'

// window.refresh = function () {
//     const schema = getSchema()
//     const { name, position, infos } = schema

//     clearPage()
//     renderHeader(name, position)
//     renderInfos(infos)
// }

// function clearPage() {
//     document.getElementById('app').innerHTML = ''
// }

// function renderHeader(name, position) {
//     const html = `
//     <header>
//         <h1>${name}</h1>
//         <h2>${position}</h2>
//     </header>`
//     document.getElementById('app').innerHTML += html
// }

// function renderInfos(infos = []) {
//     if (infos?.length === 0) {
//         return
//     }
//     const html = `
//     <ul class="infos">
//     ${infos.map(info => {
//         return `<li>${info}</li>`
//     }).join('')}
//     </ul>`
//     document.getElementById('app').innerHTML += html
// }

// window.onload = function () {
//     refresh()
// }

import Vue from 'vue'
import App from './App.vue'
import './index.scss'

Vue.config.productionTip = process.env.NODE_ENV === 'development'

new Vue({
  render: (h) => h(App),
}).$mount('#app')

// import React from 'react'
// import ReactDOM from 'react-dom';
// import App from './App.jsx'
// import './index.scss'

// ReactDOM.render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>,
//     document.getElementById('app')
// )

// import { getSchema } from "../../utils"
// import './index.scss'

// window.refresh = function () {
//     const schema = getSchema()
//     const { name, position, infos } = schema

//     clearPage()
//     renderHeader(name, position)
//     renderInfos(infos)
// }

// function clearPage() {
//     $('#app').empty()
// }

// function renderHeader(name, position) {
//     const html = `
//     <header>
//         <h1>${name}</h1>
//         <h2>${position}</h2>
//     </header>`
//     $('#app').append(html)
// }

// function renderInfos(infos = []) {
//     if (infos?.length === 0) {
//         return
//     }
//     const html = `
//     <ul class="infos">
//     ${infos.map(info => {
//         return `<li>${info}</li>`
//     }).join('')}
//     </ul>`
//     $('#app').append(html)
// }

// window.onload = function () {
//     refresh()
// }
