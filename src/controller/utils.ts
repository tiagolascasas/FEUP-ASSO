import { Point } from '../view/simpledraw_view'

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
    let rotatedX = tempX * Math.cos(angle) - tempY * Math.sin(angle)
    let rotatedY = tempX * Math.sin(angle) + tempY * Math.cos(angle)

    // translate back
    return new Point(rotatedX + centerPoint.x, rotatedY + centerPoint.y)
  }

  static getTriangleArea(pointA: Point, pointB: Point, pointC: Point) {
    return (Math.abs(pointA.x * (pointB.y - pointC.y) + pointB.x * (pointC.y - pointA.y) + pointC.x * (pointA.y - pointB.y)) / 2);
  }
}