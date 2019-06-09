'use strict'

import { SimpleDrawDocument } from '../model/document'
import { Action, Point } from '../view/simpledraw_view'

export class SimpleDrawAPI {
    executers = new Map<Action, ActionExecuter>()

    constructor(public document: SimpleDrawDocument) {
        this.executers.set(Action.CREATE_CIRCLE, new CreateCircleExecuter())
        this.executers.set(Action.CREATE_SQUARE, new CreateSquareExecuter())
        this.executers.set(Action.CREATE_TRIANGLE, new CreateTriangleExecuter())
        this.executers.set(Action.TRANSLATE, new TranslateExecuter())
        this.executers.set(Action.ROTATE, new RotateExecuter())
        this.executers.set(Action.SCALE, new ScaleExecuter())
        this.executers.set(Action.GRID, new GridExecuter())
    }

    execute(action: Action, args: any, points: Array<Point>): boolean {
        console.log(Action[action] + ' with args ' + args + ' and ' + points.length + ' points')
        console.log(args)

        if (this.executers.has(action)) {
            this.executers.get(action).executeAction(this.document, args, points)
            return true
        } else return false
    }
}

interface ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Array<Point>): void
}

//args = {radius}, points = [center, point]
class CreateCircleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        const centre = points[0]
        let radius;
        if (points.length > 1) {
            const point = points[1]
            radius = Math.sqrt(Math.pow(point.x - centre.x, 2) + Math.pow(point.y - centre.y, 2))
        }
        else
            radius = args.radius
        document.createCircle(centre.x, centre.y, radius)
        console.log('create circle')
    }
}

//args = {}, points = [corner1, corner2]
class CreateSquareExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        const dimensions = this.calculateDimensions(points[0], points[1])
        document.createRectangle(dimensions[0].x, dimensions[0].y, dimensions[1], dimensions[2], '#123123')
        console.log('create square')
    }

    calculateDimensions(p1: Point, p2: Point): any[] {
        let topLeftCorner: Point
        let width: Number
        let height: Number

        if (p2.x >= p1.x && p2.y >= p1.y) {
            topLeftCorner = p1
            width = p2.x - p1.x
            height = p2.y - p1.y
        }
        if (p2.x >= p1.x && p2.y <= p1.y) {
            topLeftCorner = new Point(p1.x, p2.y)
            width = p2.x - p1.x
            height = p1.y - p2.y
        }
        if (p2.x <= p1.x && p2.y <= p1.y) {
            topLeftCorner = p2;
            width = p1.x - p2.x
            height = p1.y - p2.y
        }
        if (p2.x <= p1.x && p2.y >= p1.y) {
            topLeftCorner = new Point(p2.x, p1.y)
            width = p1.x - p2.x
            height = p2.y - p1.y
        }
        return [topLeftCorner, width, height]
    }
}

//args = {}, points = [vertex1, vertex2, vertex3]
class CreateTriangleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log('create triangle')
    }
}

//args = {}, points = [origin, destiny]
class TranslateExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log('translate')
    }
}

//args = {angle}, points = [point]
class RotateExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log('rotate')
    }
}

//args = {sx, sy}, points = [point]
class ScaleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log('scale')
    }
}

//args = {horizontal_units, vertical_units}, points = [point]
class GridExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log('grid')
    }
}
