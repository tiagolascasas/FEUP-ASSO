import { Visitor } from "../controller/converter";

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

    abstract accept(visitor: Visitor): Element;
}

export class Rectangle extends Shape {
    constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {
        super(x, y)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitRectangle(this)
    }
}

export class Circle extends Shape {
    constructor(public x: number, public y: number, public radius: number) {
        super(x, y)
    }

    accept(visitor: Visitor): Element {
        return visitor.visitCircle(this)
    }
}