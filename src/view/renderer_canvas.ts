'use strict'

import { Renderer } from './renderer'
import { Shape, Rectangle, Circle, Triangle } from '../model/shape'

export class CanvasRenderer extends Renderer {
    objs: Map<String, Array<Shape>>
    layers: Array<String>
    ctx: CanvasRenderingContext2D
    factory = new CanvasShapeRendererFactory()

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

    drawObjects(): void {
        for (const layer of this.currLayers) {
            for (const shape of this.currObjects.get(layer)) {
                let renderableObject = this.factory.make(shape)

                this.ctx.save()
                this.ctx.beginPath()

                switch (this.mode) {
                    case 'Color':
                        renderableObject = new CanvasColorDecorator(renderableObject)
                        break
                    case 'Gradient':
                        renderableObject = new CanvasGradientDecorator(renderableObject)
                        break
                    case 'Wireframe':
                    case 'None':
                    default:
                        break
                }

                renderableObject.render(this.ctx)
                this.ctx.closePath()
                this.ctx.stroke()
                this.ctx.restore()
            }
        }
    }

    drawLine(x1: number, y1: number, x2: number, y2: number): void {
        const defaultWidth = this.ctx.lineWidth
        const defaultColor = this.ctx.strokeStyle

        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = this.GRID_COLOR

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

abstract class CanvasShapeRenderer {
    constructor(public shape: Shape) {}

    abstract render(ctx: CanvasRenderingContext2D): void
}

class CanvasShapeRendererFactory {
    make(shape: Shape): CanvasShapeRenderer {
        if (shape instanceof Rectangle) return new CanvasRectangleRenderer(shape)
        if (shape instanceof Circle) return new CanvasCircleRenderer(shape)
        if (shape instanceof Triangle) return new CanvasTriangleRenderer(shape)
        else return new CanvasNullRenderer(shape)
    }
}

class CanvasNullRenderer extends CanvasShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(ctx: CanvasRenderingContext2D): void {
        return
    }
}

class CanvasRectangleRenderer extends CanvasShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(ctx: CanvasRenderingContext2D): void {
        const shape = <Rectangle>this.shape
        ctx.translate(shape.x, shape.y)
        ctx.rotate((shape.angle * Math.PI) / 180)
        ctx.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
    }
}

class CanvasCircleRenderer extends CanvasShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(ctx: CanvasRenderingContext2D): void {
        const shape = <Circle>this.shape
        ctx.ellipse(shape.x, shape.y, shape.rx, shape.ry, 0, 0, 2 * Math.PI)
    }
}

class CanvasTriangleRenderer extends CanvasShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(ctx: CanvasRenderingContext2D): void {
        const shape = <Triangle>this.shape
        ctx.moveTo(shape.x1, shape.y1)
        ctx.lineTo(shape.x2, shape.y2)
        ctx.lineTo(shape.x3, shape.y3)
    }
}

class CanvasColorDecorator extends CanvasShapeRenderer {
    constructor(public obj: CanvasShapeRenderer) {
        super(obj.shape)
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.obj.render(ctx)
        ctx.fillStyle = this.shape.color
        ctx.fill()
    }
}

class CanvasGradientDecorator extends CanvasShapeRenderer {
    constructor(public obj: CanvasShapeRenderer) {
        super(obj.shape)
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.obj.render(ctx)
        ctx.fillStyle = this.makeGradient(ctx)
        ctx.fill()
    }

    makeGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
        const gradient = ctx.createLinearGradient(0, 100, 200, 100)
        gradient.addColorStop(0, '#000000')
        gradient.addColorStop(1, '#FFFFFF')
        return gradient
    }
}
