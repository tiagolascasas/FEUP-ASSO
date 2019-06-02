'use strict'

import { SimpleDrawDocument } from './document'
import { Page } from './page'
import { Interpreter } from './REPL'

//create SimpleDraw
const ssd = new SimpleDrawDocument()

//create Canvas and SVG elements
const divCanvas1 = document.querySelector('#divCanvas1')
const divCanvas2 = document.querySelector('#divCanvas2')
const divSVG1 = document.querySelector('#divSVG1')
const divSVG2 = document.querySelector('#divSVG2')

const canvas1 = document.createElement('canvas')
canvas1.id = 'canvas1'
canvas1.width = divCanvas1.clientWidth
canvas1.height = divCanvas1.clientHeight
canvas1.style.zIndex = '8'
canvas1.style.position = 'absolute'
canvas1.style.border = '1px solid red'
divCanvas1.appendChild(canvas1)

const canvas2 = document.createElement('canvas')
canvas2.id = 'canvas2'
canvas2.width = divCanvas2.clientWidth
canvas2.height = divCanvas2.clientHeight
canvas2.style.zIndex = '8'
canvas2.style.position = 'absolute'
canvas2.style.border = '1px solid green'
divCanvas2.appendChild(canvas2)

const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg1.id = 'svg1'
svg1.setAttribute("width", divSVG1.clientWidth.toString());
svg1.setAttribute("height", divSVG1.clientHeight.toString());
svg1.style.zIndex = '8'
svg1.style.position = 'absolute'
svg1.style.border = '1px solid blue'
divSVG1.appendChild(svg1)

const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg2.id = 'svg2'
svg2.setAttribute("width", divSVG2.clientWidth.toString());
svg2.setAttribute("height", divSVG2.clientHeight.toString());
svg2.style.zIndex = '8'
svg2.style.position = 'absolute'
svg2.style.border = '1px solid yellow'
divSVG2.appendChild(svg2)

//create REPL
const replForm: HTMLFormElement = document.querySelector('#repl')
const replPrint: HTMLLabelElement = document.querySelector('#res')
const replPrompt: HTMLInputElement = document.querySelector('#prompt')

const interpreter = new Interpreter(ssd)

replForm.addEventListener('submit', (e: Event) => {
    e.preventDefault()
    let res = interpreter.eval(replPrompt.value)
    replPrint.innerHTML = res ? '&nbsp;&nbsp;✔️' : '&nbsp;&nbsp;❌'
})

//create page
const page = new Page(ssd)
setInterval(() => {
    page.render()
}, 16)
