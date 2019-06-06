import { Rectangle, Circle, Shape } from 'model/shape'
import { Utils } from './utils'
export interface Visitor {
    //everything is any for now until better solution
    visitAll(objects: Array<Shape>): void
    visitRectangle(rect: Rectangle): any
    visitCircle(circle: Circle): any
}

export class XMLConverterVisitor implements Visitor {
    doc: XMLDocument = document.implementation.createDocument('', '', null)
    visitAll(objects: Shape[]) {
        let savedObjets = this.doc.createElement('objects')
        for (const object of objects) {
            savedObjets.appendChild(object.accept(this))
        }
        this.doc.appendChild(savedObjets)
         
        Utils.download('save.xml', new XMLSerializer().serializeToString(this.doc.documentElement))
    }

    visitRectangle(rect: Rectangle): Element {
        console.log('I am XML Converter for the Rectangle element')
        var rectElem: Element = this.doc.createElement('rect')
        rectElem.setAttribute('angle', rect.angle.toString())
        rectElem.setAttribute('color', rect.color)
        rectElem.setAttribute('height', rect.height.toString())
        rectElem.setAttribute('layer', rect.layer.toString())
        rectElem.setAttribute('width', rect.width.toString())
        rectElem.setAttribute('x', rect.x.toString())
        rectElem.setAttribute('y', rect.y.toString())
        return rectElem
    }

    visitCircle(circle: Circle): Element {
        console.log('I am XML Converter for the Circle element')
        var circleElem: Element = this.doc.createElement('circ')
        circleElem.setAttribute('angle', circle.angle.toString())
        circleElem.setAttribute('color', circle.color)
        circleElem.setAttribute('layer', circle.layer.toString())
        circleElem.setAttribute('radius', circle.radius.toString())
        circleElem.setAttribute('x', circle.x.toString())
        circleElem.setAttribute('y', circle.y.toString())
        return circleElem
    }
}

export class TXTConverterVisitor implements Visitor {
    visitAll(objects: Shape[]) {
        let saved = ''
        for (const object of objects) {
            saved = saved.concat(object.accept(this))
        }
        Utils.download("save.txt", saved)
    }

    visitRectangle(rect: Rectangle): String {
        let saved = 'Rectangle \r\n'
        saved = saved.concat('angle= ', rect.angle.toString(), '\r\n')
        saved = saved.concat('color= ', rect.color, '\r\n')
        saved = saved.concat('height= ', rect.height.toString(), '\r\n')
        saved = saved.concat('layer= ', rect.layer.toString(), '\r\n')
        saved = saved.concat('width= ', rect.width.toString(), '\r\n')
        saved = saved.concat('x= ', rect.x.toString(), '\r\n')
        saved = saved.concat('y= ', rect.y.toString(), '\r\n')
        return saved
    }

    visitCircle(circle: Circle): String {
        let saved = 'Circle \r\n'
        saved = saved.concat('angle= ', circle.angle.toString(), '\r\n')
        saved = saved.concat('color= ', circle.color, '\r\n')
        saved = saved.concat('layer= ', circle.layer.toString(), '\r\n')
        saved = saved.concat('radius= ', circle.radius.toString(), '\r\n')
        saved = saved.concat('x= ', circle.x.toString(), '\r\n')
        saved = saved.concat('y= ', circle.y.toString(), '\r\n')
        return saved
    }
}
