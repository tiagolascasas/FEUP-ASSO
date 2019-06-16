'use strict'

import { Visitor } from '../controller/converter'
import { Utils, Point } from '../controller/utils'

export abstract class Shape {
    public angle: number = 0
    public layer: String

    constructor(public center: Point, public color: string) {}

    translate(point: Point): void {
        this.center = point
        console.log(this.center)
    }

    rotate(angled: number) {
        if(angled < 0)
            angled = 360 + angled
        this.angle = (this.angle + angled) % 360
    }

    //any for now until better solution -> when solution change in converter too
    abstract accept(visitor: Visitor): any

    abstract isHit(point: Point): boolean

    abstract scale(sx: number, sy: number): void
}

export class Rectangle extends Shape {
    constructor(center: Point, public width: number, public height: number, color: string) {
        super(center, color)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitRectangle(this)
    }

    isHit(point: Point): boolean {
        const rectangleArea = this.width * this.height
        const centerPoint = this.center
        const pointA = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(centerPoint.x - this.width / 2, centerPoint.y - this.height / 2)
        )
        const pointB = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(centerPoint.x - this.width / 2, centerPoint.y + this.height / 2)
        )
        const pointC = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(centerPoint.x + this.width / 2, centerPoint.y + this.height / 2)
        )
        const pointD = Utils.getRotatedPoint(
            centerPoint,
            this.angle,
            new Point(centerPoint.x + this.width / 2, centerPoint.y - this.height / 2)
        )

        let trianglesArea = Utils.getTriangleArea(pointA, pointB, point)
        trianglesArea += Utils.getTriangleArea(pointB, pointC, point)
        trianglesArea += Utils.getTriangleArea(pointC, pointD, point)
        trianglesArea += Utils.getTriangleArea(pointD, pointA, point)

        return Math.abs(rectangleArea - trianglesArea) < 1
    }

    scale(sx: number, sy: number): void {
        let radAngle = (this.angle * Math.PI) / 180
        let addWidth = (Math.abs(Math.cos(radAngle)) * (sx - 1)) * this.width + (Math.abs(Math.sin(radAngle)) * (sy - 1)) * this.width
        let addHeight = (Math.abs(Math.cos(radAngle)) * (sy - 1)) * this.height + (Math.abs(Math.sin(radAngle)) * (sx - 1)) * this.height

        this.width += addWidth
        this.height += addHeight      
    }
}

export class Circle extends Shape {
    rx: number
    ry: number

    constructor(center: Point, public radius: number, color: string) {
        super(center, color)
        this.rx = radius
        this.ry = radius
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCircle(this)
    }

    isHit(point: Point): boolean {
        return Math.hypot(point.x - this.center.x, point.y - this.center.y) < this.radius
    }

    scale(sx: number, sy: number): void {
        let radAngle = (this.angle * Math.PI) / 180

        let addX= (Math.abs(Math.cos(radAngle)) * (sx - 1)) * this.rx + (Math.abs(Math.sin(radAngle)) * (sy - 1)) * this.rx
        let addY = (Math.abs(Math.cos(radAngle)) * (sy - 1)) * this.ry + (Math.abs(Math.sin(radAngle)) * (sx - 1)) * this.ry
        
        this.rx += addX
        this.ry += addY
    }
}

export class Triangle extends Shape {
    constructor(public p0: Point, public p1: Point, public p2: Point, color: string) {
        super(new Point((p0.x + p1.x + p2.x) / 3.0, (p0.y + p1.y + p2.y) / 3.0), color)
    }

    accept(visitor: Visitor) {
        return
    }

    //Taken from here: https://stackoverflow.com/a/34093754
    isHit(p: Point): boolean {
        
        const p0 = Utils.getRotatedPoint(this.center, this.angle, this.p0)
        const p1 = Utils.getRotatedPoint(this.center, this.angle, this.p1)
        const p2 = Utils.getRotatedPoint(this.center, this.angle, this.p2)

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
    const p0 = Utils.getRotatedPoint(this.center, this.angle, this.p0)
    const p1 = Utils.getRotatedPoint(this.center, this.angle, this.p1)
    const p2 = Utils.getRotatedPoint(this.center, this.angle, this.p2)
    
    let newp0 = new Point(sx * (p0.x - this.center.x) + this.center.x, sy * (p0.y - this.center.y) + this.center.y)
    let newp1 = new Point(sx * (p1.x - this.center.x) + this.center.x, sy * (p1.y - this.center.y) + this.center.y)
    let newp2 = new Point(sx * (p2.x - this.center.x) + this.center.x, sy * (p2.y - this.center.y) + this.center.y)
    
    this.p0 = Utils.getRotatedPoint(this.center, -this.angle, newp0)
    this.p1 = Utils.getRotatedPoint(this.center, -this.angle, newp1)
    this.p2 = Utils.getRotatedPoint(this.center, -this.angle, newp2)
    }

    translate(newPoint: Point){
        let delta = new Point(newPoint.x - this.center.x,newPoint.y - this.center.y)
        this.p0 = new Point(this.p0.x + delta.x, this.p0.y + delta.y)
        this.p1 = new Point(this.p1.x + delta.x, this.p1.y + delta.y)
        this.p2 = new Point(this.p2.x + delta.x, this.p2.y + delta.y)
        this.center = newPoint;
    }
}
