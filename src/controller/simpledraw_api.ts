'use strict'

import { SimpleDrawDocument } from '../model/document'
import { Action } from '../view/simpledraw_view'
import { Point } from './utils'

export class SimpleDrawAPI {
    readonly executers = new Map<Action, ActionExecuter>()

    constructor(public document: SimpleDrawDocument) {
        this.executers.set(Action.CREATE_CIRCLE, new CreateCircleExecuter())
        this.executers.set(Action.CREATE_SQUARE, new CreateSquareExecuter())
        this.executers.set(Action.CREATE_TRIANGLE, new CreateTriangleExecuter())
        this.executers.set(Action.TRANSLATE, new TranslateExecuter())
        this.executers.set(Action.ROTATE, new RotateExecuter())
        this.executers.set(Action.SCALE, new ScaleExecuter())
        this.executers.set(Action.GRID, new GridExecuter())
        this.executers.set(Action.UNDO, new UndoExecuter())
        this.executers.set(Action.REDO, new RedoExecuter())
        this.executers.set(Action.SET_LAYER, new SetLayerExecuter())
        this.executers.set(Action.ADD_LAYER, new AddLayerExecuter())
    }

    execute(action: Action, args: any, points: Array<Point>): boolean {
        if (args == undefined) args = {}
        if (this.executers.has(action)) {
            this.executers.get(action).executeAction(this.document, args, points)
            this.document.notifyRendererObservers()
            return true
        } else return false
    }
}

interface ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Array<Point>): void
}

//args = {radius}, points = [center]
//args = {}, points = [center, point]
class CreateCircleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        const centre = points[0]
        let radius
        if (points.length > 1) {
            const point = points[1]
            radius = Math.sqrt(Math.pow(point.x - centre.x, 2) + Math.pow(point.y - centre.y, 2))
        } else radius = args.radius
        document.createCircle(centre, radius, '#F6D55C')
    }
}

//args = {}, points = [corner1, corner2]
export class CreateSquareExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        const dimensions = this.calculateDimensions(points[0], points[1])
        document.createRectangle(dimensions[0], dimensions[1], dimensions[2], '#20639B')
    }

    public calculateDimensions(p1: Point, p2: Point): any[] {
        let topLeftCorner: Point
        let width: number
        let height: number

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
            topLeftCorner = p2
            width = p1.x - p2.x
            height = p1.y - p2.y
        }
        if (p2.x <= p1.x && p2.y >= p1.y) {
            topLeftCorner = new Point(p2.x, p1.y)
            width = p1.x - p2.x
            height = p2.y - p1.y
        }
        let centre = new Point(topLeftCorner.x + width / 2, topLeftCorner.y + height / 2)

        return [centre, width, height]
    }
}

//args = {}, points = [vertex1, vertex2, vertex3]
class CreateTriangleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.createTriangle(points[0], points[1], points[2], '#3CAEA3')
    }
}

//args = {}, points = [origin, destiny]
class TranslateExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.translate(points[0], points[1])
    }
}

//args = {angle}, points = [point]
class RotateExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.rotate(points[0],args.angle)       
    }
}

//args = {sx, sy}, points = [point]
class ScaleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.scale(points[0], new Point(args.sx, args.sy))  
    }
}

//args = {horizontal_units, vertical_units}, points = [point]
class GridExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log('grid')
    }
}

class UndoExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.undo()
    }
}

class RedoExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.redo()
    }
}

class AddLayerExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.createLayer(args.layer)
    }
}

class SetLayerExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.setLayer(args.layer)
    }
}
