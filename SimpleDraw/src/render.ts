import { Shape, Circle, Rectangle } from "./shape"
import {selectedShape} from "./operation"


export interface Render {
    draw(objs: Array<Shape>, event?: MouseEvent): void
}

export class SVGRender implements Render {
    svg: HTMLElement
    objs = new Array<Shape>()

    constructor() {
        this.svg = <HTMLElement>document.getElementById('svgcanvas')
    }
  
    draw(objs: Array<Shape>): void {
        this.objs = objs
        for (const shape of objs) {
            if (shape instanceof Rectangle) {
                const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

                g.setAttribute('transform', `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`)
                e.setAttribute('style', `stroke: black; fill: ${shape.color}`)
                e.setAttribute('width', shape.width.toString())
                e.setAttribute('height', shape.height.toString())
                e.setAttribute('x', (-shape.width/2).toString())
                e.setAttribute('y', (-shape.height / 2).toString())
                // e.setAttribute('onclick',`window.parent.manel()`)
                e.onclick = (event: MouseEvent)=>{
                    selectedShape(shape)
                    this.draw(this.objs)
                    
                }

                g.appendChild(e)
                this.svg.appendChild(g)
            }else if(shape instanceof Circle){
                const e = document.createElementNS("http://www.w3.org/2000/svg", "circle")
                e.setAttribute('style', `stroke: black; fill: ${shape.color}`)

                e.setAttribute("cx", shape.x.toString());
                e.setAttribute("cy", shape.y.toString());
                e.setAttribute("r", shape.radius.toString());
                e.onclick = (event: MouseEvent) => {
                    selectedShape(shape)
                    this.draw(this.objs)

                }
                this.svg.appendChild(e);
            }
        }
    }
}

export class CanvasRender implements Render {
    objs = new Array<Shape>()
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.canvas.onclick = (ev: MouseEvent)=>{
            this.draw(this.objs,ev) 
        }        
    }

    IsInPath(event: MouseEvent) {
        var bb, x, y
        bb = this.canvas.getBoundingClientRect()
        x = (event.clientX - bb.left) * (this.canvas.width / bb.width)
        y = (event.clientY - bb.top) * (this.canvas.height / bb.height)
        return this.ctx.isPointInPath(x, y)
    }

    draw(objs: Array<Shape>, event?: MouseEvent): void {
        this.objs = objs
        for (const shape of objs) {
            if (shape instanceof Circle) {
                this.ctx.beginPath()
                this.ctx.ellipse(shape.x, shape.y, shape.radius, shape.radius, 0, 0, 2 * Math.PI)
                if (event) {
                    if (this.IsInPath(event)) {
                        selectedShape(shape)
                    }
                }
                this.ctx.closePath()
                this.ctx.fillStyle = shape.color;
                this.ctx.stroke()
                this.ctx.fill()
                //meter rotate num circulo? 
            } else if (shape instanceof Rectangle) {
                //save the state to prevent all the objects from rotating
                this.ctx.save()
                this.ctx.beginPath()
                
                this.ctx.translate(shape.x, shape.y)
                this.ctx.rotate(shape.angle * Math.PI / 180)
                this.ctx.rect(-shape.width/2, -shape.height/2, shape.width, shape.height)

                if (event) {
                    if(this.IsInPath(event)){
                        selectedShape(shape)
                    }
                }

                this.ctx.closePath()
                this.ctx.fillStyle = shape.color;
                this.ctx.stroke()
                this.ctx.fill()
                //restore the state before drawing next shape
                this.ctx.restore()
                
            }
        }
        
    }

}