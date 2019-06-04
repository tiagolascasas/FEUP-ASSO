
import { Rectangle } from 'model/shape';

export interface Visitor {

    visitRectangle(rect: Rectangle) : {}
    
}

export class XMLConverter implements Visitor{

    visitRectangle(rect: Rectangle): {} {
        throw new Error("Method not implemented.");
    }

}