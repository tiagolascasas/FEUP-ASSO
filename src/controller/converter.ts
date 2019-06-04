
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
        rectElem.setAttribute("angle",rect.angle.toString());
        rectElem.setAttribute("color", rect.color);
        rectElem.setAttribute("height", rect.height.toString());
        rectElem.setAttribute("layer", rect.layer.toString());
        rectElem.setAttribute("width", rect.width.toString());
        rectElem.setAttribute("x", rect.x.toString());
        rectElem.setAttribute("y", rect.y.toString());
        return rectElem;
    }

    visitCircle(circle: Circle): Element{
        var circleElem: Element = this.doc.createElement("circ");
        circleElem.setAttribute("angle", circle.angle.toString());
        circleElem.setAttribute("color", circle.color);
        circleElem.setAttribute("layer", circle.layer.toString());
        circleElem.setAttribute("radius", circle.radius.toString());
        circleElem.setAttribute("x", circle.x.toString());
        circleElem.setAttribute("y", circle.y.toString());
        return circleElem;
    }

}