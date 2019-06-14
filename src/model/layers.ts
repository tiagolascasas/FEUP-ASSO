import { Shape } from './shape'

export class LayersManager {
    layers = new Array<String>()
    activeLayer: String

    constructor() {
        this.createLayer('default')
        this.setActiveLayer('default')
    }

    createLayer(layerName: String): void {
        if (this.layers.indexOf(layerName) == -1) this.layers.push(layerName)
        this.setActiveLayer(layerName)
    }

    setActiveLayer(layerName: String): boolean {
        if (this.layers.indexOf(layerName) != -1) {
            this.activeLayer = layerName
            this.layers.splice(this.layers.indexOf(layerName), 1);
            this.layers.unshift(layerName);
            return true
        } else return false
    }

    mapObjectsToLayers(objects: Array<Shape>): Map<String, Array<Shape>> {
        const map = new Map<String, Array<Shape>>()

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
        const reversed = this.layers.reverse()
        const ret: Array<string> = []
        for (const layer of reversed)
            ret.push(layer.toString())
        return ret
    }
}
