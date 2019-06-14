'use strict'

import 'mocha'
import { expect } from 'chai'
import { SimpleDrawDocument } from './model/document'
import { Interpreter } from './controller/interpreter'
import { SimpleDrawAPI, CreateSquareExecuter } from './controller/simpledraw_api'
import {
    ClickController,
    IdleState,
    ActionPressedState,
    FirstPointClickedState,
} from './controller/click_controller'
import { UserEventAction, Action, UserEventPoint } from './view/simpledraw_view'
import { Point } from './controller/utils'

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
        const c1 = sdd.createCircle(new Point(50, 50), 30, '#F6D55C')
        expect(c1.layer).to.equal('default')
        sdd.layersManager.activeLayer = 'new layer'
        const c2 = sdd.createCircle(new Point(50, 50), 30, '#F6D55C')
        expect(c2.layer).to.equal('new layer')
    })

    it('Objects are mapped to their respective layers', () => {
        const sdd = new SimpleDrawDocument()
        sdd.layersManager.createLayer('1')
        const s1 = sdd.createCircle(new Point(50, 50), 30, '#F6D55C')
        const s2 = sdd.createCircle(new Point(50, 50), 30, '#F6D55C')
        sdd.layersManager.createLayer('2')
        const s3 = sdd.createCircle(new Point(50, 50), 30, '#F6D55C')
        sdd.layersManager.createLayer('3')
        sdd.layersManager.createLayer('4')
        const s4 = sdd.createCircle(new Point(50, 50), 30, '#F6D55C')

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
        const inter = new Interpreter(new SimpleDrawAPI(new SimpleDrawDocument()))

        expect(inter.eval('add square 12 13 14 15 #ffffff')).to.equal(true)
        expect(inter.eval('add circle 20 30 5 #abcdef')).to.equal(true)
        expect(inter.eval('add triangle 5 6 6 7 1 4 #123ABC')).to.equal(true)
        expect(inter.eval('translate 100 244 124 764')).to.equal(true)
        expect(inter.eval('rotate 90 244 124')).to.equal(true)
        expect(inter.eval('scale 100 244 124 764')).to.equal(true)
        expect(inter.eval('grid 100 244 2 5')).to.equal(true)
        expect(inter.eval('undo')).to.equal(true)
        expect(inter.eval('redo')).to.equal(true)
    })

    it('Invalid strings are detected as such', () => {
        const inter = new Interpreter(new SimpleDrawAPI(new SimpleDrawDocument()))

        expect(inter.eval('asdgf asda asd')).to.equal(false)
        expect(inter.eval('add ajsdasf 20 30 #abcdef')).to.equal(false)
        expect(inter.eval('add triangle 5 6 6 1 4 #123ABC')).to.equal(false)
        expect(inter.eval('add triangle 5 6 6 1 1 4 #1234J4')).to.equal(false)
        expect(inter.eval('translate 100 244 124')).to.equal(false)
        expect(inter.eval('unde')).to.equal(false)
    })
})

describe('GUI input state machine', () => {
    it('Goes through the right states on button -> point actions', () => {
        const cc = new ClickController(new SimpleDrawAPI(new SimpleDrawDocument()))
        const event1 = new UserEventAction(Action.ROTATE)
        const event2 = new UserEventPoint(new Point(100, 100))

        expect(cc.currState.constructor.name).to.equal(IdleState.name)
        cc.processEvent(event1)
        expect(cc.currState.constructor.name).to.equal(ActionPressedState.name)
        cc.processEvent(event2)
        expect(cc.currState.constructor.name).to.equal(IdleState.name)
    })

    it('Goes through the right states on button -> point -> point actions', () => {
        const cc = new ClickController(new SimpleDrawAPI(new SimpleDrawDocument()))
        const event1 = new UserEventAction(Action.TRANSLATE)
        const event2 = new UserEventPoint(new Point(100, 100))
        const event3 = new UserEventPoint(new Point(200, 200))

        expect(cc.currState.constructor.name).to.equal(IdleState.name)
        cc.processEvent(event1)
        expect(cc.currState.constructor.name).to.equal(ActionPressedState.name)
        cc.processEvent(event2)
        expect(cc.currState.constructor.name).to.equal(FirstPointClickedState.name)
        cc.processEvent(event3)
        expect(cc.currState.constructor.name).to.equal(IdleState.name)
    })

    it('Resets to the Idle state when an invalid input sequence is done', () => {
        const cc = new ClickController(new SimpleDrawAPI(new SimpleDrawDocument()))
        const event1 = new UserEventAction(Action.TRANSLATE)
        const event2 = new UserEventAction(Action.TRANSLATE)

        expect(cc.currState.constructor.name).to.equal(IdleState.name)
        cc.processEvent(event1)
        expect(cc.currState.constructor.name).to.equal(ActionPressedState.name)
        cc.processEvent(event2)
        expect(cc.currState.constructor.name).to.equal(IdleState.name)
    })
})

describe('Dimensions calculus', () => {
    it('Rectangle dimensions are calculated correctly given any two points', () => {
        const exe = new CreateSquareExecuter()

        let d = exe.calculateDimensions(new Point(100, 100), new Point(200, 200))
        expect(d[0].x).to.equal(150)
        expect(d[0].y).to.equal(150)
        expect(d[1]).to.equal(100)
        expect(d[2]).to.equal(100)

        d = exe.calculateDimensions(new Point(20, 30), new Point(10, 10))
        expect(d[0].x).to.equal(15)
        expect(d[0].y).to.equal(20)
        expect(d[1]).to.equal(10)
        expect(d[2]).to.equal(20)

        d = exe.calculateDimensions(new Point(40, 200), new Point(50, 70))
        expect(d[0].x).to.equal(45)
        expect(d[0].y).to.equal(135)
        expect(d[1]).to.equal(10)
        expect(d[2]).to.equal(130)

        d = exe.calculateDimensions(new Point(50, 70), new Point(40, 200))
        expect(d[0].x).to.equal(45)
        expect(d[0].y).to.equal(135)
        expect(d[1]).to.equal(10)
        expect(d[2]).to.equal(130)
    })
})
