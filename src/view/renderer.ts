'use strict'

import { Shape } from '../model/shape'
import { Point, NullPoint } from '../controller/utils'
import { RendererObserver, SimpleDrawDocument } from '../model/document'

export abstract class Renderer implements RendererObserver {
    readonly GRID_STEP = 50
    readonly GRID_COLOR = '#BBBBBB'
    element: HTMLElement
    mode: string = 'Wireframe'
    zoom: number = 0
    currObjects: Map<String, Array<Shape>> = new Map<String, Array<Shape>>()
    currLayers: Array<String> = new Array<String>()

    constructor(private elementID: string) {
        const modeElem: HTMLSelectElement = <HTMLSelectElement>(
            document.getElementById(elementID + '_mode')
        )
        modeElem.addEventListener('change', () => {
            this.mode = modeElem.value
            this.renderAgain()
        })

        const zoomElem: HTMLSelectElement = <HTMLSelectElement>(
            document.getElementById(elementID + '_zoom')
        )
        zoomElem.addEventListener('change', () => {
            this.zoom = Number(zoomElem.value)
            this.renderAgain()
        })
    }

    render(objs: Map<String, Array<Shape>>, layers: Array<String>): void {
        this.currObjects = objs
        this.currLayers = layers.reverse()

        this.clearCanvas()
        this.init()
        this.drawGrid()
        this.drawObjects()
        this.applyZoom()
        this.finish()
    }

    renderAgain(): void {
        this.render(this.currObjects, this.currLayers)
    }

    mapToRenderer(point: Point): Point {
        const dimensions = this.element.getBoundingClientRect()
        const x = dimensions.left
        const y = dimensions.top
        const width = x + dimensions.width
        const height = y + dimensions.height

        if (point.x < x || point.x > width || point.y < y || point.y > height)
            return new NullPoint()
        return new Point(point.x - x, point.y - y)
    }

    getDimensions(): number[] {
        const width = this.element.getBoundingClientRect().width
        const height = this.element.getBoundingClientRect().height
        return [width, height]
    }

    drawGrid(): void {
        const width = this.getDimensions()[0]
        const height = this.getDimensions()[1]

        for (let i = 0; i < width; i += this.GRID_STEP) this.drawLine(i, 0, i, height)

        for (let i = 0; i < height; i += this.GRID_STEP) this.drawLine(0, i, width, i)
    }

    notify(document: SimpleDrawDocument): void {
        this.render(document.getObjectsForRendering(), document.getLayersForRendering())
    }

    resize(): void {
        const parent = this.element.parentElement
        this.element.setAttribute('width', parent.clientWidth.toString())
        this.element.setAttribute('height', parent.clientHeight.toString())
        this.renderAgain()
    }

    abstract drawObjects(): void

    abstract clearCanvas(): void

    abstract drawLine(x1: number, y1: number, x2: number, y2: number): void

    abstract init(): void

    abstract applyZoom(): void

    abstract finish(): void
}
