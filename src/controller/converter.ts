
import { Rectangle, Circle } from 'model/shape';

export interface Visitor {

    visitRectangle(rect: Rectangle): Element
    visitCircle(circle: Circle): Element
}

export class XMLConverterVisitor implements Visitor{

    constructor(private doc: XMLDocument){

    }
    visitRectangle(rect: Rectangle): Element {
        var rectElem: Element = this.doc.createElement("rect");
        return rectElem;
    }

    visitCircle(circle: Circle): Element{
        var circleElem: Element = this.doc.createElement("circ");
        return circleElem;
    }

}