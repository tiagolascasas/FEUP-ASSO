import { expect } from 'chai'
import 'mocha'
import { SimpleDrawDocument } from './document';

describe('Layers', () => {
    const sdd = new SimpleDrawDocument()

    it('Layers are added', () => {
        expect(sdd.layersManager.layers.length).to.equal(1)
        sdd.layersManager.createLayer('new layer')
        expect(sdd.layersManager.layers.length).to.equal(2)
    })

    it('Added objects belong to the active layer', () => {
        const c1 = sdd.createCircle(50, 50, 30)
        expect(c1.layer).to.equal("default")
        sdd.layersManager.activeLayer = "new layer"
        const c2 = sdd.createCircle(50, 50, 30)
        expect(c2.layer).to.equal("new layer")
    })
})
