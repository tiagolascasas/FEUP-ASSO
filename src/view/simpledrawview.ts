import { SimpleDrawDocument } from '../model/document'
import { Renderer } from './renderer'
import { Interpreter } from 'controller/interpreter';

export class SimpleDrawView {
    readonly FRAMERATE_MS = 16
    renderers = new Array<Renderer>()
    document = new SimpleDrawDocument()
    //interpreter = new Interpreter(document)

    constructor() {
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
