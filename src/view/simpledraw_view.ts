import { SimpleDrawDocument } from '../model/document'
import { Renderer } from './renderer'
import { Interpreter } from '../controller/interpreter';
import { SimpleDrawAPI } from '../controller/simpledraw_api';
import { ClickController } from '../controller/click_controller';

export class SimpleDrawView {
    readonly FRAMERATE_MS = 16
    renderers = new Array<Renderer>()
    document = new SimpleDrawDocument()
    api: SimpleDrawAPI
    interpreter: Interpreter
    click_controller: ClickController

    constructor() {
        this.api = new SimpleDrawAPI(this.document)
        this.interpreter = new Interpreter(this.api)
        this.click_controller = new ClickController(this.api)

        window.setInterval(() => {
            this.render()
        }, this.FRAMERATE_MS)

        document.getElementById("circle").addEventListener("click", (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_CIRCLE))
        })

        document.getElementById("square").addEventListener("click", (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_SQUARE))
        })

        document.getElementById("triangle").addEventListener("click", (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_TRIANGLE))
        })

        document.getElementById("translate").addEventListener("submit", (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.TRANSLATE))
        })

        document.getElementById("rotate").addEventListener("submit", (e: Event) => {
            e.preventDefault()
            const angle = Number(document.getElementById("angle").nodeValue);

            if (!isNaN(angle))
                this.click_controller.processEvent(new UserEventAction(Action.ROTATE, {"angle": angle}))
        })
        document.getElementById("grid").addEventListener("submit", (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.GRID))
        })

        document.getElementById("scale").addEventListener("submit", (e: Event) => {
            e.preventDefault()
            const sx = Number(document.getElementById("sx").nodeValue);
            const sy = Number(document.getElementById("sy").nodeValue);

            if (!isNaN(sx) && !isNaN(sy))
                this.click_controller.processEvent(new UserEventAction(Action.SCALE, {"sx": sx, "sy": sy}))
        })

        document.body.addEventListener('click', (e: Event) => {
            this.click_controller.processEvent(new UserEventPoint(new Point(100, 100)))
        }, true); 
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
    GRID,
    SCALE
}

export abstract class UserEvent {}

export class UserEventAction extends UserEvent {
    args: any = {}

    constructor(public action: Action, args?: any){
        super()
        this.args = args;
    }
}

export class UserEventPoint extends UserEvent {
    constructor(public point: Point){
        super()
    }
}