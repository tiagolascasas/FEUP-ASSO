import { SimpleDrawDocument } from '../model/document'
import { Renderer } from './renderer'
import { Interpreter } from '../controller/interpreter';
import { Executor } from '../controller/executor';
import { ClickController } from '../controller/click_controller';

export class SimpleDrawView {
    readonly FRAMERATE_MS = 16
    renderers = new Array<Renderer>()
    document = new SimpleDrawDocument()
    executor: Executor
    interpreter: Interpreter
    click_controller: ClickController

    constructor() {
        this.executor = new Executor(this.document)
        this.interpreter = new Interpreter(this.executor)
        this.click_controller = new ClickController(this.executor)

        window.setInterval(() => {
            this.render()
        }, this.FRAMERATE_MS)
    }

    addRenderer(render: Renderer) {
        this.renderers.push(render)
    }

    render() {
        for (const renderer of this.renderers) {
            this.document.draw(renderer)
        }
    }
}

export class Point {
    constructor(public x: number, public y: number){}
}

export enum Action {
    CREATE_SQUARE,
    CREATE_CIRCLE,
    CREATE_TRIANGLE,
    TRANSLATE,
    ROTATE,
    GRID
}

export abstract class UserEvent {}

export class UserEventAction extends UserEvent {
    constructor(public action: Action){
        super()
    }
}

export class UserEventPoint extends UserEvent {
    constructor(public point: Point){
        super()
    }
}
