(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
class ClickController {
    constructor(api) {
        this.api = api;
        this.currState = new IdleState();
    }
    processEvent(event) {
        this.currState.processEvent(this, event);
    }
}
exports.ClickController = ClickController;
class IdleState {
    processEvent(context, event) {
        if (event instanceof simpledraw_view_1.UserEventAction) {
            if ([simpledraw_view_1.Action.UNDO, simpledraw_view_1.Action.REDO].includes(event.action)) {
            }
            else
                context.currState = new ActionPressedState(event);
        }
    }
}
exports.IdleState = IdleState;
class ActionPressedState {
    constructor(event) {
        this.event = event;
    }
    processEvent(context, event) {
        if (event instanceof simpledraw_view_1.UserEventPoint) {
            if ([simpledraw_view_1.Action.ROTATE, simpledraw_view_1.Action.SCALE, simpledraw_view_1.Action.GRID].includes(this.event.action)) {
                context.api.execute(this.event.action, this.event.args, [event.point]);
                context.currState = new IdleState();
            }
            else
                context.currState = new FirstPointClickedState(this.event, event.point);
        }
        else
            context.currState = new IdleState();
    }
}
exports.ActionPressedState = ActionPressedState;
class FirstPointClickedState {
    constructor(event, point1) {
        this.event = event;
        this.point1 = point1;
    }
    processEvent(context, event) {
        if (event instanceof simpledraw_view_1.UserEventPoint) {
            if ([simpledraw_view_1.Action.CREATE_SQUARE, simpledraw_view_1.Action.CREATE_CIRCLE, simpledraw_view_1.Action.TRANSLATE].includes(this.event.action)) {
                context.api.execute(this.event.action, this.event.args, [this.point1, event.point]);
                context.currState = new IdleState();
            } //else second point clicked state
            else
                context.currState = new IdleState();
        }
    }
}
exports.FirstPointClickedState = FirstPointClickedState;

},{"../view/simpledraw_view":15}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class XMLConverterVisitor {
    constructor() {
        this.doc = document.implementation.createDocument('', '', null);
    }
    visitAll(objects) {
        let savedObjets = this.doc.createElement('objects');
        for (const object of objects) {
            savedObjets.appendChild(object.accept(this));
        }
        this.doc.appendChild(savedObjets);
        utils_1.Utils.download('save.xml', new XMLSerializer().serializeToString(this.doc.documentElement));
    }
    visitRectangle(rect) {
        console.log('I am XML Converter for the Rectangle element');
        var rectElem = this.doc.createElement('rect');
        rectElem.setAttribute('angle', rect.angle.toString());
        rectElem.setAttribute('color', rect.color);
        rectElem.setAttribute('height', rect.height.toString());
        rectElem.setAttribute('layer', rect.layer.toString());
        rectElem.setAttribute('width', rect.width.toString());
        rectElem.setAttribute('x', rect.x.toString());
        rectElem.setAttribute('y', rect.y.toString());
        return rectElem;
    }
    visitCircle(circle) {
        console.log('I am XML Converter for the Circle element');
        var circleElem = this.doc.createElement('circ');
        circleElem.setAttribute('angle', circle.angle.toString());
        circleElem.setAttribute('color', circle.color);
        circleElem.setAttribute('layer', circle.layer.toString());
        circleElem.setAttribute('radius', circle.radius.toString());
        circleElem.setAttribute('x', circle.x.toString());
        circleElem.setAttribute('y', circle.y.toString());
        return circleElem;
    }
}
exports.XMLConverterVisitor = XMLConverterVisitor;
class TXTConverterVisitor {
    visitAll(objects) {
        let saved = '';
        for (const object of objects) {
            saved = saved.concat(object.accept(this));
        }
        utils_1.Utils.download("save.txt", saved);
    }
    visitRectangle(rect) {
        let saved = 'Rectangle \r\n';
        saved = saved.concat('angle= ', rect.angle.toString(), '\r\n');
        saved = saved.concat('color= ', rect.color, '\r\n');
        saved = saved.concat('height= ', rect.height.toString(), '\r\n');
        saved = saved.concat('layer= ', rect.layer.toString(), '\r\n');
        saved = saved.concat('width= ', rect.width.toString(), '\r\n');
        saved = saved.concat('x= ', rect.x.toString(), '\r\n');
        saved = saved.concat('y= ', rect.y.toString(), '\r\n');
        return saved;
    }
    visitCircle(circle) {
        let saved = 'Circle \r\n';
        saved = saved.concat('angle= ', circle.angle.toString(), '\r\n');
        saved = saved.concat('color= ', circle.color, '\r\n');
        saved = saved.concat('layer= ', circle.layer.toString(), '\r\n');
        saved = saved.concat('radius= ', circle.radius.toString(), '\r\n');
        saved = saved.concat('x= ', circle.x.toString(), '\r\n');
        saved = saved.concat('y= ', circle.y.toString(), '\r\n');
        return saved;
    }
}
exports.TXTConverterVisitor = TXTConverterVisitor;

},{"./utils":5}],3:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
/*
REPL Grammar:

Start :=  <add> AddExpr
        | <translate> TranslateExpr
        | <rotate> RotateExpr
        | <scale> ScaleExpr
        | <grid> GridExpr
        | <undo>
        | <redo>
AddExpr := <square> SquareExpr
        |  <circle> CircleExpr
        |  <triangle> TriangleExpr
SquareExpr := <number> <number> <number> <number> <color>
CircleExpr := <number> <number> <number> <color>
TriangleExpr := <number> <number> <number> <number> <number> <number> <color>
TranslateExpr := <number> <number> <number> <number>
RotateExpr := <number> <number> <number>
ScaleExpr := <number> <number> <number> <number>
GridExpr := <number> <number> <number> <number>
*/
class Context {
    constructor(sentence, api) {
        this.sentence = sentence;
        this.api = api;
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
        let newContext = new Context(this.sentence, this.api);
        newContext.index = this.index;
        return newContext;
    }
    get(i) {
        return this.tokens[i];
    }
}
class TerminalExpression {
    interpret(context) {
        return false;
    }
}
class EmptyExpression extends TerminalExpression {
    interpret(context) {
        return context.hasNext() == false;
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
class GridExpression {
    interpret(context) {
        let termExp = new TerminalNumberExpression();
        if (termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(3)), Number(context.get(4)));
            let horizontal_units = context.get(1);
            let vertical_units = context.get(2);
            context.api.execute(simpledraw_view_1.Action.GRID, { horizontal_units: horizontal_units, vertical_units: vertical_units }, [p1]);
            return true;
        }
        else
            return false;
    }
}
class ScaleExpression {
    interpret(context) {
        let termExp = new TerminalNumberExpression();
        if (termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(3)), Number(context.get(4)));
            let sx = context.get(1);
            let sy = context.get(2);
            context.api.execute(simpledraw_view_1.Action.SCALE, { sx: sx, sy: sy }, [p1]);
            return true;
        }
        else
            return false;
    }
}
class RotateExpression {
    interpret(context) {
        let termExp = new TerminalNumberExpression();
        if (termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(2)), Number(context.get(3)));
            let angle = context.get(1);
            context.api.execute(simpledraw_view_1.Action.ROTATE, { angle: angle }, [p1]);
            return true;
        }
        else
            return false;
    }
}
class TranslateExpression {
    interpret(context) {
        let termExp = new TerminalNumberExpression();
        if (termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(1)), Number(context.get(2)));
            let p2 = new simpledraw_view_1.Point(Number(context.get(4)), Number(context.get(3)));
            context.api.execute(simpledraw_view_1.Action.TRANSLATE, {}, [p1, p2]);
            return true;
        }
        else
            return false;
    }
}
class TriangleExpression {
    interpret(context) {
        let termNumberExp = new TerminalNumberExpression();
        let termColorExp = new TerminalColorExpression();
        if (termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(2)), Number(context.get(3)));
            let p2 = new simpledraw_view_1.Point(Number(context.get(4)), Number(context.get(5)));
            let p3 = new simpledraw_view_1.Point(Number(context.get(6)), Number(context.get(7)));
            context.api.execute(simpledraw_view_1.Action.CREATE_TRIANGLE, {}, [p1, p2, p3]);
            return true;
        }
        else
            return false;
    }
}
class CircleExpression {
    interpret(context) {
        let termNumberExp = new TerminalNumberExpression();
        let termColorExp = new TerminalColorExpression();
        if (termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(2)), Number(context.get(3)));
            let radius = context.get(4);
            context.api.execute(simpledraw_view_1.Action.CREATE_CIRCLE, { radius: radius }, [p1]);
            return true;
        }
        else
            return false;
    }
}
class SquareExpression {
    interpret(context) {
        let termNumberExp = new TerminalNumberExpression();
        let termColorExp = new TerminalColorExpression();
        if (termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)) {
            let p1 = new simpledraw_view_1.Point(Number(context.get(2)), Number(context.get(3)));
            let p2 = new simpledraw_view_1.Point(Number(context.get(4)), Number(context.get(5)));
            context.api.execute(simpledraw_view_1.Action.CREATE_SQUARE, {}, [p1, p2]);
            return true;
        }
        else
            return false;
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
        //Add expr
        let termTokenExpAdd = new TerminalTokenExpression('add');
        let expAdd = new AddExpression();
        let newContext = context.clone();
        if (termTokenExpAdd.interpret(newContext) && expAdd.interpret(newContext))
            return true;
        //Translate expr
        let termTokenExpMove = new TerminalTokenExpression('translate');
        let expMove = new TranslateExpression();
        newContext = context.clone();
        if (termTokenExpMove.interpret(newContext) && expMove.interpret(newContext))
            return true;
        //Scale expr
        let termTokenExpScale = new TerminalTokenExpression('scale');
        let expScale = new ScaleExpression();
        newContext = context.clone();
        if (termTokenExpScale.interpret(newContext) && expScale.interpret(newContext))
            return true;
        //Rotate expr
        let termTokenExpRotate = new TerminalTokenExpression('rotate');
        let expRotate = new RotateExpression();
        newContext = context.clone();
        if (termTokenExpRotate.interpret(newContext) && expRotate.interpret(newContext))
            return true;
        //Grid expr
        let termTokenExpGrid = new TerminalTokenExpression('grid');
        let expGrid = new GridExpression();
        newContext = context.clone();
        if (termTokenExpGrid.interpret(newContext) && expGrid.interpret(newContext))
            return true;
        //Undo
        let termTokenUndo = new TerminalTokenExpression('undo');
        newContext = context.clone();
        if (termTokenUndo.interpret(newContext)) {
            context.api.execute(simpledraw_view_1.Action.UNDO, {}, []);
            return true;
        }
        //Redo
        let termTokenRedo = new TerminalTokenExpression('redo');
        newContext = context.clone();
        if (termTokenRedo.interpret(newContext)) {
            context.api.execute(simpledraw_view_1.Action.REDO, {}, []);
            return true;
        }
        return false;
    }
}
class Interpreter {
    constructor(api) {
        this.api = api;
    }
    eval(sentence) {
        let ctx = new Context(sentence, this.api);
        let startExpr = new StartExpression();
        return startExpr.interpret(ctx);
    }
}
exports.Interpreter = Interpreter;

},{"../view/simpledraw_view":15}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
class SimpleDrawAPI {
    constructor(document) {
        this.document = document;
        this.executers = new Map();
        this.executers.set(simpledraw_view_1.Action.CREATE_CIRCLE, new CreateCircleExecuter());
        this.executers.set(simpledraw_view_1.Action.CREATE_SQUARE, new CreateSquareExecuter());
        this.executers.set(simpledraw_view_1.Action.CREATE_TRIANGLE, new CreateTriangleExecuter());
        this.executers.set(simpledraw_view_1.Action.TRANSLATE, new TranslateExecuter());
        this.executers.set(simpledraw_view_1.Action.ROTATE, new RotateExecuter());
        this.executers.set(simpledraw_view_1.Action.SCALE, new ScaleExecuter());
        this.executers.set(simpledraw_view_1.Action.GRID, new GridExecuter());
        this.executers.set(simpledraw_view_1.Action.UNDO, new UndoExecuter());
        this.executers.set(simpledraw_view_1.Action.REDO, new RedoExecuter());
    }
    execute(action, args, points) {
        if (args == undefined)
            args = {};
        console.log(simpledraw_view_1.Action[action] + ' with args ' + args + ' and ' + points.length + ' points');
        if (this.executers.has(action)) {
            this.executers.get(action).executeAction(this.document, args, points);
            this.document.notifyObservers();
            return true;
        }
        else
            return false;
    }
}
exports.SimpleDrawAPI = SimpleDrawAPI;
//args = {radius}, points = [center]
//args = {}, points = [center, point]
class CreateCircleExecuter {
    executeAction(document, args, points) {
        const centre = points[0];
        let radius;
        if (points.length > 1) {
            const point = points[1];
            radius = Math.sqrt(Math.pow(point.x - centre.x, 2) + Math.pow(point.y - centre.y, 2));
        }
        else
            radius = args.radius;
        document.createCircle(centre.x, centre.y, radius, '#F6D55C');
        console.log('create circle');
    }
}
//args = {}, points = [corner1, corner2]
class CreateSquareExecuter {
    executeAction(document, args, points) {
        const dimensions = this.calculateDimensions(points[0], points[1]);
        document.createRectangle(dimensions[0].x, dimensions[0].y, dimensions[1], dimensions[2], '#20639B');
        console.log('create square');
    }
    calculateDimensions(p1, p2) {
        let topLeftCorner;
        let width;
        let height;
        if (p2.x >= p1.x && p2.y >= p1.y) {
            topLeftCorner = p1;
            width = p2.x - p1.x;
            height = p2.y - p1.y;
        }
        if (p2.x >= p1.x && p2.y <= p1.y) {
            topLeftCorner = new simpledraw_view_1.Point(p1.x, p2.y);
            width = p2.x - p1.x;
            height = p1.y - p2.y;
        }
        if (p2.x <= p1.x && p2.y <= p1.y) {
            topLeftCorner = p2;
            width = p1.x - p2.x;
            height = p1.y - p2.y;
        }
        if (p2.x <= p1.x && p2.y >= p1.y) {
            topLeftCorner = new simpledraw_view_1.Point(p2.x, p1.y);
            width = p1.x - p2.x;
            height = p2.y - p1.y;
        }
        let centre = new simpledraw_view_1.Point(topLeftCorner.x + width / 2, topLeftCorner.y + height / 2);
        return [centre, width, height];
    }
}
exports.CreateSquareExecuter = CreateSquareExecuter;
//args = {}, points = [vertex1, vertex2, vertex3]
class CreateTriangleExecuter {
    executeAction(document, args, points) {
        console.log('create triangle');
    }
}
//args = {}, points = [origin, destiny]
class TranslateExecuter {
    executeAction(document, args, points) {
        console.log('translate');
    }
}
//args = {angle}, points = [point]
class RotateExecuter {
    executeAction(document, args, points) {
        console.log('rotate');
    }
}
//args = {sx, sy}, points = [point]
class ScaleExecuter {
    executeAction(document, args, points) {
        for (const shape of document.objects) {
            if (shape.isHit(points[0]))
                shape.scale(args.sx, args.sy);
        }
        console.log('scale');
    }
}
//args = {horizontal_units, vertical_units}, points = [point]
class GridExecuter {
    executeAction(document, args, points) {
        console.log('grid');
    }
}
class UndoExecuter {
    executeAction(document, args, points) {
        document.undo();
    }
}
class RedoExecuter {
    executeAction(document, args, points) {
        document.redo();
    }
}

},{"../view/simpledraw_view":15}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
class Utils {
    static download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    static getRotatedPoint(centerPoint, angle, point) {
        // translate point to origin
        let tempX = point.x - centerPoint.x;
        let tempY = point.y - centerPoint.y;
        // now apply rotation
        let radAngle = (angle * Math.PI) / 180;
        let rotatedX = tempX * Math.cos(radAngle) - tempY * Math.sin(radAngle);
        let rotatedY = tempX * Math.sin(radAngle) + tempY * Math.cos(radAngle);
        // translate back
        return new simpledraw_view_1.Point(rotatedX + centerPoint.x, rotatedY + centerPoint.y);
    }
    static getTriangleArea(pointA, pointB, pointC) {
        return (Math.abs(pointA.x * (pointB.y - pointC.y) + pointB.x * (pointC.y - pointA.y) + pointC.x * (pointA.y - pointB.y)) / 2);
    }
}
exports.Utils = Utils;

},{"../view/simpledraw_view":15}],6:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("./view/simpledraw_view");
const renderer_canvas_1 = require("./view/renderer_canvas");
const renderer_svg_1 = require("./view/renderer_svg");
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
canvas1.style.border = '1px solid black';
divCanvas1.appendChild(canvas1);
const canvas2 = document.createElement('canvas');
canvas2.id = 'canvas2';
canvas2.width = divCanvas2.clientWidth;
canvas2.height = divCanvas2.clientHeight;
canvas2.style.zIndex = '8';
canvas2.style.position = 'absolute';
canvas2.style.border = '1px solid black';
divCanvas2.appendChild(canvas2);
const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg1.id = 'svg1';
svg1.setAttribute('width', divSVG1.clientWidth.toString());
svg1.setAttribute('height', divSVG1.clientHeight.toString());
svg1.style.zIndex = '8';
svg1.style.position = 'absolute';
svg1.style.border = '1px solid black';
divSVG1.appendChild(svg1);
const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg2.id = 'svg2';
svg2.setAttribute('width', divSVG2.clientWidth.toString());
svg2.setAttribute('height', divSVG2.clientHeight.toString());
svg2.style.zIndex = '8';
svg2.style.position = 'absolute';
svg2.style.border = '1px solid black';
divSVG2.appendChild(svg2);
//Create view and add renderers
const simpleDraw = new simpledraw_view_1.SimpleDrawView();
simpleDraw.addRenderer(new renderer_canvas_1.CanvasRenderer('canvas1'));
simpleDraw.addRenderer(new renderer_canvas_1.CanvasRenderer('canvas2'));
simpleDraw.addRenderer(new renderer_svg_1.SVGRenderer('svg1'));
simpleDraw.addRenderer(new renderer_svg_1.SVGRenderer('svg2'));

},{"./view/renderer_canvas":13,"./view/renderer_svg":14,"./view/simpledraw_view":15}],7:[function(require,module,exports){
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
    constructor(doc, x, y, radius, color) {
        super(doc, new shape_1.Circle(x, y, radius, color), doc.layersManager.activeLayer);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
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

},{"./shape":10}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("./actions");
const undo_1 = require("./undo");
const layers_1 = require("./layers");
class SimpleDrawDocument {
    constructor() {
        this.objects = new Array();
        this.observers = new Array();
        this.undoManager = new undo_1.UndoManager();
        this.layersManager = new layers_1.LayersManager();
    }
    undo() {
        this.undoManager.undo();
    }
    redo() {
        this.undoManager.redo();
    }
    add(r) {
        this.objects.push(r);
        r.layer = this.layersManager.activeLayer;
    }
    do(a) {
        this.undoManager.onActionDone(a);
        return a.do();
    }
    notifyObservers() {
        for (const obs of this.observers)
            obs.notify(this);
    }
    save(saveMode) {
        // let doc: XMLDocument = document.implementation.createDocument("", "", null);
        // let savedObjets = doc.createElement("objects");
        // let visitor = new XMLConverterVisitor(doc);
        // for (const object of this.objects) {
        //     savedObjets.appendChild(object.accept(visitor));
        // }
        // doc.appendChild(savedObjets);
        //try to write into file later cause it's "dangerous", either blob or file
        //let newFile = new File(, { type: "text/xml", endings: 'native' });
        // console.log(doc);
        saveMode.visitAll(this.objects);
    }
    createRectangle(x, y, width, height, color) {
        return this.do(new actions_1.CreateRectangleAction(this, x, y, width, height, color));
    }
    createCircle(x, y, radius, color) {
        return this.do(new actions_1.CreateCircleAction(this, x, y, radius, color));
    }
    translate(s, xd, yd) {
        return this.do(new actions_1.TranslateAction(this, s, xd, yd));
    }
    rotate(s, angled) {
        return this.do(new actions_1.RotateAction(this, s, angled));
    }
    getObjectsForRendering() {
        return this.layersManager.mapObjectsToLayers(this.objects);
    }
    getLayersForRendering() {
        return this.layersManager.getOrderedLayers();
    }
    registerObserver(observer) {
        this.observers.push(observer);
    }
}
exports.SimpleDrawDocument = SimpleDrawDocument;

},{"./actions":7,"./layers":9,"./undo":11}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
const utils_1 = require("../controller/utils");
class Shape {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = 0;
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
        super(x, y, color);
        this.width = width;
        this.height = height;
    }
    accept(visitor) {
        return visitor.visitRectangle(this);
    }
    isHit(point) {
        let rectangleArea = this.width * this.height;
        let centerPoint = new simpledraw_view_1.Point(this.x, this.y);
        let pointA = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new simpledraw_view_1.Point(this.x - this.width / 2, this.y - this.height / 2));
        let pointB = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new simpledraw_view_1.Point(this.x - this.width / 2, this.y + this.height / 2));
        let pointC = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new simpledraw_view_1.Point(this.x + this.width / 2, this.y + this.height / 2));
        let pointD = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new simpledraw_view_1.Point(this.x + this.width / 2, this.y - this.height / 2));
        let trianglesArea = utils_1.Utils.getTriangleArea(pointA, pointB, point);
        trianglesArea += utils_1.Utils.getTriangleArea(pointB, pointC, point);
        trianglesArea += utils_1.Utils.getTriangleArea(pointC, pointD, point);
        trianglesArea += utils_1.Utils.getTriangleArea(pointD, pointA, point);
        return Math.abs(rectangleArea - trianglesArea) < 1;
    }
    scale(sx, sy) {
        this.width *= sx;
        this.height *= sy;
    }
}
exports.Rectangle = Rectangle;
class Circle extends Shape {
    constructor(x, y, radius, color) {
        super(x, y, color);
        this.radius = radius;
        this.rx = radius;
        this.ry = radius;
    }
    accept(visitor) {
        return visitor.visitCircle(this);
    }
    isHit(point) {
        return Math.hypot(point.x - this.x, point.y - this.y) < this.radius;
    }
    scale(sx, sy) {
        this.rx *= sx;
        this.ry *= sy;
    }
}
exports.Circle = Circle;

},{"../controller/utils":5,"../view/simpledraw_view":15}],11:[function(require,module,exports){
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
        //console.log(this.doStack);
    }
}
exports.UndoManager = UndoManager;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("./simpledraw_view");
class Renderer {
    constructor(elementID) {
        this.elementID = elementID;
        this.GRID_STEP = 50;
        this.colorMode = false;
        this.zoom = 0;
        this.oldObjects = new Map();
        this.oldLayers = new Array();
        const modeElem = (document.getElementById(elementID + '_mode'));
        modeElem.addEventListener('change', () => {
            this.colorMode = modeElem.value == "Color";
            this.renderAgain();
        });
        const zoomElem = (document.getElementById(elementID + '_zoom'));
        zoomElem.addEventListener('change', () => {
            this.zoom = Number(zoomElem.value);
            this.renderAgain();
        });
    }
    render(objs, layers) {
        this.oldObjects = objs;
        this.oldLayers = layers;
        this.init();
        this.clearCanvas();
        this.applyZoom();
        this.drawGrid();
        this.drawObjects(objs, layers);
        this.finish();
    }
    renderAgain() {
        this.render(this.oldObjects, this.oldLayers);
    }
    mapToRenderer(point) {
        const dimensions = this.element.getBoundingClientRect();
        const x = dimensions.left;
        const y = dimensions.top;
        const width = x + dimensions.width;
        const height = y + dimensions.height;
        if (point.x < x || point.x > width || point.y < y || point.y > height)
            return new simpledraw_view_1.NullPoint();
        return new simpledraw_view_1.Point(point.x - x, point.y - y);
    }
    getDimensions() {
        const width = this.element.getBoundingClientRect().width;
        const height = this.element.getBoundingClientRect().height;
        return [width, height];
    }
    drawGrid() {
        const width = this.getDimensions()[0];
        const height = this.getDimensions()[1];
        for (let i = 0; i < width; i += this.GRID_STEP)
            this.drawLine(i, 0, i, height);
        for (let i = 0; i < height; i += this.GRID_STEP)
            this.drawLine(0, i, width, i);
    }
    notify(document) {
        this.render(document.getObjectsForRendering(), document.getLayersForRendering());
    }
}
exports.Renderer = Renderer;

},{"./simpledraw_view":15}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const shape_1 = require("../model/shape");
class CanvasRenderer extends renderer_1.Renderer {
    constructor(elementID) {
        super(elementID);
        this.element = document.getElementById(elementID);
        let canvas = this.element;
        this.ctx = canvas.getContext('2d');
    }
    IsInPath(event) {
        let canvas = this.element;
        let bb, x, y;
        bb = this.element.getBoundingClientRect();
        x = (event.clientX - bb.left) * (canvas.width / bb.width);
        y = (event.clientY - bb.top) * (canvas.height / bb.height);
        return this.ctx.isPointInPath(x, y);
    }
    drawObjects(objs, layers, event) {
        this.objs = objs;
        this.layers = layers;
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                if (shape instanceof shape_1.Circle) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = shape.color;
                    this.ctx.ellipse(shape.x, shape.y, shape.rx, shape.ry, 0, 0, 2 * Math.PI);
                    if (event) {
                        if (this.IsInPath(event)) {
                            //selectedShape(shape, this.page)
                        }
                    }
                    this.ctx.closePath();
                    this.ctx.fillStyle = shape.color;
                    this.ctx.stroke();
                    if (this.colorMode)
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
                    if (this.colorMode)
                        this.ctx.fill();
                    //restore the state before drawing next shape
                    this.ctx.restore();
                    if (event) {
                        if (this.IsInPath(event)) {
                            //selectedShape(shape, this.page)
                        }
                    }
                }
            }
        }
    }
    drawLine(x1, y1, x2, y2) {
        const defaultWidth = this.ctx.lineWidth;
        const defaultColor = this.ctx.strokeStyle;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#DDDDDD';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.lineWidth = defaultWidth;
        this.ctx.strokeStyle = defaultColor;
    }
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
    }
    init() {
        this.ctx.save();
    }
    applyZoom() {
        this.ctx.scale(1 + this.zoom, 1 + this.zoom);
    }
    finish() {
        this.ctx.restore();
    }
}
exports.CanvasRenderer = CanvasRenderer;

},{"../model/shape":10,"./renderer":12}],14:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const shape_1 = require("../model/shape");
class SVGRenderer extends renderer_1.Renderer {
    constructor(elementID) {
        super(elementID);
        this.objs = new Array();
        this.factory = new SVGShapeRendererFactory();
        this.element = document.getElementById(elementID);
    }
    drawObjects(objs, layers) {
        for (const layer of layers) {
            for (const shape of objs.get(layer)) {
                let renderableObject = this.factory.make(shape);
                renderableObject = this.colorMode
                    ? new SVGColorDecorator(renderableObject)
                    : new SVGWireframeDecorator(renderableObject);
                const e = renderableObject.render();
                console.log(e);
                this.element.appendChild(e);
            }
        }
    }
    drawLine(x1, y1, x2, y2) {
        let newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('x1', x1.toString());
        newLine.setAttribute('y1', y1.toString());
        newLine.setAttribute('x2', x2.toString());
        newLine.setAttribute('y2', y2.toString());
        newLine.setAttribute('stroke', '#DDDDDD');
        this.element.appendChild(newLine);
    }
    clearCanvas() {
        this.element.innerHTML = '';
    }
    init() { }
    applyZoom() { }
    finish() { }
}
exports.SVGRenderer = SVGRenderer;
class SVGShapeRenderer {
    constructor(shape) {
        this.shape = shape;
    }
}
class SVGShapeRendererFactory {
    make(shape) {
        if (shape instanceof shape_1.Rectangle)
            return new SVGRectangleRenderer(shape);
        if (shape instanceof shape_1.Circle)
            return new SVGCircleRenderer(shape);
        if (shape instanceof shape_1.Rectangle)
            return new SVGRectangleRenderer(shape);
        else
            return new SVGNullRenderer(shape);
    }
}
class SVGNullRenderer extends SVGShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render() {
        return document.createElementNS('http://www.w3.org/2000/svg', 'g');
    }
}
class SVGColorDecorator extends SVGShapeRenderer {
    constructor(obj) {
        super(obj.shape);
        this.obj = obj;
    }
    render() {
        console.log('Decorator');
        let e = this.obj.render();
        if (e.tagName == 'g') {
            let realElement = e.firstElementChild;
            realElement.setAttribute('style', `stroke: black; fill: ${this.shape.color}`);
            realElement.setAttribute('fill-opacity', '1.0');
        }
        else {
            e.setAttribute('style', `stroke: black; fill: ${this.shape.color}`);
            e.setAttribute('fill-opacity', '1.0');
        }
        return e;
    }
}
class SVGWireframeDecorator extends SVGShapeRenderer {
    constructor(obj) {
        super(obj.shape);
        this.obj = obj;
    }
    render() {
        console.log('Decorator');
        let e = this.obj.render();
        if (e.tagName == 'g') {
            let realElement = e.firstElementChild;
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`);
            e.setAttribute('fill-opacity', '0.0');
        }
        else {
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`);
            e.setAttribute('fill-opacity', '0.0');
        }
        return e;
    }
}
class SVGRectangleRenderer extends SVGShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render() {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const shape = this.shape;
        g.setAttribute('transform', `translate(${shape.x}, ${shape.y}) rotate(${shape.angle})`);
        e.setAttribute('width', shape.width.toString());
        e.setAttribute('height', shape.height.toString());
        e.setAttribute('x', (-shape.width / 2).toString());
        e.setAttribute('y', (-shape.height / 2).toString());
        g.appendChild(e);
        return g;
    }
}
class SVGCircleRenderer extends SVGShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render() {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        const shape = this.shape;
        e.setAttribute('cx', shape.x.toString());
        e.setAttribute('cy', shape.y.toString());
        e.setAttribute('rx', shape.rx.toString());
        e.setAttribute('ry', shape.ry.toString());
        return e;
    }
}
class SVGTriangleRenderer extends SVGShapeRenderer {
    render() {
        return null;
    }
}

},{"../model/shape":10,"./renderer":12}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("../model/document");
const interpreter_1 = require("../controller/interpreter");
const simpledraw_api_1 = require("../controller/simpledraw_api");
const click_controller_1 = require("../controller/click_controller");
const converter_1 = require("../controller/converter");
class SimpleDrawView {
    constructor() {
        this.renderers = new Array();
        this.document = new document_1.SimpleDrawDocument();
        this.api = new simpledraw_api_1.SimpleDrawAPI(this.document);
        this.interpreter = new interpreter_1.Interpreter(this.api);
        this.click_controller = new click_controller_1.ClickController(this.api);
        document.getElementById('repl').addEventListener('submit', (e) => {
            e.preventDefault();
            const replPrompt = document.querySelector('#prompt');
            const replRes = document.querySelector('#res');
            const command = replPrompt.value;
            if (command == null)
                return;
            const success = this.interpreter.eval(command);
            console.log(success);
            replRes.innerHTML = success ? '&nbsp;✔️' : '&nbsp;❌';
        });
        document.getElementById('circle').addEventListener('click', (e) => {
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_CIRCLE));
        });
        document.getElementById('square').addEventListener('click', (e) => {
            console.log('create square action');
            console.log(e);
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_SQUARE));
        });
        document.getElementById('triangle').addEventListener('click', (e) => {
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_TRIANGLE));
        });
        document.getElementById('translate').addEventListener('submit', (e) => {
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.TRANSLATE));
        });
        document.getElementById('rotate').addEventListener('submit', (e) => {
            e.preventDefault();
            const angle = Number(document.getElementById('angle').value);
            if (!isNaN(angle))
                this.click_controller.processEvent(new UserEventAction(Action.ROTATE, { angle: angle }));
        });
        document.getElementById('grid').addEventListener('submit', (e) => {
            e.preventDefault();
            const units_x = Number(document.getElementById('x_units').nodeValue);
            const units_y = Number(document.getElementById('y_units').nodeValue);
            if (!isNaN(units_x) && isNaN(units_y))
                this.click_controller.processEvent(new UserEventAction(Action.GRID, { units_x: units_x, units_y: units_y }));
        });
        document.getElementById('scale').addEventListener('submit', (e) => {
            e.preventDefault();
            const sx = Number(document.getElementById('sx').value);
            const sy = Number(document.getElementById('sy').value);
            if (!isNaN(sx) && !isNaN(sy))
                this.click_controller.processEvent(new UserEventAction(Action.SCALE, { sx: sx, sy: sy }));
        });
        document.getElementById('undo').addEventListener('click', (e) => {
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.UNDO));
        });
        document.getElementById('redo').addEventListener('click', (e) => {
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.REDO));
        });
        document.getElementById('saveForm').addEventListener('submit', (e) => {
            e.preventDefault();
            let type = document.getElementById('saveDropdown').value;
            //para ja so temos XML ou TXT (escolher um)
            switch (type) {
                case 'xml':
                    this.document.save(new converter_1.XMLConverterVisitor());
                    break;
                case 'txt':
                    this.document.save(new converter_1.TXTConverterVisitor());
                    break;
                default:
                    break;
            }
            console.log('Save');
        });
        document.body.addEventListener('mousedown', (e) => {
            let screenClick = new Point(e.pageX, e.pageY);
            let renderCoord = this.mapScreenspaceToRenderspace(screenClick);
            console.log(renderCoord);
            if (!renderCoord.isNil())
                this.click_controller.processEvent(new UserEventPoint(renderCoord));
        }, true);
    }
    addRenderer(renderer) {
        this.renderers.push(renderer);
        this.document.registerObserver(renderer);
        renderer.drawGrid();
    }
    mapScreenspaceToRenderspace(point) {
        let res = new NullPoint();
        for (const renderer of this.renderers) {
            res = renderer.mapToRenderer(point);
            if (!res.isNil())
                break;
        }
        return res;
    }
}
exports.SimpleDrawView = SimpleDrawView;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    isNil() {
        return false;
    }
}
exports.Point = Point;
class NullPoint extends Point {
    constructor() {
        super(-1, -1);
    }
    isNil() {
        return true;
    }
}
exports.NullPoint = NullPoint;
var Action;
(function (Action) {
    Action[Action["CREATE_SQUARE"] = 0] = "CREATE_SQUARE";
    Action[Action["CREATE_CIRCLE"] = 1] = "CREATE_CIRCLE";
    Action[Action["CREATE_TRIANGLE"] = 2] = "CREATE_TRIANGLE";
    Action[Action["TRANSLATE"] = 3] = "TRANSLATE";
    Action[Action["ROTATE"] = 4] = "ROTATE";
    Action[Action["GRID"] = 5] = "GRID";
    Action[Action["SCALE"] = 6] = "SCALE";
    Action[Action["UNDO"] = 7] = "UNDO";
    Action[Action["REDO"] = 8] = "REDO";
})(Action = exports.Action || (exports.Action = {}));
class UserEvent {
}
exports.UserEvent = UserEvent;
class UserEventAction extends UserEvent {
    constructor(action, args) {
        super();
        this.action = action;
        this.args = {};
        this.args = args;
    }
}
exports.UserEventAction = UserEventAction;
class UserEventPoint extends UserEvent {
    constructor(point) {
        super();
        this.point = point;
    }
}
exports.UserEventPoint = UserEventPoint;

},{"../controller/click_controller":1,"../controller/converter":2,"../controller/interpreter":3,"../controller/simpledraw_api":4,"../model/document":8}]},{},[6]);
