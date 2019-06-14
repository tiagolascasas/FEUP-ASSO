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

    isHit(point: Point): boolean {
        return false
    }

    scale(sx: number, sy: number): void {
        return
    }
}
