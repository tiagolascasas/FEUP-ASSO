'use strict'

import { Renderer } from './renderer'
import { Shape, Rectangle, Circle, Triangle } from '../model/shape'

export class SVGRenderer extends Renderer {
    objs = new Array<Shape>()
    factory = new SVGShapeRendererFactory()

    constructor(elementID: string) {
        super(elementID)
        this.element = <HTMLElement>document.getElementById(elementID)
    }

    drawObjects(): void {
        for (const layer of this.currLayers) {
            for (const shape of this.currObjects.get(layer)) {
                let renderableObject = this.factory.make(shape)

                switch (this.mode) {
                    case 'Color':
                        renderableObject = new SVGColorDecorator(renderableObject)
                        break
                    case 'Wireframe':
                        renderableObject = new SVGWireframeDecorator(renderableObject)
                        break
                    case 'Gradient':
                        renderableObject = new SVGGradientDecorator(renderableObject)
                        break
                    case 'None':
                    default:
                        break
                }

                const e = renderableObject.render()
                this.element.appendChild(e)
            }
        }
    }

    drawLine(x1: number, y1: number, x2: number, y2: number) {
        let newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        newLine.setAttribute('x1', x1.toString())
        newLine.setAttribute('y1', y1.toString())
        newLine.setAttribute('x2', x2.toString())
        newLine.setAttribute('y2', y2.toString())
        newLine.setAttribute('stroke', this.GRID_COLOR)
        this.element.appendChild(newLine)
    }

    clearCanvas(): void {
        this.element.innerHTML = ''
    }

    init(): void {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        const gradient = <SVGLinearGradientElement>(
            document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
        )
        const stop1 = <SVGStopElement>document.createElementNS('http://www.w3.org/2000/svg', 'stop')
        const stop2 = <SVGStopElement>document.createElementNS('http://www.w3.org/2000/svg', 'stop')

        stop1.setAttribute('offset', '0%')
        stop1.setAttribute('stop-color', '#000000')
        stop1.setAttribute('stop-opacity', '1')

        stop2.setAttribute('offset', '100%')
        stop2.setAttribute('stop-color', '#FFFFFF')
        stop2.setAttribute('stop-opacity', '1')

        gradient.appendChild(stop1)
        gradient.appendChild(stop2)
        gradient.setAttribute('id', 'linear')
        gradient.setAttribute('x1', '0%')
        gradient.setAttribute('y1', '50%')
        gradient.setAttribute('x2', '100%')
        gradient.setAttribute('y2', '50%')

        defs.appendChild(gradient)
        this.element.appendChild(defs)
    }

    applyZoom(): void {}

    finish(): void {}
}

abstract class SVGShapeRenderer {
    constructor(public shape: Shape) {}

    abstract render(): SVGElement
}

class SVGShapeRendererFactory {
    make(shape: Shape): SVGShapeRenderer {
        if (shape instanceof Rectangle) return new SVGRectangleRenderer(shape)
        if (shape instanceof Circle) return new SVGCircleRenderer(shape)
        if (shape instanceof Triangle) return new SVGTriangleRenderer(shape)
        else return new SVGNullRenderer(shape)
    }
}

class SVGNullRenderer extends SVGShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', 'g')
    }
}

class SVGColorDecorator extends SVGShapeRenderer {
    constructor(public obj: SVGShapeRenderer) {
        super(obj.shape)
    }

    render(): SVGElement {
        let e = this.obj.render()
        if (e.tagName == 'g') {
            let realElement = <SVGElement>e.firstElementChild
            realElement.setAttribute('style', `stroke: black; fill: ${this.shape.color}`)
            realElement.setAttribute('fill-opacity', '1.0')
        } else {
            e.setAttribute('style', `stroke: black; fill: ${this.shape.color}`)
            e.setAttribute('fill-opacity', '1.0')
        }
        return e
    }
}

class SVGWireframeDecorator extends SVGShapeRenderer {
    constructor(public obj: SVGShapeRenderer) {
        super(obj.shape)
    }

    render(): SVGElement {
        let e = this.obj.render()
        if (e.tagName == 'g') {
            let realElement = <SVGElement>e.firstElementChild
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`)
            realElement.setAttribute('fill-opacity', '0.0')
        } else {
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`)
            e.setAttribute('fill-opacity', '0.0')
        }
        return e
    }
}

class SVGGradientDecorator extends SVGShapeRenderer {
    constructor(public obj: SVGShapeRenderer) {
        super(obj.shape)
    }

    render(): SVGElement {
        let e = this.obj.render()
        if (e.tagName == 'g') {
            let realElement = <SVGElement>e.firstElementChild
            realElement.setAttribute('style', `stroke: black; fill: url(#linear)`)
            e.setAttribute('fill-opacity', '1.0')
        } else {
            e.setAttribute('style', `stroke: black; fill: url(#linear)`)
            e.setAttribute('fill-opacity', '1.0')
        }
        return e
    }
}

class SVGRectangleRenderer extends SVGShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(): SVGElement {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        const shape = <Rectangle>this.shape

        g.setAttribute(
            'transform',
            `translate(${shape.center.x}, ${shape.center.y}) rotate(${shape.angle})`
        )
        e.setAttribute('width', shape.width.toString())
        e.setAttribute('height', shape.height.toString())
        e.setAttribute('x', (-shape.width / 2).toString())
        e.setAttribute('y', (-shape.height / 2).toString())

        g.appendChild(e)
        return g
    }
}

class SVGCircleRenderer extends SVGShapeRenderer {
    constructor(shape: Shape) {
        super(shape)
    }

    render(): SVGElement {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
        const shape = <Circle>this.shape

        e.setAttribute('cx', shape.center.x.toString())
        e.setAttribute('cy', shape.center.y.toString())
        e.setAttribute('rx', shape.rx.toString())
        e.setAttribute('ry', shape.ry.toString())

        return e
    }
}

class SVGTriangleRenderer extends SVGShapeRenderer {
    render(): SVGElement {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
        const shape = <Triangle>this.shape

        e.setAttribute(
            'points',
            shape.p0.x +
                ',' +
                shape.p0.y +
                ' ' +
                shape.p1.x +
                ',' +
                shape.p1.y +
                ' ' +
                shape.p2.x +
                ',' +
                shape.p2.y
        )

        return e
    }
}
