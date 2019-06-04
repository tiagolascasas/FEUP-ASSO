
import { Rectangle, Circle } from 'model/shape';

export interface Visitor {

    visitRectangle(rect: Rectangle) : string
    visitCircle(circle: Circle): string
}

export class XMLConverterVisitor implements Visitor{

    visitRectangle(rect: Rectangle): string {
        return "rectangle";
    }

    visitCircle(circle: Circle) : string{
        return "circle"
    }

}