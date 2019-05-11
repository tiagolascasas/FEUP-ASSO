import { SimpleDrawDocument } from './document'
import { Render } from 'render';

export class Page{

    renders= new Array<Render>()

    constructor(public document: SimpleDrawDocument){}

    addRender(render:Render){
        this.renders.push(render)
    }

    render(){        
        for (const render of this.renders) {
            this.document.draw(render)   
        }
    }

}