"use strict";

import { Renderer } from "./renderer";
import { Shape, Rectangle, Circle } from "../model/shape";

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
                        shape.rx,
                        shape.ry,
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
                    if (this.colorMode) this.ctx.fill()
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
                    if (this.colorMode) this.ctx.fill()
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