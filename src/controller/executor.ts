'use strict'

import { SimpleDrawDocument } from '../model/document'
import { Action, Point } from '../view/simpledraw_view'

export class Executor {
    constructor(public document: SimpleDrawDocument) {}

    execute(action: Action, points: Array<Point>): void {
        console.log(action + " " + points)
    }
}
