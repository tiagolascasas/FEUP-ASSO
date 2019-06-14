import { Visitor } from '../controller/converter'
import { Point } from '../view/simpledraw_view'
import { Utils } from '../controller/utils'
export abstract class Shape {
    public angle: number = 0
    public layer: String

    constructor(public x: number, public y: number, public color: string) {}

    translate(xd: number, yd: number): void {
        this.x += xd
        this.y += yd
    }

    rotate(angled: number) {
        this.angle = (this.angle + angled) % 360
    }

    //any for now until better solution -> when solution change in converter too
    abstract accept(visitor: Visitor): any

    abstract isHit(point: Point): boolean

    abstract scale(sx: number, sy: number): void
}

export class Rectangle extends Shape {
    constructor(x: number, y: number, public width: number, public height: number, color: string) {
        super(x, y, color)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitRectangle(this)
    }

    isHit(point: Point): boolean {
        let rectangleArea = this.width * this.height
        let centerPoint = new Point(this.x, this.y)
        let pointA = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(this.x - this.width / 2, this.y - this.height / 2)
        )
        let pointB = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(this.x - this.width / 2, this.y + this.height / 2)
        )
        let pointC = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(this.x + this.width / 2, this.y + this.height / 2)
        )
        let pointD = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(this.x + this.width / 2, this.y - this.height / 2)
        )

        let trianglesArea = Utils.getTriangleArea(pointA, pointB, point)
        trianglesArea += Utils.getTriangleArea(pointB, pointC, point)
        trianglesArea += Utils.getTriangleArea(pointC, pointD, point)
        trianglesArea += Utils.getTriangleArea(pointD, pointA, point)

        return Math.abs(rectangleArea - trianglesArea) < 1
    }

    scale(sx: number, sy: number): void {
        this.width *= sx
        this.height *= sy
    }
}

export class Circle extends Shape {
    rx: number
    ry: number

    constructor(x: number, y: number, public radius: number, color: string) {
        super(x, y, color)
        this.rx = radius
        this.ry = radius
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCircle(this)
    }

    isHit(point: Point): boolean {
        return Math.hypot(point.x - this.x, point.y - this.y) < this.radius
    }

    scale(sx: number, sy: number): void {
        this.rx *= sx
        this.ry *= sy
    }
}

export class Triangle extends Shape {
    constructor(
        public x1: number,
        public y1: number,
        public x2: number,
        public y2: number,
        public x3: number,
        public y3: number,
        color: string
    ) {
        super((x1 + x2 + x3) / 3.0, (y1 + y2 + y3) / 3.0, color)
    }

    accept(visitor: Visitor) {
        return
    }

    //Taken from here: https://stackoverflow.com/a/34093754
    isHit(p: Point): boolean {
        const p0 = new Point(this.x1, this.y1)
        const p1 = new Point(this.x2, this.y2)
        const p2 = new Point(this.x3, this.y3)

        const dX = p.x - p2.x
        const dY = p.y - p2.y
        const dX21 = p2.x - p1.x
        const dY12 = p1.y - p2.y
        const D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y)
        const s = dY12 * dX + dX21 * dY
        const t = (p2.y - p0.y) * dX + (p0.x - p2.x) * dY
        if (D < 0) return s <= 0 && t <= 0 && s + t >= D
        return s >= 0 && t >= 0 && s + t <= D
    }

    scale(sx: number, sy: number): void {
        this.x1 = (sx * (this.x1 - this.x)) + this.x
        this.x2 = (sx * (this.x2 - this.x)) + this.x
        this.x3 = (sx * (this.x3 - this.x)) + this.x
        this.y1 = (sy * (this.y1 - this.y)) + this.y
        this.y2 = (sy * (this.y2 - this.y)) + this.y
        this.y3 = (sy * (this.y3 - this.y)) + this.y
    }
}
