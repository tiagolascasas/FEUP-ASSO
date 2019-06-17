'use strict'

import { Shape } from './shape'

export class LayersManager {
    layers = new Array<string>()
    activeLayer: string

    constructor() {
        this.createLayer('default')
        this.setActiveLayer('default')
    }

    createLayer(layerName: string): void {
        if (this.layers.indexOf(layerName) == -1) this.layers.unshift(layerName)
        this.setActiveLayer(layerName)
    }

    setActiveLayer(layerName: string): boolean {
        console.log(layerName)
        if (this.layers.indexOf(layerName) != -1) {
            this.activeLayer = layerName
            console.log("Setting active layer")
            return true
        } else return false
    }

    mapObjectsToLayers(objects: Array<Shape>): Map<string, Array<Shape>> {
        const map = new Map<string, Array<Shape>>()

        for (const layer of this.layers) {
            let objsInLayer: Array<Shape> = new Array<Shape>()

            for (const obj of objects) {
                if (obj.layer == layer) objsInLayer.push(obj)
            }
            map.set(layer, objsInLayer)
        }
        return map
    }

    getOrderedLayers(): Array<string> {
        let ret = this.layers.reverse()
        ret = ret.filter(o => o !== this.activeLayer)
        ret.push(this.activeLayer)
        return ret
    }
}
