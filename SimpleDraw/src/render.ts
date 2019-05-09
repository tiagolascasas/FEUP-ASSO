import { Shape, Circle, Rectangle } from "./shape"

export interface Render {
    draw(...objs: Array<Shape>): void
}

export class SVGRender implements Render {
    svg: HTMLElement

    constructor() {
        this.svg = <HTMLElement>document.getElementById('svgcanvas')
    }

    draw(...objs: Array<Shape>): void {
        for (const shape of objs) {
            if (shape instanceof Rectangle) {
                const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                e.setAttribute('style', 'stroke: black; fill: white')
                e.setAttribute('x', shape.x.toString())
                e.setAttribute('y', shape.y.toString())
                e.setAttribute('width', shape.width.toString())
                e.setAttribute('height', shape.height.toString())
                this.svg.appendChild(e)
            }
        }
    }
}

export class CanvasRender implements Render {
    ctx: CanvasRenderingContext2D

    constructor() {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas')
        this.ctx = canvas.getContext('2d')
    }

    draw(...objs: Array<Shape>): void {
        for (const shape of objs) {
            if (shape instanceof Circle) {
                this.ctx.ellipse(shape.x, shape.y, shape.radius, shape.radius, 0, 0, 2 * Math.PI)
                this.ctx.stroke()
                //meter rotate num circulo? 
            } else if (shape instanceof Rectangle) {
                //save the state to prevent all the objects from rotating
                this.ctx.save()

                this.ctx.translate(shape.x, shape.y)
                this.ctx.rotate(shape.angle * Math.PI / 180)
                this.ctx.strokeRect(-shape.width/2, -shape.height/2, shape.width, shape.height)

                this.ctx.ellipse(0, 0, 5, 5, 0, 0, 2 * Math.PI)
                this.ctx.stroke()
                //restore the state before drawing next shape
                this.ctx.restore()
            }
        }
    }
}