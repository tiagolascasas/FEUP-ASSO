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

    execute(action: Action, args: any, points: Array<Point>): void {
        console.log(Action[action] + " with args " + args + " and " + points.length + " points")
        this.executers.get(action).executeAction(this.document, args, points)
    }
}

interface ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Array<Point>): void
}

class CreateCircleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.createCircle(100, 100, 40)
        console.log("create circle")
    }
}

class CreateSquareExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        document.createRectangle(100, 100, 100, 100, "#123123")
        console.log("create square")
    }
}

class CreateTriangleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log("create triangle")
    }
}

class TranslateExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log("translate")
    }
}

class RotateExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log("rotate")
    }
}

class ScaleExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log("scale")
    }
}

class GridExecuter implements ActionExecuter {
    executeAction(document: SimpleDrawDocument, args: any, points: Point[]): void {
        console.log("grid")
    }
}
