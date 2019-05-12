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
}