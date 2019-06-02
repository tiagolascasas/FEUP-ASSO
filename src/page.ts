import { SimpleDrawDocument } from './document'
import { Renderer } from 'renderer';

export class Page{

    renders= new Array<Renderer>()

    constructor(public document: SimpleDrawDocument){}

    addRender(render:Renderer){
        this.renders.push(render)
    }

    render(){        
        for (const render of this.renders) {
            this.document.draw(render)   
        }
    }

}