import 'mocha'
import { expect } from 'chai'
import { SimpleDrawDocument } from './document';
import { Shape } from './shape';
import { LayersManager } from './layers';

describe('Layers', () => {
    const sdd = new SimpleDrawDocument()

    it('Layers are added', () => {
        expect(sdd.layersManager.layers.length).to.equal(1)
        sdd.layersManager.createLayer('new layer')
        expect(sdd.layersManager.layers.length).to.equal(2)
    })

    it('New objects belong to the active layer', () => {
        const c1 = sdd.createCircle(50, 50, 30)
        expect(c1.layer).to.equal("default")
        sdd.layersManager.activeLayer = "new layer"
        const c2 = sdd.createCircle(50, 50, 30)
        expect(c2.layer).to.equal("new layer")
    })

    it('Objects are mapped to their respective layers', () => {
        const objs = new Array<Shape>()
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs.push(sdd.createCircle(50, 50, 30))
        objs[0].layer = "1"
        objs[1].layer = "2"
        objs[2].layer = "1"
        objs[3].layer = "4"
        objs[4].layer = "1"
        objs[5].layer = "3"
        objs[6].layer = "3"
        objs[7].layer = "4"

        const man = new LayersManager()
        man.createLayer("1")
        man.createLayer("2")
        man.createLayer("3")
        man.createLayer("4")

        const map = man.mapObjectsToLayers(objs)

        expect(map.get("1").length).to.equal(3)
        expect(map.get("2").length).to.equal(1)
        expect(map.get("3").length).to.equal(2)
        expect(map.get("4").length).to.equal(2)
        expect(map.get("1")[0]).to.equal(objs[0])
        expect(map.get("1")[1]).to.equal(objs[2])
        expect(map.get("2")[0]).to.equal(objs[1])
        expect(map.get("3")[0]).to.equal(objs[5])
    })
})
