import { Visitor } from "../controller/converter";
import { Point } from '../view/simpledraw_view'
import { Utils } from '../controller/utils'
export abstract class Shape {

    angle: number = 0
    color: string = "#FFFFFF"
    layer: String

    constructor(public x: number, public y: number) { }

    translate(xd: number, yd: number): void {
        this.x += xd
        this.y += yd
    }

    rotate(angled: number) {
        this.angle = (this.angle + angled) % 360
    }

    //any for now until better solution -> when solution change in converter too
    abstract accept(visitor: Visitor): any;

    abstract isHit(point: Point): boolean;
}

export class Rectangle extends Shape {
    constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {
        super(x, y)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitRectangle(this)
    }

    isHit(point: Point): boolean{
        let rectangleArea = this.width * this.height
        let centerPoint = new Point(this.x, this.y);
        let pointA = Utils.getRotatedPoint(centerPoint, this.angle, new Point(this.x - this.width / 2, this.y - this.height / 2))
        let pointB = Utils.getRotatedPoint(centerPoint, this.angle, new Point(this.x - this.width / 2, this.y + this.height / 2))
        let pointC = Utils.getRotatedPoint(centerPoint, this.angle, new Point(this.x + this.width / 2, this.y + this.height / 2))
        let pointD = Utils.getRotatedPoint(centerPoint, this.angle, new Point(this.x + this.width / 2, this.y - this.height / 2))

        let trianglesArea = Utils.getTriangleArea(pointA, pointB, point)
        trianglesArea += Utils.getTriangleArea(pointB, pointC, point) 
        trianglesArea += Utils.getTriangleArea(pointC, pointD, point)
        trianglesArea += Utils.getTriangleArea(pointD, pointA, point)
        
        return Math.abs(rectangleArea - trianglesArea) < 1
    }
}

export class Circle extends Shape {
    constructor(public x: number, public y: number, public radius: number, public color: string) {
        super(x, y)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCircle(this)
    }

    isHit(point: Point): boolean{
       return Math.hypot(point.x - this.x, point.y - this.y) < this.radius
    }
}