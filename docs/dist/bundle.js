(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
REPL Grammar:

Start :=  <add> AddExpr
        | <move> MoveExpr
AddExpr := <square> SquareExpr
        |  <circle> CircleExpr
        |  <triangle> TriangleExpr
SquareExpr := <number> <number> <number> <number> <color>
CircleExpr := <number> <number> <color>
TriangleExpr := <number> <number> <number> <number> <number> <number> <color>
MoveExpr := <number> <number> <number> <number>

*/
class Context {
    constructor(sentence) {
        this.sentence = sentence;
        this.index = 0;
        this.tokens = sentence.split(' ');
    }
    hasNext() {
        return this.index < this.tokens.length;
    }
    next() {
        let current = this.tokens[this.index];
        this.index++;
        return current;
    }
    clone() {
        let newContext = new Context(this.sentence);
        newContext.index = this.index;
        return newContext;
    }
}
class TerminalExpression {
    interpret(context) {
        return false;
    }
}
class TerminalTokenExpression extends TerminalExpression {
    constructor(token) {
        super();
        this.token = token;
    }
    interpret(context) {
        if (context.hasNext())
            return context.next() == this.token;
        else
            return false;
    }
}
class TerminalColorExpression extends TerminalExpression {
    constructor() {
        super();
    }
    interpret(context) {
        if (context.hasNext()) {
            let token = context.next();
            const regex = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$');
            return regex.test(token);
        }
        else
            return false;
    }
}
class TerminalNumberExpression extends TerminalExpression {
    constructor() {
        super();
    }
    interpret(context) {
        if (context.hasNext()) {
            let token = context.next();
            const regex = new RegExp('^[0-9]+$');
            return regex.test(token);
        }
        else
            return false;
    }
}
class MoveExpression {
    interpret(context) {
        let termExp = new TerminalNumberExpression();
        return (termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context));
    }
}
class TriangleExpression {
    interpret(context) {
        let termNumberExp = new TerminalNumberExpression();
        let termColorExp = new TerminalColorExpression();
        return (termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context));
    }
}
class CircleExpression {
    interpret(context) {
        let termNumberExp = new TerminalNumberExpression();
        let termColorExp = new TerminalColorExpression();
        return (termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context));
    }
}
class SquareExpression {
    interpret(context) {
        let termNumberExp = new TerminalNumberExpression();
        let termColorExp = new TerminalColorExpression();
        if (!termNumberExp.interpret(context))
            return false;
        if (!termNumberExp.interpret(context))
            return false;
        if (!termNumberExp.interpret(context))
            return false;
        if (!termNumberExp.interpret(context))
            return false;
        if (!termColorExp.interpret(context))
            return false;
        return true;
    }
}
class AddExpression {
    interpret(context) {
        let termTokenExpSq = new TerminalTokenExpression('square');
        let expSq = new SquareExpression();
        let newContext = context.clone();
        if (termTokenExpSq.interpret(newContext) && expSq.interpret(newContext))
            return true;
        let termTokenExpCi = new TerminalTokenExpression('circle');
        let expCi = new CircleExpression();
        newContext = context.clone();
        if (termTokenExpCi.interpret(newContext) && expCi.interpret(newContext))
            return true;
        let termTokenExpTri = new TerminalTokenExpression('triangle');
        let expTri = new TriangleExpression();
        newContext = context.clone();
        if (termTokenExpTri.interpret(newContext) && expTri.interpret(newContext))
            return true;
        return false;
    }
}
class StartExpression {
    interpret(context) {
        let termTokenExpAdd = new TerminalTokenExpression('add');
        let expAdd = new AddExpression();
        let newContext = context.clone();
        if (termTokenExpAdd.interpret(newContext) && expAdd.interpret(newContext))
            return true;
        let termTokenExpMove = new TerminalTokenExpression('move');
        let expMove = new MoveExpression();
        newContext = context.clone();
        if (termTokenExpMove.interpret(newContext) && expMove.interpret(newContext))
            return true;
        return false;
    }
}
class Interpreter {
    constructor(sdd) {
        this.sdd = sdd;
    }
    eval(sentence) {
        let ctx = new Context(sentence);
        let startExpr = new StartExpression();
        return startExpr.interpret(ctx);
    }
}
exports.Interpreter = Interpreter;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
class CreateShapeAction {
    constructor(doc, shape, layer) {
        this.doc = doc;
        this.shape = shape;
        this.layer = layer;
    }
    do() {
        this.doc.add(this.shape);
        return this.shape;
    }
    undo() {
        this.doc.objects = this.doc.objects.filter(o => o !== this.shape);
    }
}
class CreateCircleAction extends CreateShapeAction {
    constructor(doc, x, y, radius) {
        super(doc, new shape_1.Circle(x, y, radius), doc.layersManager.activeLayer);
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
exports.CreateCircleAction = CreateCircleAction;
class CreateRectangleAction extends CreateShapeAction {
    constructor(doc, x, y, width, height, color) {
        super(doc, new shape_1.Rectangle(x, y, width, height, color), doc.layersManager.activeLayer);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
}
exports.CreateRectangleAction = CreateRectangleAction;
class TranslateAction {
    constructor(doc, shape, xd, yd) {
        this.doc = doc;
        this.shape = shape;
        this.xd = xd;
        this.yd = yd;
    }
    do() {
        this.oldX = this.shape.x;
        this.oldY = this.shape.y;
        this.shape.translate(this.xd, this.yd);
    }
    undo() {
        this.shape.x = this.oldX;
        this.shape.y = this.oldY;
    }
}
exports.TranslateAction = TranslateAction;
class RotateAction {
    constructor(doc, shape, angled) {
        this.doc = doc;
        this.shape = shape;
        this.angled = angled;
    }
    do() {
        this.oldAngle = this.shape.angle;
        this.shape.rotate(this.angled);
    }
    undo() {
        this.shape.angle = this.oldAngle;
    }
}
exports.RotateAction = RotateAction;

},{"./shape":9}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("./actions");
const undo_1 = require("./undo");
const layers_1 = require("./layers");
class SimpleDrawDocument {
    constructor() {
        this.objects = new Array();
        this.undoManager = new undo_1.UndoManager();
        this.layersManager = new layers_1.LayersManager();
    }
    undo() {
        this.undoManager.undo();
    }
    redo() {
        this.undoManager.redo();
    }
    draw(render) {
        // this.objects.forEach(o => o.draw(ctx))
        const objects = this.layersManager.mapObjectsToLayers(this.objects);
        const layers = this.layersManager.getOrderedLayers();
        render.draw(objects, layers);
    }
    add(r) {
        this.objects.push(r);
        r.layer = this.layersManager.activeLayer;
    }
    do(a) {
        this.undoManager.onActionDone(a);
        return a.do();
    }
    createRectangle(x, y, width, height, color) {
        return this.do(new actions_1.CreateRectangleAction(this, x, y, width, height, color));
    }
    createCircle(x, y, radius) {
        return this.do(new actions_1.CreateCircleAction(this, x, y, radius));
    }
    translate(s, xd, yd) {
        return this.do(new actions_1.TranslateAction(this, s, xd, yd));
    }
    rotate(s, angled) {
        return this.do(new actions_1.RotateAction(this, s, angled));
    }
}
exports.SimpleDrawDocument = SimpleDrawDocument;

},{"./actions":2,"./layers":4,"./undo":10}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LayersManager {
    constructor() {
        this.layers = new Array();
        this.createLayer('default');
        this.setActiveLayer('default');
    }
    createLayer(layerName) {
        if (this.layers.indexOf(layerName) == -1)
            this.layers.push(layerName);
        this.setActiveLayer(layerName);
    }
    setActiveLayer(layerName) {
        if (this.layers.indexOf(layerName) != -1) {
            this.activeLayer = layerName;
            this.layers.splice(this.layers.indexOf(layerName), 1);
            this.layers.unshift(layerName);
            return true;
        }
        else
            return false;
    }
    mapObjectsToLayers(objects) {
        const map = new Map();
        for (const layer of this.layers) {
            let objsInLayer = new Array();
            for (const obj of objects) {
                if (obj.layer == layer)
                    objsInLayer.push(obj);
            }
            map.set(layer, objsInLayer);
        }
        return map;
    }
    getOrderedLayers() {
        return this.layers.reverse();
    }
}
exports.LayersManager = LayersManager;

},{}],5:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("./document");
const page_1 = require("./page");
const REPL_1 = require("./REPL");
const renderer_1 = require("./renderer");
//create SimpleDraw
const sdd = new document_1.SimpleDrawDocument();
//create Canvas and SVG elements
const divCanvas1 = document.querySelector('#divCanvas1');
const divCanvas2 = document.querySelector('#divCanvas2');
const divSVG1 = document.querySelector('#divSVG1');
const divSVG2 = document.querySelector('#divSVG2');
const canvas1 = document.createElement('canvas');
canvas1.id = 'canvas1';
canvas1.width = divCanvas1.clientWidth;
canvas1.height = divCanvas1.clientHeight;
canvas1.style.zIndex = '8';
canvas1.style.position = 'absolute';
canvas1.style.border = '1px solid red';
divCanvas1.appendChild(canvas1);
const canvas2 = document.createElement('canvas');
canvas2.id = 'canvas2';
canvas2.width = divCanvas2.clientWidth;
canvas2.height = divCanvas2.clientHeight;
canvas2.style.zIndex = '8';
canvas2.style.position = 'absolute';
canvas2.style.border = '1px solid green';
divCanvas2.appendChild(canvas2);
const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg1.id = 'svg1';
svg1.setAttribute('width', divSVG1.clientWidth.toString());
svg1.setAttribute('height', divSVG1.clientHeight.toString());
svg1.style.zIndex = '8';
svg1.style.position = 'absolute';
svg1.style.border = '1px solid blue';
divSVG1.appendChild(svg1);
const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg2.id = 'svg2';
svg2.setAttribute('width', divSVG2.clientWidth.toString());
svg2.setAttribute('height', divSVG2.clientHeight.toString());
svg2.style.zIndex = '8';
svg2.style.position = 'absolute';
svg2.style.border = '1px solid yellow';
divSVG2.appendChild(svg2);
//create REPL
const replForm = document.querySelector('#repl');
const replPrint = document.querySelector('#res');
const replPrompt = document.querySelector('#prompt');
const interpreter = new REPL_1.Interpreter(sdd);
replForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let res = interpreter.eval(replPrompt.value);
    replPrint.innerHTML = res ? '&nbsp;&nbsp;✔️' : '&nbsp;&nbsp;❌';
});
//create page
const page = new page_1.Page(sdd);
setInterval(() => {
    page.render();
}, 16);
const r1 = new renderer_1.CanvasRender(page, 'divCanvas1');
const r2 = new renderer_1.CanvasRender(page, 'divCanvas2');
const r3 = new renderer_1.SVGRender(page, 'divSVG1');
const r4 = new renderer_1.SVGRender(page, 'divSVG2');
sdd.createRectangle(100, 100, 100, 100, "#ff0000");

},{"./REPL":1,"./document":3,"./page":7,"./renderer":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function selectedShape(shape, page) {
    console.log(shape);
    shape.color = "#FF0000";
    page.render();
}
exports.selectedShape = selectedShape;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Page {
    constructor(document) {
        this.document = document;
        this.renders = new Array();
    }
    addRender(render) {
        this.renders.push(render);
    }
    render() {
        for (const render of this.renders) {
            this.document.draw(render);
        }
    }
}
exports.Page = Page;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const operation_1 = require("./operation");
class SVGRender {
    constructor(page, elementID) {
        this.page = page;
        this.objs = new Array();
        this.svg = document.getElementById(elementID);
        page.addRender(this);
    }
    draw(objs, layers) {
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof shape_1.Rectangle) {
                    const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    g.setAttribute('transform', `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`);
                    e.setAttribute('style', `stroke: black; fill: ${shape.color}`);
                    e.setAttribute('width', shape.width.toString());
                    e.setAttribute('height', shape.height.toString());
                    e.setAttribute('x', (-shape.width / 2).toString());
                    e.setAttribute('y', (-shape.height / 2).toString());
                    e.onclick = (event) => {
                        operation_1.selectedShape(shape, this.page);
                    };
                    g.appendChild(e);
                    this.svg.appendChild(g);
                }
                else if (shape instanceof shape_1.Circle) {
                    const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    e.setAttribute('style', `stroke: black; fill: ${shape.color}`);
                    e.setAttribute('cx', shape.x.toString());
                    e.setAttribute('cy', shape.y.toString());
                    e.setAttribute('r', shape.radius.toString());
                    e.onclick = (event) => {
                        operation_1.selectedShape(shape, this.page);
                    };
                    this.svg.appendChild(e);
                }
            }
        }
    }
}
exports.SVGRender = SVGRender;
class CanvasRender {
    constructor(page, elementID) {
        this.page = page;
        this.canvas = document.getElementById(elementID);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.onclick = (ev) => {
            this.draw(this.objs, this.layers, ev);
        };
        page.addRender(this);
    }
    IsInPath(event) {
        var bb, x, y;
        bb = this.canvas.getBoundingClientRect();
        x = (event.clientX - bb.left) * (this.canvas.width / bb.width);
        y = (event.clientY - bb.top) * (this.canvas.height / bb.height);
        return this.ctx.isPointInPath(x, y);
    }
    draw(objs, layers, event) {
        this.objs = objs;
        this.layers = layers;
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof shape_1.Circle) {
                    this.ctx.beginPath();
                    this.ctx.ellipse(shape.x, shape.y, shape.radius, shape.radius, 0, 0, 2 * Math.PI);
                    if (event) {
                        if (this.IsInPath(event)) {
                            operation_1.selectedShape(shape, this.page);
                        }
                    }
                    this.ctx.closePath();
                    this.ctx.fillStyle = shape.color;
                    this.ctx.stroke();
                    this.ctx.fill();
                    //meter rotate num circulo?
                }
                else if (shape instanceof shape_1.Rectangle) {
                    //save the state to prevent all the objects from rotating
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.fillStyle = shape.color;
                    this.ctx.translate(shape.x, shape.y);
                    this.ctx.rotate((shape.angle * Math.PI) / 180);
                    this.ctx.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    this.ctx.fill();
                    //restore the state before drawing next shape
                    this.ctx.restore();
                    if (event) {
                        if (this.IsInPath(event)) {
                            operation_1.selectedShape(shape, this.page);
                        }
                    }
                }
            }
        }
    }
}
exports.CanvasRender = CanvasRender;

},{"./operation":6,"./shape":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color = "#FFFFFF";
    }
    translate(xd, yd) {
        this.x += xd;
        this.y += yd;
    }
    rotate(angled) {
        this.angle = (this.angle + angled) % 360;
    }
}
exports.Shape = Shape;
class Rectangle extends Shape {
    constructor(x, y, width, height, color) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
}
exports.Rectangle = Rectangle;
class Circle extends Shape {
    constructor(x, y, radius) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
exports.Circle = Circle;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UndoManager {
    constructor() {
        this.doStack = new Array();
        this.undoStack = new Array();
    }
    undo() {
        if (this.doStack.length > 0) {
            const a1 = this.doStack.pop();
            a1.undo();
            this.undoStack.push(a1);
        }
    }
    redo() {
        if (this.undoStack.length > 0) {
            const a1 = this.undoStack.pop();
            a1.do();
            this.doStack.push(a1);
        }
    }
    onActionDone(a) {
        this.doStack.push(a);
        this.undoStack.length = 0;
    }
}
exports.UndoManager = UndoManager;

},{}]},{},[5]);
