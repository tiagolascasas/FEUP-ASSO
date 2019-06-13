import { Shape } from '../model/shape'
import { Point, NullPoint } from './simpledraw_view'
import { RendererObserver, SimpleDrawDocument } from '../model/document'

export abstract class Renderer implements RendererObserver {
    readonly GRID_STEP = 50
    element: HTMLElement
    colorMode: boolean = false
    zoom: number = 0
    oldObjects: Map<String, Array<Shape>> = new Map<String, Array<Shape>>()
    oldLayers: Array<String> = new Array<String>()

    constructor(private elementID: string) {
        const modeElem: HTMLSelectElement = <HTMLSelectElement>(
            document.getElementById(elementID + '_mode')
        )
        modeElem.addEventListener('change', () => {
            this.colorMode = modeElem.value == "Color"
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
        this.oldObjects = objs
        this.oldLayers = layers

        this.init()
        this.clearCanvas()
        this.applyZoom()
        this.drawGrid()
        this.drawObjects(objs, layers)
        this.finish()
    }

    renderAgain(): void {
        this.render(this.oldObjects, this.oldLayers)
    }

    abstract drawObjects(
        objs: Map<String, Array<Shape>>,
        layers: Array<String>,
        event?: MouseEvent
    ): void

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

    abstract clearCanvas(): void

    abstract drawLine(x1: number, y1: number, x2: number, y2: number): void

    abstract init(): void

    abstract applyZoom(): void

    abstract finish(): void
}
