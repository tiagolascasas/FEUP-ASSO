import { SimpleDrawAPI } from "./simpledraw_api";
import { Action } from "../view/simpledraw_view";
import { Point } from "./utils";

export class loadXML {
  constructor(public xmlDocument: HTMLElement, public api: SimpleDrawAPI) {}

  load(){
    for (const node of <any>this.xmlDocument.childNodes) {
      switch (node.nodeName) {
          case 'createRectangle':
            this.createRectangle(node)
            break

          case 'createCircle':
            this.createCircle(node)
            break

          case 'createTriangle':
            this.createTriangle(node)
            break

          case 'translate':
            this.translate(node)
            break

          case 'rotate':
            this.rotate(node)
            break
            
          case 'scale':
            this.scale(node)
            break

          default:
            console.error(`Couldn't find action: ${node.nodeName}`)
            break
      } 
      
    }
  }

  createRectangle(node: HTMLElement){
    let point0Element = node.children[0];
    let point1Element = node.children[1];

    let point0 = new Point(+(<any>point0Element.attributes).x.nodeValue,+(<any>point0Element.attributes).y.nodeValue)
    let point1 = new Point(+(<any>point1Element.attributes).x.nodeValue,+(<any>point1Element.attributes).y.nodeValue)
    
    this.api.execute(Action.CREATE_SQUARE, {}, [point0, point1])
  }

  createCircle(node: HTMLElement){
    let centerElement = node.children[0]
    let radius = +(<any>node.attributes).radius.nodeValue
    let center = new Point(+(<any>centerElement.attributes).x.nodeValue,+(<any>centerElement.attributes).y.nodeValue)
    this.api.execute(Action.CREATE_CIRCLE, { radius: radius }, [center])
  }

  createTriangle(node: HTMLElement){
    let point0Element = node.children[0];
    let point1Element = node.children[1];
    let point2Element = node.children[2];

    let point0 = new Point(+(<any>point0Element.attributes).x.nodeValue,+(<any>point0Element.attributes).y.nodeValue)
    let point1 = new Point(+(<any>point1Element.attributes).x.nodeValue,+(<any>point1Element.attributes).y.nodeValue)
    let point2 = new Point(+(<any>point2Element.attributes).x.nodeValue,+(<any>point2Element.attributes).y.nodeValue)

    this.api.execute(Action.CREATE_TRIANGLE, {}, [point0, point1, point2])
  }

  translate(node: HTMLElement){
    let clickedElement = node.children[0]
    let newPointElement = node.children[1]

    let clicked = new Point(+(<any>clickedElement.attributes).x.nodeValue,+(<any>clickedElement.attributes).y.nodeValue)
    let newPoint = new Point(+(<any>newPointElement.attributes).x.nodeValue,+(<any>newPointElement.attributes).y.nodeValue)
    console.log('translate')
    console.log(clicked, newPoint)
    this.api.execute(Action.TRANSLATE, {}, [clicked, newPoint])
  }

  rotate(node: HTMLElement){
    let angle = +(<any>node.attributes).angle.nodeValue

    let clickedElement = node.children[0]
    let clicked = new Point(+(<any>clickedElement.attributes).x.nodeValue,+(<any>clickedElement.attributes).y.nodeValue) 
    console.log('rotate');
    console.log(clicked, angle)
    this.api.execute(Action.ROTATE, { angle: angle }, [clicked])
  }

  scale(node: HTMLElement){
    let sx = +(<any>node.attributes).sx.nodeValue
    let sy = +(<any>node.attributes).sy.nodeValue

    let clickedElement = node.children[0]
    let clicked = new Point(+(<any>clickedElement.attributes).x.nodeValue,+(<any>clickedElement.attributes).y.nodeValue) 
    console.log("scale");
    console.log(clicked, sx,sy)
    this.api.execute(Action.SCALE, { sx: sx, sy: sy }, [clicked])
  }
}