import { Shape } from './shape'
import {
    Action,
    CreateCircleAction,
    CreateRectangleAction,
    TranslateAction,
    RotateAction,
} from './actions'
import { Renderer } from '../view/renderer'
import { UndoManager } from './undo'
import { LayersManager } from './layers'
import { XMLConverterVisitor } from '../controller/converter';

export class SimpleDrawDocument {
    objects = new Array<Shape>()
    undoManager = new UndoManager()
    layersManager = new LayersManager()

    undo() {
        this.undoManager.undo()
    }

    redo() {
        this.undoManager.redo()
    }

    draw(render: Renderer): void {
        // this.objects.forEach(o => o.draw(ctx))
        const objects = this.layersManager.mapObjectsToLayers(this.objects)
        const layers = this.layersManager.getOrderedLayers();
        render.draw(objects, layers)
    }

    add(r: Shape): void {
        this.objects.push(r)
        r.layer = this.layersManager.activeLayer
    }

    do<T>(a: Action<T>): T {
        this.undoManager.onActionDone(a)
        return a.do()
    }

    save(){
        let visitor = new XMLConverterVisitor;
        for (const object of this.objects) {
            console.log(object.accept(visitor));
        }
    }

    createRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ): Shape {
        return this.do(new CreateRectangleAction(this, x, y, width, height, color))
    }

    createCircle(x: number, y: number, radius: number): Shape {
        return this.do(new CreateCircleAction(this, x, y, radius))
    }

    translate(s: Shape, xd: number, yd: number): void {
        return this.do(new TranslateAction(this, s, xd, yd))
    }

    rotate(s: Shape, angled: number): void {
        return this.do(new RotateAction(this, s, angled))
    }
}
