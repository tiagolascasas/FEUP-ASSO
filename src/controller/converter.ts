
import { Rectangle, Circle, Shape } from 'model/shape';

export interface Visitor {

    //everything is any for now until better solution
    visitAll(objects: Array<Shape>): any
    visitRectangle(rect: Rectangle): any
    visitCircle(circle: Circle): any
}

export class XMLConverterVisitor implements Visitor{

    visitAll(objects: Shape[]) {
        let doc: XMLDocument = document.implementation.createDocument("", "", null);
        let savedObjets = doc.createElement("objects");
        for (const object of objects) {
            savedObjets.appendChild(object.accept(this));
        }
        doc.appendChild(savedObjets);
        console.log(doc);
    }

    constructor(private doc: XMLDocument){

    }
    visitRectangle(rect: Rectangle): Element {
        console.log("I am XML Converter for the Rectangle element");
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
        console.log("I am XML Converter for the Circle element");
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

export class TXTConverterVisitor implements Visitor{

    visitAll(objects: Shape[]) {
        let saved = ""
        for (const object of objects) {
           saved = saved.concat(object.accept(this));
        }
        console.log(saved);
        
    }

    visitRectangle(rect: Rectangle): String {
        let saved = "Rectangle \n";
        saved = saved.concat("angle= ", rect.angle.toString(),"\n")
        saved = saved.concat("color= ", rect.color, "\n")
        saved = saved.concat("height= ", rect.height.toString(), "\n")
        saved = saved.concat("layer= ", rect.layer.toString(), "\n")
        saved = saved.concat("width= ", rect.width.toString(), "\n")
        saved = saved.concat("x= ", rect.x.toString(), "\n")
        saved = saved.concat("y= ", rect.y.toString(), "\n")
        console.log(saved);
        return saved
    }    
    
    visitCircle(circle: Circle): String {
        let saved = "Circle \n";
        saved = saved.concat("angle= ", circle.angle.toString(), "\n")
        saved = saved.concat("color= ", circle.color, "\n")
        saved = saved.concat("layer= ", circle.layer.toString(), "\n")
        saved = saved.concat("radius= ", circle.radius.toString(), "\n")
        saved = saved.concat("x= ", circle.x.toString(), "\n")
        saved = saved.concat("y= ", circle.y.toString(), "\n")
        console.log(saved);
        return saved
    }


}