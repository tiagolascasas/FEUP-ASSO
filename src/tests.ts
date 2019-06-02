import 'mocha'
import { expect } from 'chai'
import { SimpleDrawDocument } from './document'
import { Interpreter } from './REPL'

describe('Layers', () => {
    it('Layers are added', () => {
        const sdd = new SimpleDrawDocument()
        expect(sdd.layersManager.layers.length).to.equal(1)
        sdd.layersManager.createLayer('new layer')
        expect(sdd.layersManager.layers.length).to.equal(2)
    })

    it('Active layer has the most priority, others are unchanged', () => {
        const sdd = new SimpleDrawDocument()
        sdd.layersManager.createLayer('1')
        sdd.layersManager.createLayer('2')
        sdd.layersManager.createLayer('3')
        sdd.layersManager.createLayer('4')
        expect(sdd.layersManager.layers).to.eql(['4', '3', '2', '1', 'default'])
        sdd.layersManager.setActiveLayer('2')
        expect(sdd.layersManager.layers).to.eql(['2', '4', '3', '1', 'default'])
        expect(sdd.layersManager.getOrderedLayers()).to.eql(
            ['2', '4', '3', '1', 'default'].reverse()
        )
    })

    it('New objects belong to the active layer', () => {
        const sdd = new SimpleDrawDocument()
        const c1 = sdd.createCircle(50, 50, 30)
        expect(c1.layer).to.equal('default')
        sdd.layersManager.activeLayer = 'new layer'
        const c2 = sdd.createCircle(50, 50, 30)
        expect(c2.layer).to.equal('new layer')
    })

    it('Objects are mapped to their respective layers', () => {
        const sdd = new SimpleDrawDocument()
        sdd.layersManager.createLayer('1')
        const s1 = sdd.createCircle(50, 50, 30)
        const s2 = sdd.createCircle(50, 50, 30)
        sdd.layersManager.createLayer('2')
        const s3 = sdd.createCircle(50, 50, 30)
        sdd.layersManager.createLayer('3')
        sdd.layersManager.createLayer('4')
        const s4 = sdd.createCircle(50, 50, 30)

        const map = sdd.layersManager.mapObjectsToLayers(sdd.objects)

        expect(map.get('1').length).to.equal(2)
        expect(map.get('2').length).to.equal(1)
        expect(map.get('3').length).to.equal(0)
        expect(map.get('4').length).to.equal(1)
        expect(map.get('1')[0]).to.equal(s1)
        expect(map.get('1')[1]).to.equal(s2)
        expect(map.get('2')[0]).to.equal(s3)
        expect(map.get('4')[0]).to.equal(s4)
    })
})

describe('REPL', () => {
    it('Valid strings are parsed correctly', () => {
        const sdd = new SimpleDrawDocument()
        const inter = new Interpreter(sdd)

        expect(inter.eval('add square 12 13 14 15 #ffffff')).to.equal(true)
        expect(inter.eval('add circle 20 30 #abcdef')).to.equal(true)
        expect(inter.eval('add triangle 5 6 6 7 1 4 #123ABC')).to.equal(true)
        expect(inter.eval('move 100 244 124 764')).to.equal(true)
    })

    it('Invalid strings are detected as such', () => {
        const sdd = new SimpleDrawDocument()
        const inter = new Interpreter(sdd)

        expect(inter.eval('asdgf asda asd')).to.equal(false)
        expect(inter.eval('add ajsdasf 20 30 #abcdef')).to.equal(false)
        expect(inter.eval('add triangle 5 6 6 1 4 #123ABC')).to.equal(false)
        expect(inter.eval('add triangle 5 6 6 1 1 4 #1234J4')).to.equal(false)
        expect(inter.eval('move 100 244 124')).to.equal(false)
    })
})
