(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
REPL Grammar:

S :=  <add> AddExpr
    | <move> MoveExpr
AddExpr := <square> SquareExpr
        |  <circle> CircleExpr
        |  <triangle> TriangleExpr
SquareExpr := <number> <number> <number> <number> <color>
CircleExpr := <number> <number> <color>
TriangleExpr := <number> <number> <number> <number> <number> <number> <color>
MoveExpr := <number> <number> <number> <number>

*/
class REPL {
    constructor(sdd, res) {
        this.sdd = sdd;
        this.res = res;
        this.index = 0;
    }
    eval(text) {
        this.index = 0;
        const tokens = text.split(' ');
        if (tokens[this.index] === 'add') {
            this.index++;
            return this.addExpr(tokens);
        }
        if (tokens[this.index] === 'move') {
            this.index++;
            return this.moveExpr(tokens);
        }
        this.print('Unable to parse action', false);
        return false;
    }
    print(text, success) {
        if (this.res != null) {
            this.res.classList.add(success ? 'text-success' : 'text-danger');
            this.res.innerHTML = text;
        }
    }
    isNumber(token) {
        return !isNaN(Number(token)) || parseInt(token) > 0;
    }
    isColor(token) {
        const regex = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$');
        return regex.test(token);
    }
    addExpr(tokens) {
        if (tokens[this.index] === 'square') {
            this.index++;
            return this.squareExpr(tokens);
        }
        if (tokens[this.index] === 'circle') {
            this.index++;
            return this.circleExpr(tokens);
        }
        if (tokens[this.index] === 'triangle') {
            this.index++;
            return this.triangleExpr(tokens);
        }
        return false;
    }
    moveExpr(tokens) {
        for (let i = 0; i < 4; i++) {
            if (!this.isNumber(tokens[this.index]))
                return false;
            else
                this.index++;
        }
        this.print('Move executed', true);
        return true;
    }
    squareExpr(tokens) {
        for (let i = 0; i < 4; i++) {
            if (!this.isNumber(tokens[this.index]))
                return false;
            else
                this.index++;
        }
        if (!this.isColor(tokens[this.index]))
            return false;
        this.sdd.createRectangle(Number(tokens[2]), Number(tokens[3]), Number(tokens[4]), Number(tokens[5]), tokens[6]);
        this.print('Square added', true);
        return true;
    }
    circleExpr(tokens) {
        for (let i = 0; i < 2; i++) {
            if (!this.isNumber(tokens[this.index]))
                return false;
            else
                this.index++;
        }
        if (!this.isColor(tokens[this.index]))
            return false;
        this.print('Circle added', true);
        return true;
    }
    triangleExpr(tokens) {
        for (let i = 0; i < 6; i++) {
            if (!this.isNumber(tokens[this.index]))
                return false;
            else
                this.index++;
        }
        if (!this.isColor(tokens[this.index]))
            return false;
        //this.sdd.createTriangle
        this.print('Triangle added', true);
        return true;
    }
}
exports.REPL = REPL;

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

},{"./shape":7}],3:[function(require,module,exports){
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

},{"./actions":2,"./layers":4,"./undo":8}],4:[function(require,module,exports){
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
const REPL_1 = require("./REPL");
const document_1 = require("./document");
const page_1 = require("./page");
//create SimpleDraw
const ssd = new document_1.SimpleDrawDocument();
//create REPL
const replForm = document.querySelector('#repl');
const replPrint = document.querySelector('#res');
const replPrompt = document.querySelector('#prompt');
const repl = new REPL_1.REPL(ssd, replPrint);
replForm.addEventListener('submit', (e) => {
    e.preventDefault();
    repl.eval(replPrompt.value);
});
//create page
const page = new page_1.Page(ssd);
setInterval(() => {
    page.render();
}, 16);

},{"./REPL":1,"./document":3,"./page":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
