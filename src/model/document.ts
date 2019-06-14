import { Shape } from './shape'
import {
    Action,
    CreateCircleAction,
    CreateRectangleAction,
    TranslateAction,
    RotateAction,
    CreateTriangleAction,
} from './actions'
import { Renderer } from '../view/renderer'
import { UndoManager } from './undo'
import { LayersManager } from './layers'
import { XMLConverterVisitor, Visitor } from '../controller/converter';

export class SimpleDrawDocument {
    objects = new Array<Shape>()
    observers = new Array<RendererObserver>()
    undoManager = new UndoManager()
    layersManager = new LayersManager()

    undo() {
        this.undoManager.undo()
    }

    redo() {
        this.undoManager.redo()
    }

    add(r: Shape): void {
        this.objects.push(r)
        r.layer = this.layersManager.activeLayer
    }

    do<T>(a: Action<T>): T {
        this.undoManager.onActionDone(a)
        return a.do()
    }

    notifyObservers(): void {
        for (const obs of this.observers)
            obs.notify(this)
    }

    save(saveMode: Visitor){

        // let doc: XMLDocument = document.implementation.createDocument("", "", null);
        // let savedObjets = doc.createElement("objects");
        // let visitor = new XMLConverterVisitor(doc);
        // for (const object of this.objects) {
        //     savedObjets.appendChild(object.accept(visitor));
        // }
        // doc.appendChild(savedObjets);
        //try to write into file later cause it's "dangerous", either blob or file
        //let newFile = new File(, { type: "text/xml", endings: 'native' });
        // console.log(doc);

        saveMode.visitAll(this.objects)
        
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

    createCircle(x: number, y: number, radius: number, color: string): Shape {
        return this.do(new CreateCircleAction(this, x, y, radius, color))
    }

    createTriangle(x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        color: string): Shape {
            return this.do(new CreateTriangleAction(this, x1, y1, x2, y2, x3, y3, color))
        }

    translate(s: Shape, xd: number, yd: number): void {
        return this.do(new TranslateAction(this, s, xd, yd))
    }

    rotate(s: Shape, angled: number): void {
        return this.do(new RotateAction(this, s, angled))
    }

    getObjectsForRendering(): Map<String, Shape[]> {
        return this.layersManager.mapObjectsToLayers(this.objects)
    }

    getLayersForRendering(): String[] {
        return this.layersManager.getOrderedLayers()
    }

    registerObserver(observer: RendererObserver) {
        this.observers.push(observer)
    }
}

export interface RendererObserver {
    notify(document: SimpleDrawDocument): void
}