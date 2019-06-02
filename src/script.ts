import { SimpleDrawDocument } from './document'
import { CanvasRender, SVGRender } from './renderer'
import { UndoManager } from './undo'
import { Page } from './page'

let testRender = () => {
    const sdd = new SimpleDrawDocument()

    const c1 = sdd.createCircle(50, 50, 30)
    const r2 = sdd.createRectangle(40, 40, 60, 60, "#FF0000")
    const r1 = sdd.createRectangle(100, 100, 10, 10, "#00FF00")
    const c2 = sdd.createCircle(130, 130, 30)
    //const r2 = sdd.createRectangle(30, 30, 40, 40)
    //sdd.rotate(r1,45);
    //sdd.undo();

    /* const s1 = sdd.createSelection(c1, r1, r2)
    sdd.translate(s1, 10, 10) */
    const page = new Page(sdd)
    const canvasrender = new CanvasRender(page, "divCanvas1")
    //const svgrender = new SVGRender(page)
    page.render()
    // sdd.draw(canvasrender)
    // sdd.draw(svgrender)
}

let testLayers = () => {
    const sdd = new SimpleDrawDocument()
    const r1 = sdd.createRectangle(40, 40, 60, 60, "#FF0000") //should be drawn "above"
    sdd.layersManager.createLayer('new layer')
    const r2 = sdd.createRectangle(40, 40, 80, 80, "#0000FF") //should be drawn "below"
    sdd.layersManager.setActiveLayer('default')

    const page = new Page(sdd)
    const canvasrender = new CanvasRender(page, "divSVG1")
    const svgrender = new SVGRender(page, "divSVG1")
    page.render()
}

//testRender()
//testLayers()
