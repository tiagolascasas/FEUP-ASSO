'use strict'

import { Shape, Circle, Rectangle, Triangle } from './shape'
import { SimpleDrawDocument } from './document'
import { Point } from '../controller/utils';

export interface Action<T> {
    do(): T
    undo(): void
}

abstract class CreateShapeAction<S extends Shape> implements Action<S> {
    constructor(private doc: SimpleDrawDocument, public readonly shape: S, public layer: String) {}

    do(): S {
        this.doc.add(this.shape)
        return this.shape
    }

    undo() {
        this.doc.objects = this.doc.objects.filter(o => o !== this.shape)
    }
}

export class CreateCircleAction extends CreateShapeAction<Circle> {
    constructor(
        doc: SimpleDrawDocument,
        private center: Point,
        private radius: number,
        private color: string
    ) {
        super(doc, new Circle(center, radius, color), doc.layersManager.activeLayer)
    }
}

export class CreateRectangleAction extends CreateShapeAction<Rectangle> {
    constructor(
        doc: SimpleDrawDocument,
        private center: Point,
        private width: number,
        private height: number,
        private color: string
    ) {
        super(doc, new Rectangle(center, width, height, color), doc.layersManager.activeLayer)
    }
}

export class CreateTriangleAction extends CreateShapeAction<Triangle> {
    constructor(
        doc: SimpleDrawDocument,
        private p0: Point,
        private p1: Point,
        private p2: Point,
        private color: string
    ) {
        super(doc, new Triangle(p0, p1, p2, color), doc.layersManager.activeLayer)
    }
}

export class TranslateAction implements Action<void> {
    oldPoint: Point

    constructor(
        public shape: Shape,
        private newPoint: Point
    ) {
    }

    do(): void {
        this.oldPoint = this.shape.center
        this.shape.translate(this.newPoint)
    }

    undo() {
        this.shape.translate(this.oldPoint)
    }
}

export class RotateAction implements Action<void> {
    oldAngle: number

    constructor(public shape: Shape, public angled: number) {}

    do(): void {
        this.oldAngle = this.shape.angle
        this.shape.rotate(this.angled)
    }
    undo(): void {
        this.shape.angle = this.oldAngle
    }
}

export class ScaleAction implements Action<void> {
    constructor(public shape: Shape, public scaled: Point) {}

    do(): void {
        this.shape.scale(this.scaled.x,this.scaled.y)
    }
    undo(): void {
        this.shape.scale(1.0/this.scaled.x, 1.0/this.scaled.y)
    }
}
