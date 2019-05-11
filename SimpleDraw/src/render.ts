import { Shape, Circle, Rectangle } from "./shape"


export interface Render {
    draw(event: MouseEvent, objs: Array<Shape>): void
}

export class SVGRender implements Render {
    svg: HTMLElement

    constructor() {
        this.svg = <HTMLElement>document.getElementById('svgcanvas')
    }
    manel():void{
        console.log("hello");
    }
    draw(event: MouseEvent, objs: Array<Shape>): void {
        for (const shape of objs) {
            if (shape instanceof Rectangle) {
                const e = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

                g.setAttribute('transform', `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`)
                e.setAttribute('style', 'stroke: black; fill: transparent')
                e.setAttribute('width', shape.width.toString())
                e.setAttribute('height', shape.height.toString())
                e.setAttribute('x', (-shape.width/2).toString())
                e.setAttribute('y', (-shape.height / 2).toString())
                e.setAttribute('onclick',`window.parent.manel()`)
                g.appendChild(e)
                this.svg.appendChild(g)
            }else if(shape instanceof Circle){
                const e = document.createElementNS("http://www.w3.org/2000/svg", "circle")
                e.setAttribute('style', 'stroke: black; fill: transparent')

                e.setAttribute("cx", shape.x.toString());
                e.setAttribute("cy", shape.y.toString());
                e.setAttribute("r", shape.radius.toString());
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
        // canvas.addEventListener("click",function(event) {
        //     console.log(event);
        //     this.draw(objs)
        //     console.log("manel");
        // }
        // )
        this.canvas.onclick = (ev: MouseEvent)=>{
            console.log(this);
            console.log(event);
            this.draw(ev, this.objs)
            
        }
        
    }

    onclickFun(event: MouseEvent){
        console.log("sou o evento" + event);
        
        this.draw(event,this.objs)

    }

    IsInPath(event: MouseEvent) {
        var bb, x, y
        bb = this.canvas.getBoundingClientRect()
        x = (event.clientX - bb.left) * (this.canvas.width / bb.width)
        y = (event.clientY - bb.top) * (this.canvas.height / bb.height)
        return this.ctx.isPointInPath(x, y)
    }

    
    draw(event: MouseEvent, objs: Array<Shape>): void {
        this.objs = objs        
        for (const shape of objs) {
            if (shape instanceof Circle) {
                this.ctx.beginPath()
                this.ctx.ellipse(shape.x, shape.y, shape.radius, shape.radius, 0, 0, 2 * Math.PI)
                if (event) {
                    console.log(this.IsInPath(event))
                }
                this.ctx.closePath()
                this.ctx.stroke()
                //meter rotate num circulo? 
            } else if (shape instanceof Rectangle) {
                //save the state to prevent all the objects from rotating
                this.ctx.save()
                this.ctx.beginPath()
                
                this.ctx.translate(shape.x, shape.y)
                this.ctx.rotate(shape.angle * Math.PI / 180)
                this.ctx.rect(-shape.width/2, -shape.height/2, shape.width, shape.height)

                if (event) {
                    console.log(this.IsInPath(event))
                }

                this.ctx.closePath()
                this.ctx.stroke()
                //restore the state before drawing next shape
                this.ctx.restore()
                
            }
        }
        
    }

}