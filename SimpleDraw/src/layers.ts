import { Shape } from "./shape";

export class LayersManager {
    layers = new Array<String>();
    activeLayer: String;

    constructor() {
        this.createLayer("default");
        this.setActiveLayer("default");
    }

    createLayer(layerName: String): void {
        if (this.layers.indexOf(layerName) == -1) this.layers.push(layerName);
    }

    setActiveLayer(layerName: String): boolean {
        if (this.layers.indexOf(layerName) != -1) {
            this.activeLayer = layerName;
            return true;
        } else return false;
    }
    
    mapObjectsToLayers(objects: Array<Shape>): Map<String, Array<Shape>> {
        const map = new Map<String, Array<Shape>>()

        this.layers.forEach((layer) => {
            let objsInLayer: Array<Shape> = new Array<Shape>()

            objects.forEach((obj) => {
                if (obj.layer === layer)
                    objsInLayer.push(obj)
            })
            map.set(layer, objsInLayer);
        })

        return map;
    }
}