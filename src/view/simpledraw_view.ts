'use strict'

import { SimpleDrawDocument, LayersObserver } from '../model/document'
import { Renderer } from './renderer'
import { Interpreter } from '../controller/interpreter'
import { SimpleDrawAPI } from '../controller/simpledraw_api'
import { ClickController } from '../controller/click_controller'
import { XMLConverterVisitor, TXTConverterVisitor } from '../controller/converter'
import { Point, NullPoint } from '../controller/utils'
import { loadXML } from '../controller/loadXML'

export class SimpleDrawView implements LayersObserver {
    renderers = new Array<Renderer>()
    document = new SimpleDrawDocument()
    api: SimpleDrawAPI
    interpreter: Interpreter
    click_controller: ClickController

    constructor() {
        this.api = new SimpleDrawAPI(this.document)
        this.interpreter = new Interpreter(this.api)
        this.click_controller = new ClickController(this.api)
        this.document.registerLayersObserver(this)

        document.getElementById('repl').addEventListener('submit', (e: Event) => {
            e.preventDefault()
            const replPrompt: HTMLInputElement = document.querySelector('#prompt')
            const replRes: HTMLLabelElement = document.querySelector('#res')
            const command = replPrompt.value
            if (command == null) return
            const success = this.interpreter.eval(command)
            replRes.innerHTML = success ? '&nbsp;✔️' : '&nbsp;❌'
        })

        document.getElementById('circle').addEventListener('click', (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_CIRCLE))
        })

        document.getElementById('square').addEventListener('click', (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_SQUARE))
        })

        document.getElementById('triangle').addEventListener('click', (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_TRIANGLE))
        })

        document.getElementById('translate').addEventListener('submit', (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.TRANSLATE))
        })

        document.getElementById('rotate').addEventListener('submit', (e: Event) => {
            e.preventDefault()
            const angle = Number((<HTMLInputElement>document.getElementById('angle')).value)

            if (!isNaN(angle))
                this.click_controller.processEvent(
                    new UserEventAction(Action.ROTATE, { angle: angle })
                )
        })

        document.getElementById('grid').addEventListener('submit', (e: Event) => {
            e.preventDefault()
            const x_units = Number((<HTMLInputElement>document.getElementById('x_units')).value)
            const y_units = Number((<HTMLInputElement>document.getElementById('y_units')).value)

            const isPositiveInt = (str: Number) => {
                const n = Math.floor(Number(str));
                return n !== Infinity && n === str && n > 0;
            }

            if (isPositiveInt(x_units) && isPositiveInt(y_units)) {
                this.click_controller.processEvent(
                    new UserEventAction(Action.GRID, { x_units: x_units, y_units: y_units })
                )
            }
        })

        document.getElementById('scale').addEventListener('submit', (e: Event) => {
            e.preventDefault()
            const sx = Number((<HTMLInputElement>document.getElementById('sx')).value)
            const sy = Number((<HTMLInputElement>document.getElementById('sy')).value)

            if (!isNaN(sx) && !isNaN(sy))
                this.click_controller.processEvent(
                    new UserEventAction(Action.SCALE, { sx: sx, sy: sy })
                )
        })

        document.getElementById('undo').addEventListener('click', (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.UNDO))
        })

        document.getElementById('redo').addEventListener('click', (e: Event) => {
            e.preventDefault()
            this.click_controller.processEvent(new UserEventAction(Action.REDO))
        })

        document.getElementById('saveForm').addEventListener('submit', (e: Event) => {
            e.preventDefault()

            let type = (<HTMLInputElement>document.getElementById('saveDropdown')).value
            //para ja so temos XML ou TXT (escolher um)
            switch (type) {
                case 'xml':
                    this.document.save(new XMLConverterVisitor())
                    break

                case 'txt':
                    this.document.save(new TXTConverterVisitor())
                    break

                default:
                    break
            }
        })

        document.getElementById('file').addEventListener('change', (e: Event) => {
            //Taken from here https://stackoverflow.com/questions/23331546/how-to-use-javascript-to-read-local-text-file-and-read-line-by-line
            const file = (<HTMLInputElement>e.target).files[0]
            const reader = new FileReader()
            console.log(file)
            reader.onload = event => {
                const extention = file.name.split('.').pop()
                if (extention === 'txt') {
                    const fileResult = <string>reader.result

                    const allLines = fileResult.split('\r\n')
                    // Reading line by line and executing each action
                    allLines.forEach(line => {
                        this.interpreter.eval(line)
                    })
                } else if (extention === 'xml') {
                    const fileResult = <string>reader.result
                    var oParser = new DOMParser()
                    var oDOM = oParser.parseFromString(fileResult, 'application/xml')
                    let load = new loadXML(oDOM.documentElement, this.api)
                    load.load()
                    // print the name of the root element or error message
                    console.log(
                        oDOM.documentElement.nodeName == 'parsererror'
                            ? 'error while parsing'
                            : oDOM.documentElement.children
                    )
                }
            }

            reader.onerror = event => {
                alert((<HTMLInputElement>e.target).name)
            }

            reader.readAsText(file)
        })

        document.getElementById('addLayerButton').addEventListener('click', (e: Event) => {
            e.preventDefault()
            const elem = <HTMLInputElement>document.getElementById('addLayerInput')
            const layerName = elem.value
            elem.value = ''

            if (layerName != null && layerName.length < 2) return
            this.click_controller.processEvent(
                new UserEventAction(Action.ADD_LAYER, { layer: layerName })
            )
        })

        document.getElementById('layers').addEventListener('change', () => {
            let layer = (<HTMLSelectElement>document.getElementById('layers')).value
            layer = layer.replace(/\d\.\ /, '')
            this.click_controller.processEvent(
                new UserEventAction(Action.SET_LAYER, { layer: layer })
            )
        })

        document.body.addEventListener(
            'mousedown',
            (e: MouseEvent) => {
                let screenClick = new Point(e.pageX, e.pageY)
                let renderCoord = this.mapScreenspaceToRenderspace(screenClick)
                if (!renderCoord.isNil())
                    this.click_controller.processEvent(new UserEventPoint(renderCoord))
            },
            true
        )

        window.addEventListener('resize', () => {
            for (const renderer of this.renderers) renderer.resize()
        })
    }

    addRenderer(renderer: Renderer) {
        this.renderers.push(renderer)
        this.document.registerRendererObserver(renderer)
        renderer.drawGrid()
    }

    mapScreenspaceToRenderspace(point: Point): Point {
        let res = new NullPoint()
        for (const renderer of this.renderers) {
            res = renderer.mapToRenderer(point)
            if (!res.isNil()) break
        }
        return res
    }

    notify(layers: string[]): void {
        layers = layers.reverse()
        const select = <HTMLSelectElement>document.getElementById('layers')

        select.options.length = 0

        for (let i = 0; i < layers.length; i++) {
            const option = <HTMLOptionElement>document.createElement('option')
            option.text = i + 1 + '. ' + layers[i]
            select.add(option)
            if (i == 0) select.value = option.text
        }
    }
}

export enum Action {
    CREATE_SQUARE,
    CREATE_CIRCLE,
    CREATE_TRIANGLE,
    TRANSLATE,
    ROTATE,
    GRID,
    SCALE,
    UNDO,
    REDO,
    ADD_LAYER,
    SET_LAYER,
}

export abstract class UserEvent {}

export class UserEventAction extends UserEvent {
    args: any = {}

    constructor(public action: Action, args?: any) {
        super()
        this.args = args
    }
}

export class UserEventPoint extends UserEvent {
    constructor(public point: Point) {
        super()
    }
}
