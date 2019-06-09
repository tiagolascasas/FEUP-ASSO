'use strict'

import { SimpleDrawView } from './view/simpledraw_view'
import { CanvasRenderer, SVGRenderer } from './view/renderer'

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
canvas1.style.border = '1px solid black'
divCanvas1.appendChild(canvas1)

const canvas2 = document.createElement('canvas')
canvas2.id = 'canvas2'
canvas2.width = divCanvas2.clientWidth
canvas2.height = divCanvas2.clientHeight
canvas2.style.zIndex = '8'
canvas2.style.position = 'absolute'
canvas2.style.border = '1px solid black'
divCanvas2.appendChild(canvas2)

const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
svg1.id = 'svg1'
svg1.setAttribute('width', divSVG1.clientWidth.toString())
svg1.setAttribute('height', divSVG1.clientHeight.toString())
svg1.style.zIndex = '8'
svg1.style.position = 'absolute'
svg1.style.border = '1px solid black'
divSVG1.appendChild(svg1)

const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
svg2.id = 'svg2'
svg2.setAttribute('width', divSVG2.clientWidth.toString())
svg2.setAttribute('height', divSVG2.clientHeight.toString())
svg2.style.zIndex = '8'
svg2.style.position = 'absolute'
svg2.style.border = '1px solid black'
divSVG2.appendChild(svg2)

//Create view and add renderers
const simpleDraw: SimpleDrawView = new SimpleDrawView()
simpleDraw.addRenderer(new CanvasRenderer('canvas1'))
simpleDraw.addRenderer(new CanvasRenderer('canvas2'))
simpleDraw.addRenderer(new SVGRenderer('svg1'))
simpleDraw.addRenderer(new SVGRenderer('svg2'))

simpleDraw.api.document.createRectangle(100,100,100,100,"#000")