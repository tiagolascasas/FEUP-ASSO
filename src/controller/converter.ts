import { Rectangle, Circle, Shape, Triangle } from 'model/shape'
import { Utils } from './utils'
export interface Visitor {
    //everything is any for now until better solution
    visitAll(objects: Array<Shape>): void
    visitRectangle(rect: Rectangle): any
    visitCircle(circle: Circle): any
    visitTriangle(triangle: Triangle): any
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
        rectElem.setAttribute('x', rect.center.x.toString())
        rectElem.setAttribute('y', rect.center.y.toString())
        return rectElem
    }

    visitCircle(circle: Circle): Element {
        console.log('I am XML Converter for the Circle element')
        var circleElem: Element = this.doc.createElement('circ')
        circleElem.setAttribute('angle', circle.angle.toString())
        circleElem.setAttribute('color', circle.color)
        circleElem.setAttribute('layer', circle.layer.toString())
        circleElem.setAttribute('radius', circle.radius.toString())
        circleElem.setAttribute('x', circle.center.x.toString())
        circleElem.setAttribute('y', circle.center.y.toString())
        return circleElem
    }

    visitTriangle(triangle: Triangle): Element {
        console.log('I am XML Converter for the Triangle element')
        var triangleElem: Element = this.doc.createElement('triangle')
        triangleElem.setAttribute('angle', triangle.angle.toString())
        triangleElem.setAttribute('color', triangle.color)
        triangleElem.setAttribute('layer', triangle.layer.toString())
        triangleElem.setAttribute('point0-x', triangle.p0.x.toString())
        triangleElem.setAttribute('point0-y', triangle.p0.y.toString())
        triangleElem.setAttribute('point1-x', triangle.p1.x.toString())
        triangleElem.setAttribute('point1-y', triangle.p1.y.toString())
        triangleElem.setAttribute('point2-x', triangle.p2.x.toString())
        triangleElem.setAttribute('point2-y', triangle.p2.y.toString())
        return triangleElem
    }
}

export class TXTConverterVisitor implements Visitor {
   
    visitAll(objects: Shape[]) {
        let saved = ''
        for (const object of objects) {
            saved = saved.concat(object.accept(this))
        }
        Utils.download('save.txt', saved)
    }

    visitRectangle(rect: Rectangle): String {
        let saved = 'Rectangle \r\n'
        saved = saved.concat('angle= ', rect.angle.toString(), '\r\n')
        saved = saved.concat('color= ', rect.color, '\r\n')
        saved = saved.concat('height= ', rect.height.toString(), '\r\n')
        saved = saved.concat('layer= ', rect.layer.toString(), '\r\n')
        saved = saved.concat('width= ', rect.width.toString(), '\r\n')
        saved = saved.concat('x= ', rect.center.x.toString(), '\r\n')
        saved = saved.concat('y= ', rect.center.y.toString(), '\r\n')
        return saved
    }

    visitCircle(circle: Circle): String {
        let saved = 'Circle \r\n'
        saved = saved.concat('angle= ', circle.angle.toString(), '\r\n')
        saved = saved.concat('color= ', circle.color, '\r\n')
        saved = saved.concat('layer= ', circle.layer.toString(), '\r\n')
        saved = saved.concat('radius= ', circle.radius.toString(), '\r\n')
        saved = saved.concat('x= ', circle.center.x.toString(), '\r\n')
        saved = saved.concat('y= ', circle.center.y.toString(), '\r\n')
        return saved
    }

    visitTriangle(triangle: Triangle) {
        let saved = 'Triangle \r\n'
        saved = saved.concat('angle= ', triangle.angle.toString(), '\r\n')
        saved = saved.concat('color= ', triangle.color, '\r\n')
        saved = saved.concat('layer= ', triangle.layer.toString(), '\r\n')
        saved = saved.concat('point0-x= ', triangle.p0.x.toString(), '\r\n')
        saved = saved.concat('point0-y= ', triangle.p0.y.toString(), '\r\n')
        saved = saved.concat('point1-x= ', triangle.p1.x.toString(), '\r\n')
        saved = saved.concat('point1-y= ', triangle.p1.y.toString(), '\r\n')
        saved = saved.concat('point2-x= ', triangle.p2.x.toString(), '\r\n')
        saved = saved.concat('point2-y= ', triangle.p2.y.toString(), '\r\n')
        return saved
    }
}
