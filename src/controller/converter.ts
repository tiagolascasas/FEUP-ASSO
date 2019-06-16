import { Rectangle, Circle, Shape, Triangle } from 'model/shape'
import { Utils, Point } from './utils'
import { Action, CreateCircleAction, CreateRectangleAction, CreateTriangleAction, TranslateAction, RotateAction, ScaleAction } from 'model/actions';
import { UndoableAction } from 'model/undo';
export interface Visitor {
    //everything is any for now until better solution
    visitCreateRectangleAction(action: CreateRectangleAction): any
    visitCreateCircleAction(action: CreateCircleAction): any
    visitCreateTriangleAction(action: CreateTriangleAction): any
    visitTranslateAction(action: TranslateAction): any
    visitRotateAction(action: RotateAction): any
    visitScaleAction(action: ScaleAction): any
    visitAll(objects: Array<Shape>): void
    visitRectangle(rect: Rectangle): any
    visitCircle(circle: Circle): any
    visitAllDoActions(actions: UndoableAction<unknown>[]): void
    visitTriangle(triangle: Triangle): any
}

export class XMLConverterVisitor implements Visitor {
    visitCreateRectangleAction(action: CreateRectangleAction) {
        let point1x = action.center.x - action.width / 2
        let point1y = action.center.y - action.height / 2

        let point2x = action.center.x + action.width / 2
        let point2y = action.center.y + action.height / 2

        let rectElem: Element = this.doc.createElement('createRectangle')
        let point1: Element = this.doc.createElement('point')
        let point2: Element = this.doc.createElement('point')

        point1.setAttribute('x', point1x.toString())
        point1.setAttribute('y', point1y.toString())

        point2.setAttribute('x', point2x.toString())
        point2.setAttribute('y', point2y.toString())
        rectElem.setAttribute('color', action.color)
        rectElem.appendChild(point1)
        rectElem.appendChild(point2)
        return rectElem
    }

    visitCreateCircleAction(action: CreateCircleAction): Element {
        let circleElem: Element = this.doc.createElement('createCircle')

        let point1: Element = this.doc.createElement('point')

        point1.setAttribute('x', action.center.x.toString())
        point1.setAttribute('y', action.center.y.toString())

        circleElem.setAttribute('radius', action.radius.toString())
        circleElem.setAttribute('color', action.color)
        circleElem.appendChild(point1)
        return circleElem
    }

    visitCreateTriangleAction(action: CreateTriangleAction): Element {
        let triangleElem: Element = this.doc.createElement('createTriangle')

        let point0: Element = this.doc.createElement('point')

        point0.setAttribute('x', action.p0.x.toString())
        point0.setAttribute('y', action.p0.y.toString())

        let point1: Element = this.doc.createElement('point')

        point1.setAttribute('x', action.p1.x.toString())
        point1.setAttribute('y', action.p1.y.toString())

        let point2: Element = this.doc.createElement('point')

        point2.setAttribute('x', action.p2.x.toString())
        point2.setAttribute('y', action.p2.y.toString())


        triangleElem.setAttribute('color', action.color)
        triangleElem.appendChild(point0)
        triangleElem.appendChild(point1)
        triangleElem.appendChild(point2)
        return triangleElem
    }

    visitTranslateAction(action: TranslateAction): Element {
        let translateElem: Element = this.doc.createElement('translate')
        let clickedPoint: Element = this.doc.createElement('clickedPoint')

        clickedPoint.setAttribute('x', action.clickedPoint.x.toString())
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString())

        let newPoint: Element = this.doc.createElement('newPoint')

        newPoint.setAttribute('x', action.newPoint.x.toString())
        newPoint.setAttribute('y', action.newPoint.y.toString())
        
        translateElem.appendChild(clickedPoint)
        translateElem.appendChild(newPoint)
        return translateElem
    }

    visitRotateAction(action: RotateAction): Element {
        let rotateElem: Element = this.doc.createElement('rotate')
        let clickedPoint: Element = this.doc.createElement('clickedPoint')

        clickedPoint.setAttribute('x', action.clickedPoint.x.toString())
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString())

        rotateElem.setAttribute('angle', action.angled.toString())
        rotateElem.appendChild(clickedPoint)
        return rotateElem
    }

    visitScaleAction(action: ScaleAction): Element {
        let scaleElem: Element = this.doc.createElement('scale')
        let clickedPoint: Element = this.doc.createElement('clickedPoint')

        clickedPoint.setAttribute('x', action.clickedPoint.x.toString())
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString())

        scaleElem.setAttribute('sx', action.scaled.x.toString())
        scaleElem.setAttribute('sy', action.scaled.y.toString())
        scaleElem.appendChild(clickedPoint)
        return scaleElem
    }
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

    visitAllDoActions(actions: Action<any>[]){
        let savedObjets = this.doc.createElement('actions')
        for (const action of actions) {
            savedObjets.appendChild(action.accept(this))
        }
        this.doc.appendChild(savedObjets)

        Utils.download('save.xml', new XMLSerializer().serializeToString(this.doc.documentElement))
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
    visitCreateRectangleAction(action: CreateRectangleAction): String {
        let point1x = action.center.x - action.width / 2
        let point1y = action.center.y - action.height / 2

        let point2x = action.center.x + action.width / 2
        let point2y = action.center.y + action.height / 2
        return `add square ${point1x} ${point1y} ${point2x} ${point2y} ${action.color}\r\n`
    }
    visitCreateCircleAction(action: CreateCircleAction): String {
        return `add circle ${action.center.x} ${action.center.y} ${action.radius} ${action.color}\r\n`
    }
    visitCreateTriangleAction(action: CreateTriangleAction): String {
        return `add triangle ${action.p0.x} ${action.p0.y} ${action.p1.x} ${action.p1.y} ${action.p2.x} ${action.p2.y} ${action.color}\r\n`
    }
    visitTranslateAction(action: TranslateAction): String {
        return `translate ${action.clickedPoint.x} ${action.clickedPoint.y} ${action.newPoint.x} ${action.newPoint.y}\r\n`
    }
    visitRotateAction(action: RotateAction): String {
        return `rotate ${action.angled} ${action.clickedPoint.x} ${action.clickedPoint.y}\r\n`
    }
    visitScaleAction(action: ScaleAction): String {
        return `scale ${action.scaled.x} ${action.scaled.y} ${action.clickedPoint.x} ${action.clickedPoint.y}\r\n`
    }
    
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

    visitAllDoActions(actions: Action<any>[]): void {
        let saved = ''
        for (const action of actions) {
            saved = saved.concat(action.accept(this))
        }
        Utils.download('save.txt', saved)
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
