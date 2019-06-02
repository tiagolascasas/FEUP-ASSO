'use strict'

import { REPL } from './REPL'
import { SimpleDrawDocument } from './document'
import { Page } from './page';

//create SimpleDraw
const ssd = new SimpleDrawDocument()

//create REPL
const replForm = document.querySelector('#repl')
const replPrint: HTMLLabelElement = document.querySelector('#res')
const replPrompt: HTMLInputElement = document.querySelector('#prompt')
const repl = new REPL(ssd, replPrint)

replForm.addEventListener('submit', (e: Event) => {
    e.preventDefault()
    repl.eval(replPrompt.value)
})

//create page
const page = new Page(ssd)
setInterval(() => {
    page.render()
}, 16)