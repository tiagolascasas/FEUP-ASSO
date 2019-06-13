'use strict'

import { Renderer } from './renderer'
import { Shape, Rectangle, Circle } from '../model/shape'

export class SVGRenderer extends Renderer {
    objs = new Array<Shape>()
    factory = new SVGShapeRendererFactory()

    constructor(elementID: string) {
        super(elementID)
        this.element = <HTMLElement>document.getElementById(elementID)
    }

    drawObjects(objs: Map<String, Array<Shape>>, layers: Array<String>): void {
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                let renderableObject = this.factory.make(shape)

                renderableObject = this.colorMode
                    ? new SVGColorDecorator(renderableObject)
                    : new SVGWireframeDecorator(renderableObject)

                const e = renderableObject.render()
                console.log(e)
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

abstract class SVGShapeRenderer {
    constructor(public shape: Shape) {}

    abstract render(): SVGElement
}

class SVGShapeRendererFactory {
    make(shape: Shape): SVGShapeRenderer {
        if (shape instanceof Rectangle) return new SVGRectangleRenderer(shape)
        if (shape instanceof Circle) return new SVGCircleRenderer(shape)
        if (shape instanceof Rectangle) return new SVGRectangleRenderer(shape)
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
        console.log('Decorator')
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
        console.log('Decorator')
        let e = this.obj.render()
        if (e.tagName == 'g') {
            let realElement = <SVGElement>e.firstElementChild
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`)
            e.setAttribute('fill-opacity', '0.0')
        } else {
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`)
            e.setAttribute('fill-opacity', '0.0')
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

        g.setAttribute('transform', `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`)
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

        e.setAttribute('cx', shape.x.toString())
        e.setAttribute('cy', shape.y.toString())
        e.setAttribute('rx', shape.rx.toString())
        e.setAttribute('ry', shape.ry.toString())

        return e
    }
}

class SVGTriangleRenderer extends SVGShapeRenderer {
    render(): SVGElement {
        return null
    }
}
