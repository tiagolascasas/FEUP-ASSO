import 'mocha'
import { expect } from 'chai'
import { SimpleDrawDocument } from './document';
import { Shape } from './shape';
import { LayersManager } from './layers';

describe('Layers', () => {
    it('Layers are added', () => {
        const sdd = new SimpleDrawDocument()
        expect(sdd.layersManager.layers.length).to.equal(1)
        sdd.layersManager.createLayer('new layer')
        expect(sdd.layersManager.layers.length).to.equal(2)
    })

    it('New objects belong to the active layer', () => {
        const sdd = new SimpleDrawDocument()
        const c1 = sdd.createCircle(50, 50, 30)
        expect(c1.layer).to.equal("default")
        sdd.layersManager.activeLayer = "new layer"
        const c2 = sdd.createCircle(50, 50, 30)
        expect(c2.layer).to.equal("new layer")
    })

    it('Objects are mapped to their respective layers', () => {
        const sdd = new SimpleDrawDocument()

        sdd.layersManager.createLayer("1")
        const s1 = sdd.createCircle(50, 50, 30)
        const s2 = sdd.createCircle(50, 50, 30)
        sdd.layersManager.createLayer("2")
        const s3 = sdd.createCircle(50, 50, 30)
        sdd.layersManager.createLayer("3")
        sdd.layersManager.createLayer("4")
        const s4 = sdd.createCircle(50, 50, 30)

        const map = sdd.layersManager.mapObjectsToLayers(sdd.objects)

        expect(map.get("1").length).to.equal(2)
        expect(map.get("2").length).to.equal(1)
        expect(map.get("3").length).to.equal(0)
        expect(map.get("4").length).to.equal(1)
        expect(map.get("1")[0]).to.equal(s1)
        expect(map.get("1")[1]).to.equal(s2)
        expect(map.get("2")[0]).to.equal(s3)
        expect(map.get("4")[0]).to.equal(s4)
    })
})
