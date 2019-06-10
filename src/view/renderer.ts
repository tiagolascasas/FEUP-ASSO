import { Shape, Circle, Rectangle } from '../model/shape'
import { Point, NullPoint } from './simpledraw_view'
import { RendererObserver, SimpleDrawDocument } from '../model/document'

export abstract class Renderer implements RendererObserver {
    readonly GRID_STEP = 50
    element: HTMLElement
    mode: string = 'Color'
    zoom: number = 0
    oldObjects: Map<String, Array<Shape>> = new Map<String, Array<Shape>>()
    oldLayers: Array<String> = new Array<String>()

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
            console.log(this.zoom)
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

export class SVGRenderer extends Renderer {
    objs = new Array<Shape>()

    constructor(elementID: string) {
        super(elementID)
        this.element = <HTMLElement>document.getElementById(elementID)
    }

    drawObjects(objs: Map<String, Array<Shape>>, layers: Array<String>): void {
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof Rectangle) {
                    const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

                    g.setAttribute(
                        'transform',
                        `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`
                    )
                    if (this.mode == 'Color')
                        e.setAttribute('style', `stroke: black; fill: ${shape.color}`)
                    else if (this.mode == 'Wireframe') {
                        e.setAttribute('style', `stroke: black; fill: #FFFFFF`)
                        e.setAttribute('fill-opacity', '0.0')
                    }
                    e.setAttribute('width', shape.width.toString())
                    e.setAttribute('height', shape.height.toString())
                    e.setAttribute('x', (-shape.width / 2).toString())
                    e.setAttribute('y', (-shape.height / 2).toString())
                    e.onclick = (event: MouseEvent) => {
                        //selectedShape(shape, this.page)
                    }
                    g.appendChild(e)
                    this.element.appendChild(g)
                } else if (shape instanceof Circle) {
                    const e = document.createElementNS('http://www.w3.org/2000/svg', "ellipse")
                    
                    if (this.mode == 'Color')
                        e.setAttribute('style', `stroke: black; fill: ${shape.color}`)
                    else if (this.mode == 'Wireframe') {
                        e.setAttribute('style', `stroke: black; fill: #FFFFFF`)
                        e.setAttribute('fill-opacity', '0.0')
                    }
                    e.setAttribute('cx', shape.x.toString())
                    e.setAttribute('cy', shape.y.toString())

                    e.setAttribute("rx", shape.rx.toString());
                    e.setAttribute("ry", shape.ry.toString());

                    e.onclick = (event: MouseEvent) => {
                        //selectedShape(shape, this.page)
                    }
                    
                    this.element.appendChild(e)
                }
            }
        }
    }

    drawLine(x1: number, y1: number, x2: number, y2: number) {
        let newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        newLine.setAttribute('x1', x1.toString())
        newLine.setAttribute('y1', y1.toString())
        newLine.setAttribute('x2', x2.toString())
        newLine.setAttribute('y2', y2.toString())
        newLine.setAttribute('stroke', '#DDDDDD')
        this.element.appendChild(newLine)
    }

    clearCanvas(): void {
        this.element.innerHTML = ''
    }

    init(): void {}

    applyZoom(): void {}

    finish(): void {}
}

export class CanvasRenderer extends Renderer {
    objs: Map<String, Array<Shape>>
    layers: Array<String>
    ctx: CanvasRenderingContext2D

    constructor(elementID: string) {
        super(elementID)
        this.element = <HTMLCanvasElement>document.getElementById(elementID)
        let canvas = <HTMLCanvasElement>this.element
        this.ctx = canvas.getContext('2d')
    }

    IsInPath(event: MouseEvent) {
        let canvas = <HTMLCanvasElement>this.element
        let bb, x, y
        bb = this.element.getBoundingClientRect()
        x = (event.clientX - bb.left) * (canvas.width / bb.width)
        y = (event.clientY - bb.top) * (canvas.height / bb.height)
        return this.ctx.isPointInPath(x, y)
    }

    drawObjects(objs: Map<String, Array<Shape>>, layers: Array<String>, event?: MouseEvent): void {
        this.objs = objs
        this.layers = layers

        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof Circle) {
                    this.ctx.beginPath()
                    this.ctx.fillStyle = shape.color
                    this.ctx.ellipse(
                        shape.x,
                        shape.y,
                        shape.radius,
                        shape.radius,
                        0,
                        0,
                        2 * Math.PI
                    )
                    if (event) {
                        if (this.IsInPath(event)) {
                            //selectedShape(shape, this.page)
                        }
                    }
                    this.ctx.closePath()
                    this.ctx.fillStyle = shape.color
                    this.ctx.stroke()
                    if (this.mode == 'Color') this.ctx.fill()
                    //meter rotate num circulo?
                } else if (shape instanceof Rectangle) {
                    //save the state to prevent all the objects from rotating
                    this.ctx.save()
                    this.ctx.beginPath()
                    this.ctx.fillStyle = shape.color
                    this.ctx.translate(shape.x, shape.y)
                    this.ctx.rotate((shape.angle * Math.PI) / 180)
                    this.ctx.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)

                    this.ctx.closePath()
                    this.ctx.stroke()
                    if (this.mode == 'Color') this.ctx.fill()
                    //restore the state before drawing next shape
                    this.ctx.restore()

                    if (event) {
                        if (this.IsInPath(event)) {
                            //selectedShape(shape, this.page)
                        }
                    }
                }
            }
        }
    }

    drawLine(x1: number, y1: number, x2: number, y2: number): void {
        const defaultWidth = this.ctx.lineWidth
        const defaultColor = this.ctx.strokeStyle

        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = '#DDDDDD'

        this.ctx.beginPath()
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)
        this.ctx.stroke()

        this.ctx.lineWidth = defaultWidth
        this.ctx.strokeStyle = defaultColor
    }

    clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.beginPath()
    }

    init(): void {
        this.ctx.save()
    }
    applyZoom(): void {
        this.ctx.scale(1 + this.zoom, 1 + this.zoom)
    }
    finish(): void {
        this.ctx.restore()
    }
}
