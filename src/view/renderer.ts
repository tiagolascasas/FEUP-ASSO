import { Shape, Circle, Rectangle } from '../model/shape'
import { Point, NullPoint } from './simpledraw_view'

export abstract class Renderer {
    element: HTMLElement

    constructor(private elementID: string) {}

    abstract draw(objs: Map<String, Array<Shape>>, layers: Array<String>, event?: MouseEvent): void

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
}

export class SVGRenderer extends Renderer {
    objs = new Array<Shape>()

    constructor(elementID: string) {
        super(elementID)
        this.element = <HTMLElement>document.getElementById(elementID)
    }

    draw(objs: Map<String, Array<Shape>>, layers: Array<String>): void {
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof Rectangle) {
                    const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

                    g.setAttribute(
                        'transform',
                        `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`
                    )
                    e.setAttribute('style', `stroke: black; fill: ${shape.color}`)
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
                    const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                    e.setAttribute('style', `stroke: black; fill: ${shape.color}`)
                    e.setAttribute('cx', shape.x.toString())
                    e.setAttribute('cy', shape.y.toString())
                    e.setAttribute('r', shape.radius.toString())
                    e.onclick = (event: MouseEvent) => {
                        //selectedShape(shape, this.page)
                    }
                    this.element.appendChild(e)
                }
            }
        }
    }
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
        this.element.onclick = (ev: MouseEvent) => {
            this.draw(this.objs, this.layers, ev)
        }
    }

    IsInPath(event: MouseEvent) {
        let canvas = <HTMLCanvasElement>this.element
        let bb, x, y
        bb = this.element.getBoundingClientRect()
        x = (event.clientX - bb.left) * (canvas.width / bb.width)
        y = (event.clientY - bb.top) * (canvas.height / bb.height)
        return this.ctx.isPointInPath(x, y)
    }

    draw(objs: Map<String, Array<Shape>>, layers: Array<String>, event?: MouseEvent): void {
        this.objs = objs
        this.layers = layers

        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof Circle) {
                    this.ctx.beginPath()
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
                    this.ctx.fill()
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
                    this.ctx.fill()
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
}
