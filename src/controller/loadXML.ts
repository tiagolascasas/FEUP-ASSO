import { SimpleDrawAPI } from "./simpledraw_api";
import { Action } from "view/simpledraw_view";

export class loadXML {
  constructor(public xmlDocument: HTMLElement, public api: SimpleDrawAPI) {}

  load(){
    for (const action of <any>this.xmlDocument.childNodes) {
      switch (action.nodeName) {
          case 'createRectangle':
            // this.api.execute(Action.CREATE_SQUARE, {}, [p1, p2]))
              break
          case 'createCircle':
              break
          case 'createTriangle':
              break
          case 'rotate':
              break
          case 'scale':
              break

          default:
              break
      } 
      
    }
  }
}