'use strict'

export class Utils {
    static download(filename: string, text: any) {
        var element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
        element.setAttribute('download', filename)

        element.style.display = 'none'
        document.body.appendChild(element)

        element.click()

        document.body.removeChild(element)
    }

    static getRotatedPoint(centerPoint: Point, angle: number, point: Point): Point {
        // translate point to origin
        let tempX = point.x - centerPoint.x
        let tempY = point.y - centerPoint.y

        // now apply rotation
        let radAngle = (angle * Math.PI) / 180

        let rotatedX = tempX * Math.cos(radAngle) - tempY * Math.sin(radAngle)
        let rotatedY = tempX * Math.sin(radAngle) + tempY * Math.cos(radAngle)

        // translate back
        return new Point(rotatedX + centerPoint.x, rotatedY + centerPoint.y)
    }

    static getTriangleArea(pointA: Point, pointB: Point, pointC: Point) {
        return (
            Math.abs(
                pointA.x * (pointB.y - pointC.y) +
                    pointB.x * (pointC.y - pointA.y) +
                    pointC.x * (pointA.y - pointB.y)
            ) / 2
        )
    }
}

export class Point {
    constructor(public x: number, public y: number) {}

    isNil(): boolean {
        return this.x == -1 && this.y == -1
    }
}

export class NullPoint extends Point {
    constructor() {
        super(-1, -1)
    }
}
