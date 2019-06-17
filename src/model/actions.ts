'use strict'

import { Shape, Circle, Rectangle, Triangle } from './shape'
import { SimpleDrawDocument } from './document'
import { Point } from '../controller/utils'
import { Visitor } from 'controller/converter'

export interface Action<T> {
    do(): T
    undo(): void
    accept(visitor: Visitor): any
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

    abstract accept(visitor: Visitor): Element
}

export class CreateCircleAction extends CreateShapeAction<Circle> {
    constructor(
        doc: SimpleDrawDocument,
        public readonly center: Point,
        public readonly radius: number,
        public readonly color: string
    ) {
        super(doc, new Circle(center, radius, color), doc.layersManager.activeLayer)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCreateCircleAction(this)
    }
}

export class CreateRectangleAction extends CreateShapeAction<Rectangle> {
    constructor(
        doc: SimpleDrawDocument,
        public readonly center: Point,
        public readonly width: number,
        public readonly height: number,
        public readonly color: string
    ) {
        super(doc, new Rectangle(center, width, height, color), doc.layersManager.activeLayer)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCreateRectangleAction(this)
    }
}

export class CreateTriangleAction extends CreateShapeAction<Triangle> {
    constructor(
        doc: SimpleDrawDocument,
        public readonly p0: Point,
        public readonly p1: Point,
        public readonly p2: Point,
        public readonly color: string
    ) {
        super(doc, new Triangle(p0, p1, p2, color), doc.layersManager.activeLayer)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCreateTriangleAction(this)
    }
}

export class GridAction implements Action<void> {
    constructor(
        private doc: SimpleDrawDocument,
        private shape: Shape,
        private x_units: number,
        private y_units: number,
        private color: string
    ) {}

    do(): void {
        for (
            let i = 0, w = 0;
            i < this.x_units;
            i++, w += this.shape.getWidthFromCenter() * 2 + 5
        ) {
            for (
                let j = 0, h = 0;
                j < this.y_units;
                j++, h += this.shape.getHeightFromCenter() * 2 + 5
            ) {
                if (i == 0 && j == 0) continue
                const s = this.shape.clone()
                s.color = this.color
                s.isGrid = true
                s.translate(new Point(this.shape.center.x + w, this.shape.center.y + h))
                this.shape.children.push(s)
                this.doc.objects.push(s)
            }
        }
        this.shape.isGrid = true
    }

    undo(): void {
        for (const shape of this.shape.children)
            this.doc.objects = this.doc.objects.filter(o => o !== shape)
        this.shape.isGrid = false
    }

    accept(visitor: Visitor) {
        return
    }
}

export class TranslateAction implements Action<void> {
    oldPoint: Point

    constructor(
        public readonly shape: Shape,
        public readonly newPoint: Point,
        public readonly clickedPoint: Point
    ) {}

    do(): void {
        this.oldPoint = this.shape.center
        this.shape.translate(this.newPoint)

        if (this.shape.isGrid) {
            for (const s of this.shape.children) {
                const p = new Point(s.center.x - this.oldPoint.x, s.center.y - this.oldPoint.y)
                const np = new Point(this.newPoint.x + p.x, this.newPoint.y + p.y)
                s.translate(np)
            }
        }
    }

    undo() {
        this.shape.translate(this.oldPoint)

        if (this.shape.isGrid) {
            for (const s of this.shape.children) {
                const p = new Point(s.center.x - this.newPoint.x, s.center.y - this.newPoint.y)
                const np = new Point(this.oldPoint.x + p.x, this.oldPoint.y + p.y)
                s.translate(np)
            }
        }
    }

    accept(visitor: Visitor): Element {
        return visitor.visitTranslateAction(this)
    }
}

export class RotateAction implements Action<void> {
    oldAngle: number

    constructor(public shape: Shape, public angled: number, public readonly clickedPoint: Point) {}

    do(): void {
        this.oldAngle = this.shape.angle
        this.shape.rotate(this.angled)

        if (this.shape.isGrid) {
            for (const s of this.shape.children) s.rotate(this.angled)
        }
    }
    undo(): void {
        this.shape.angle = this.oldAngle

        if (this.shape.isGrid) {
            for (const s of this.shape.children) s.angle = this.oldAngle
        }
    }

    accept(visitor: Visitor): Element {
        return visitor.visitRotateAction(this)
    }
}

export class ScaleAction implements Action<void> {
    constructor(public shape: Shape, public scaled: Point, public readonly clickedPoint: Point) {}

    do(): void {
        this.shape.scale(this.scaled.x, this.scaled.y)

        if (this.shape.isGrid) {
            for (const s of this.shape.children) s.scale(this.scaled.x, this.scaled.y)
        }
    }
    undo(): void {
        this.shape.scale(1.0 / this.scaled.x, 1.0 / this.scaled.y)

        if (this.shape.isGrid) {
            for (const s of this.shape.children) s.scale(1.0 / this.scaled.x, 1.0 / this.scaled.y)
        }
    }

    accept(visitor: Visitor): Element {
        return visitor.visitScaleAction(this)
    }
}
