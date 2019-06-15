'use strict'

import { Shape } from './shape'
import {
    Action,
    CreateCircleAction,
    CreateRectangleAction,
    TranslateAction,
    RotateAction,
    ScaleAction,
    CreateTriangleAction,
} from './actions'
import { UndoManager } from './undo'
import { LayersManager } from './layers'
import { Visitor } from '../controller/converter'
import { Point } from '../controller/utils';

export class SimpleDrawDocument {
    objects = new Array<Shape>()
    rendererObservers = new Array<RendererObserver>()
    layerObservers = new Array<LayersObserver>()
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

    notifyRendererObservers(): void {
        for (const obs of this.rendererObservers) obs.notify(this)
    }

    notifyLayersObservers(): void {
        for (const obs of this.layerObservers) obs.notify(this.getLayersForRendering())
    }

    save(saveMode: Visitor) {
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

    createRectangle(center: Point, width: number, height: number, color: string): Shape {
        return this.do(new CreateRectangleAction(this, center, width, height, color))
    }

    createCircle(center: Point, radius: number, color: string): Shape {
        return this.do(new CreateCircleAction(this, center, radius, color))
    }

    createTriangle(
        p0: Point,
        p1: Point,
        p2: Point,
        color: string
    ): Shape {
        return this.do(new CreateTriangleAction(this, p0, p1, p2, color))
    }

    translate(s: Shape, newPoint: Point): void {
        return this.do(new TranslateAction( s, newPoint))
    }

    rotate(s: Shape, angled: number): void {
        return this.do(new RotateAction(s, angled))
    }

    scale(s: Shape, scaled: Point): void{
        return this.do(new ScaleAction(s, scaled))
    }

    getObjectsForRendering(): Map<String, Shape[]> {
        return this.layersManager.mapObjectsToLayers(this.objects)
    }

    getLayersForRendering(): string[] {
        return this.layersManager.getOrderedLayers()
    }

    registerRendererObserver(observer: RendererObserver) {
        this.rendererObservers.push(observer)
    }

    registerLayersObserver(observer: LayersObserver) {
        this.layerObservers.push(observer)
    }

    createLayer(layer: string): void {
        this.layersManager.createLayer(layer)
        this.notifyLayersObservers()
    }

    setLayer(layer: string): void {
        this.layersManager.setActiveLayer(layer)
        this.notifyLayersObservers()
    }
}

export interface RendererObserver {
    notify(document: SimpleDrawDocument): void
}

export interface LayersObserver {
    notify(layers: string[]): void
}
