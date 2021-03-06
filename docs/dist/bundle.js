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
            if ([simpledraw_view_1.Action.UNDO, simpledraw_view_1.Action.REDO, simpledraw_view_1.Action.ADD_LAYER, simpledraw_view_1.Action.SET_LAYER].includes(event.action)) {
                context.api.execute(event.action, event.args, []);
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
        else {
            context.currState = new IdleState();
            context.currState.processEvent(context, event);
        }
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
            }
            else
                context.currState = new SecondPointClickedState(this.event, this.point1, event.point);
        }
        else {
            context.currState = new IdleState();
            context.currState.processEvent(context, event);
        }
    }
}
exports.FirstPointClickedState = FirstPointClickedState;
class SecondPointClickedState {
    constructor(event, point1, point2) {
        this.event = event;
        this.point1 = point1;
        this.point2 = point2;
    }
    processEvent(context, event) {
        if (event instanceof simpledraw_view_1.UserEventPoint) {
            if ([simpledraw_view_1.Action.CREATE_TRIANGLE].includes(this.event.action)) {
                context.api.execute(this.event.action, this.event.args, [
                    this.point1,
                    this.point2,
                    event.point,
                ]);
                context.currState = new IdleState();
            }
            else
                context.currState = new IdleState();
        }
        else {
            context.currState = new IdleState();
            context.currState.processEvent(context, event);
        }
    }
}
exports.SecondPointClickedState = SecondPointClickedState;

},{"../view/simpledraw_view":16}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class XMLConverterVisitor {
    constructor() {
        this.doc = document.implementation.createDocument('', '', null);
    }
    visitCreateRectangleAction(action) {
        let point1x = action.center.x - action.width / 2;
        let point1y = action.center.y - action.height / 2;
        let point2x = action.center.x + action.width / 2;
        let point2y = action.center.y + action.height / 2;
        let rectElem = this.doc.createElement('createRectangle');
        let point1 = this.doc.createElement('point');
        let point2 = this.doc.createElement('point');
        point1.setAttribute('x', point1x.toString());
        point1.setAttribute('y', point1y.toString());
        point2.setAttribute('x', point2x.toString());
        point2.setAttribute('y', point2y.toString());
        rectElem.setAttribute('color', action.color);
        rectElem.appendChild(point1);
        rectElem.appendChild(point2);
        return rectElem;
    }
    visitCreateCircleAction(action) {
        let circleElem = this.doc.createElement('createCircle');
        let point1 = this.doc.createElement('point');
        point1.setAttribute('x', action.center.x.toString());
        point1.setAttribute('y', action.center.y.toString());
        circleElem.setAttribute('radius', action.radius.toString());
        circleElem.setAttribute('color', action.color);
        circleElem.appendChild(point1);
        return circleElem;
    }
    visitCreateTriangleAction(action) {
        let triangleElem = this.doc.createElement('createTriangle');
        let point0 = this.doc.createElement('point');
        point0.setAttribute('x', action.p0.x.toString());
        point0.setAttribute('y', action.p0.y.toString());
        let point1 = this.doc.createElement('point');
        point1.setAttribute('x', action.p1.x.toString());
        point1.setAttribute('y', action.p1.y.toString());
        let point2 = this.doc.createElement('point');
        point2.setAttribute('x', action.p2.x.toString());
        point2.setAttribute('y', action.p2.y.toString());
        triangleElem.setAttribute('color', action.color);
        triangleElem.appendChild(point0);
        triangleElem.appendChild(point1);
        triangleElem.appendChild(point2);
        return triangleElem;
    }
    visitGridAction(action) {
        let gridElem = this.doc.createElement('grid');
        let clickedPoint = this.doc.createElement('clickedPoint');
        clickedPoint.setAttribute('x', action.clickedPoint.x.toString());
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString());
        gridElem.setAttribute('x_units', action.x_units.toString());
        gridElem.setAttribute('y_units', action.y_units.toString());
        gridElem.appendChild(clickedPoint);
        return gridElem;
    }
    visitTranslateAction(action) {
        let translateElem = this.doc.createElement('translate');
        let clickedPoint = this.doc.createElement('clickedPoint');
        clickedPoint.setAttribute('x', action.clickedPoint.x.toString());
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString());
        let newPoint = this.doc.createElement('newPoint');
        newPoint.setAttribute('x', action.newPoint.x.toString());
        newPoint.setAttribute('y', action.newPoint.y.toString());
        translateElem.appendChild(clickedPoint);
        translateElem.appendChild(newPoint);
        return translateElem;
    }
    visitRotateAction(action) {
        let rotateElem = this.doc.createElement('rotate');
        let clickedPoint = this.doc.createElement('clickedPoint');
        clickedPoint.setAttribute('x', action.clickedPoint.x.toString());
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString());
        rotateElem.setAttribute('angle', action.angled.toString());
        rotateElem.appendChild(clickedPoint);
        return rotateElem;
    }
    visitScaleAction(action) {
        let scaleElem = this.doc.createElement('scale');
        let clickedPoint = this.doc.createElement('clickedPoint');
        clickedPoint.setAttribute('x', action.clickedPoint.x.toString());
        clickedPoint.setAttribute('y', action.clickedPoint.y.toString());
        scaleElem.setAttribute('sx', action.scaled.x.toString());
        scaleElem.setAttribute('sy', action.scaled.y.toString());
        scaleElem.appendChild(clickedPoint);
        return scaleElem;
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
        rectElem.setAttribute('x', rect.center.x.toString());
        rectElem.setAttribute('y', rect.center.y.toString());
        return rectElem;
    }
    visitCircle(circle) {
        console.log('I am XML Converter for the Circle element');
        var circleElem = this.doc.createElement('circ');
        circleElem.setAttribute('angle', circle.angle.toString());
        circleElem.setAttribute('color', circle.color);
        circleElem.setAttribute('layer', circle.layer.toString());
        circleElem.setAttribute('radius', circle.radius.toString());
        circleElem.setAttribute('x', circle.center.x.toString());
        circleElem.setAttribute('y', circle.center.y.toString());
        return circleElem;
    }
    visitAllDoActions(actions) {
        let savedObjets = this.doc.createElement('actions');
        for (const action of actions) {
            savedObjets.appendChild(action.accept(this));
        }
        this.doc.appendChild(savedObjets);
        utils_1.Utils.download('save.xml', new XMLSerializer().serializeToString(this.doc.documentElement));
    }
    visitTriangle(triangle) {
        console.log('I am XML Converter for the Triangle element');
        var triangleElem = this.doc.createElement('triangle');
        triangleElem.setAttribute('angle', triangle.angle.toString());
        triangleElem.setAttribute('color', triangle.color);
        triangleElem.setAttribute('layer', triangle.layer.toString());
        triangleElem.setAttribute('point0-x', triangle.p0.x.toString());
        triangleElem.setAttribute('point0-y', triangle.p0.y.toString());
        triangleElem.setAttribute('point1-x', triangle.p1.x.toString());
        triangleElem.setAttribute('point1-y', triangle.p1.y.toString());
        triangleElem.setAttribute('point2-x', triangle.p2.x.toString());
        triangleElem.setAttribute('point2-y', triangle.p2.y.toString());
        return triangleElem;
    }
}
exports.XMLConverterVisitor = XMLConverterVisitor;
class TXTConverterVisitor {
    visitCreateRectangleAction(action) {
        let point1x = action.center.x - action.width / 2;
        let point1y = action.center.y - action.height / 2;
        let point2x = action.center.x + action.width / 2;
        let point2y = action.center.y + action.height / 2;
        return `add square ${point1x} ${point1y} ${point2x} ${point2y} ${action.color}\r\n`;
    }
    visitCreateCircleAction(action) {
        return `add circle ${action.center.x} ${action.center.y} ${action.radius} ${action.color}\r\n`;
    }
    visitCreateTriangleAction(action) {
        return `add triangle ${action.p0.x} ${action.p0.y} ${action.p1.x} ${action.p1.y} ${action.p2.x} ${action.p2.y} ${action.color}\r\n`;
    }
    visitGridAction(action) {
        return `grid ${action.x_units} ${action.y_units} ${action.clickedPoint.x} ${action.clickedPoint.y}\r\n`;
    }
    visitTranslateAction(action) {
        return `translate ${action.clickedPoint.x} ${action.clickedPoint.y} ${action.newPoint.x} ${action.newPoint.y}\r\n`;
    }
    visitRotateAction(action) {
        return `rotate ${action.angled} ${action.clickedPoint.x} ${action.clickedPoint.y}\r\n`;
    }
    visitScaleAction(action) {
        return `scale ${action.scaled.x} ${action.scaled.y} ${action.clickedPoint.x} ${action.clickedPoint.y}\r\n`;
    }
    visitAll(objects) {
        let saved = '';
        for (const object of objects) {
            saved = saved.concat(object.accept(this));
        }
        utils_1.Utils.download('save.txt', saved);
    }
    visitRectangle(rect) {
        let saved = 'Rectangle \r\n';
        saved = saved.concat('angle= ', rect.angle.toString(), '\r\n');
        saved = saved.concat('color= ', rect.color, '\r\n');
        saved = saved.concat('height= ', rect.height.toString(), '\r\n');
        saved = saved.concat('layer= ', rect.layer.toString(), '\r\n');
        saved = saved.concat('width= ', rect.width.toString(), '\r\n');
        saved = saved.concat('x= ', rect.center.x.toString(), '\r\n');
        saved = saved.concat('y= ', rect.center.y.toString(), '\r\n');
        return saved;
    }
    visitCircle(circle) {
        let saved = 'Circle \r\n';
        saved = saved.concat('angle= ', circle.angle.toString(), '\r\n');
        saved = saved.concat('color= ', circle.color, '\r\n');
        saved = saved.concat('layer= ', circle.layer.toString(), '\r\n');
        saved = saved.concat('radius= ', circle.radius.toString(), '\r\n');
        saved = saved.concat('x= ', circle.center.x.toString(), '\r\n');
        saved = saved.concat('y= ', circle.center.y.toString(), '\r\n');
        return saved;
    }
    visitAllDoActions(actions) {
        let saved = '';
        for (const action of actions) {
            saved = saved.concat(action.accept(this));
        }
        utils_1.Utils.download('save.txt', saved);
    }
    visitTriangle(triangle) {
        let saved = 'Triangle \r\n';
        saved = saved.concat('angle= ', triangle.angle.toString(), '\r\n');
        saved = saved.concat('color= ', triangle.color, '\r\n');
        saved = saved.concat('layer= ', triangle.layer.toString(), '\r\n');
        saved = saved.concat('point0-x= ', triangle.p0.x.toString(), '\r\n');
        saved = saved.concat('point0-y= ', triangle.p0.y.toString(), '\r\n');
        saved = saved.concat('point1-x= ', triangle.p1.x.toString(), '\r\n');
        saved = saved.concat('point1-y= ', triangle.p1.y.toString(), '\r\n');
        saved = saved.concat('point2-x= ', triangle.p2.x.toString(), '\r\n');
        saved = saved.concat('point2-y= ', triangle.p2.y.toString(), '\r\n');
        return saved;
    }
}
exports.TXTConverterVisitor = TXTConverterVisitor;

},{"./utils":6}],3:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
const utils_1 = require("./utils");
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
            const regex = new RegExp('^[0-9]+\.?[0-9]*$');
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
            let p1 = new utils_1.Point(Number(context.get(3)), Number(context.get(4)));
            let horizontal_units = context.get(1);
            let vertical_units = context.get(2);
            context.api.execute(simpledraw_view_1.Action.GRID, { x_units: horizontal_units, y_units: vertical_units }, [p1]);
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
            let p1 = new utils_1.Point(Number(context.get(3)), Number(context.get(4)));
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
            let p1 = new utils_1.Point(Number(context.get(2)), Number(context.get(3)));
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
            let p1 = new utils_1.Point(Number(context.get(1)), Number(context.get(2)));
            let p2 = new utils_1.Point(Number(context.get(3)), Number(context.get(4)));
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
            let p1 = new utils_1.Point(Number(context.get(2)), Number(context.get(3)));
            let p2 = new utils_1.Point(Number(context.get(4)), Number(context.get(5)));
            let p3 = new utils_1.Point(Number(context.get(6)), Number(context.get(7)));
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
            let p1 = new utils_1.Point(Number(context.get(2)), Number(context.get(3)));
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
            let p1 = new utils_1.Point(Number(context.get(2)), Number(context.get(3)));
            let p2 = new utils_1.Point(Number(context.get(4)), Number(context.get(5)));
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

},{"../view/simpledraw_view":16,"./utils":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
const utils_1 = require("./utils");
class loadXML {
    constructor(xmlDocument, api) {
        this.xmlDocument = xmlDocument;
        this.api = api;
    }
    load() {
        for (const node of this.xmlDocument.childNodes) {
            switch (node.nodeName) {
                case 'createRectangle':
                    this.createRectangle(node);
                    break;
                case 'createCircle':
                    this.createCircle(node);
                    break;
                case 'createTriangle':
                    this.createTriangle(node);
                    break;
                case 'grid':
                    this.grid(node);
                    break;
                case 'translate':
                    this.translate(node);
                    break;
                case 'rotate':
                    this.rotate(node);
                    break;
                case 'scale':
                    this.scale(node);
                    break;
                default:
                    console.error(`Couldn't find action: ${node.nodeName}`);
                    break;
            }
        }
    }
    createRectangle(node) {
        let point0Element = node.children[0];
        let point1Element = node.children[1];
        let point0 = new utils_1.Point(+point0Element.attributes.x.nodeValue, +point0Element.attributes.y.nodeValue);
        let point1 = new utils_1.Point(+point1Element.attributes.x.nodeValue, +point1Element.attributes.y.nodeValue);
        this.api.execute(simpledraw_view_1.Action.CREATE_SQUARE, {}, [point0, point1]);
    }
    createCircle(node) {
        let centerElement = node.children[0];
        let radius = +node.attributes.radius.nodeValue;
        let center = new utils_1.Point(+centerElement.attributes.x.nodeValue, +centerElement.attributes.y.nodeValue);
        this.api.execute(simpledraw_view_1.Action.CREATE_CIRCLE, { radius: radius }, [center]);
    }
    createTriangle(node) {
        let point0Element = node.children[0];
        let point1Element = node.children[1];
        let point2Element = node.children[2];
        let point0 = new utils_1.Point(+point0Element.attributes.x.nodeValue, +point0Element.attributes.y.nodeValue);
        let point1 = new utils_1.Point(+point1Element.attributes.x.nodeValue, +point1Element.attributes.y.nodeValue);
        let point2 = new utils_1.Point(+point2Element.attributes.x.nodeValue, +point2Element.attributes.y.nodeValue);
        this.api.execute(simpledraw_view_1.Action.CREATE_TRIANGLE, {}, [point0, point1, point2]);
    }
    grid(node) {
        let x_units = +node.attributes.x_units.nodeValue;
        let y_units = +node.attributes.y_units.nodeValue;
        let clickedElement = node.children[0];
        let clicked = new utils_1.Point(+clickedElement.attributes.x.nodeValue, +clickedElement.attributes.y.nodeValue);
        this.api.execute(simpledraw_view_1.Action.GRID, { x_units: x_units, y_units: y_units }, [clicked]);
    }
    translate(node) {
        let clickedElement = node.children[0];
        let newPointElement = node.children[1];
        let clicked = new utils_1.Point(+clickedElement.attributes.x.nodeValue, +clickedElement.attributes.y.nodeValue);
        let newPoint = new utils_1.Point(+newPointElement.attributes.x.nodeValue, +newPointElement.attributes.y.nodeValue);
        this.api.execute(simpledraw_view_1.Action.TRANSLATE, {}, [clicked, newPoint]);
    }
    rotate(node) {
        let angle = +node.attributes.angle.nodeValue;
        let clickedElement = node.children[0];
        let clicked = new utils_1.Point(+clickedElement.attributes.x.nodeValue, +clickedElement.attributes.y.nodeValue);
        console.log('rotate');
        console.log(clicked, angle);
        this.api.execute(simpledraw_view_1.Action.ROTATE, { angle: angle }, [clicked]);
    }
    scale(node) {
        let sx = +node.attributes.sx.nodeValue;
        let sy = +node.attributes.sy.nodeValue;
        let clickedElement = node.children[0];
        let clicked = new utils_1.Point(+clickedElement.attributes.x.nodeValue, +clickedElement.attributes.y.nodeValue);
        console.log("scale");
        console.log(clicked, sx, sy);
        this.api.execute(simpledraw_view_1.Action.SCALE, { sx: sx, sy: sy }, [clicked]);
    }
}
exports.loadXML = loadXML;

},{"../view/simpledraw_view":16,"./utils":6}],5:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("../view/simpledraw_view");
const utils_1 = require("./utils");
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
        this.executers.set(simpledraw_view_1.Action.SET_LAYER, new SetLayerExecuter());
        this.executers.set(simpledraw_view_1.Action.ADD_LAYER, new AddLayerExecuter());
    }
    execute(action, args, points) {
        if (args == undefined)
            args = {};
        if (this.executers.has(action)) {
            this.executers.get(action).executeAction(this.document, args, points);
            this.document.notifyRendererObservers();
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
        document.createCircle(centre, radius, '#F6D55C');
    }
}
//args = {}, points = [corner1, corner2]
class CreateSquareExecuter {
    executeAction(document, args, points) {
        const dimensions = this.calculateDimensions(points[0], points[1]);
        document.createRectangle(dimensions[0], dimensions[1], dimensions[2], '#20639B');
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
            topLeftCorner = new utils_1.Point(p1.x, p2.y);
            width = p2.x - p1.x;
            height = p1.y - p2.y;
        }
        if (p2.x <= p1.x && p2.y <= p1.y) {
            topLeftCorner = p2;
            width = p1.x - p2.x;
            height = p1.y - p2.y;
        }
        if (p2.x <= p1.x && p2.y >= p1.y) {
            topLeftCorner = new utils_1.Point(p2.x, p1.y);
            width = p1.x - p2.x;
            height = p2.y - p1.y;
        }
        let centre = new utils_1.Point(topLeftCorner.x + width / 2, topLeftCorner.y + height / 2);
        return [centre, width, height];
    }
}
exports.CreateSquareExecuter = CreateSquareExecuter;
//args = {}, points = [vertex1, vertex2, vertex3]
class CreateTriangleExecuter {
    executeAction(document, args, points) {
        document.createTriangle(points[0], points[1], points[2], '#3CAEA3');
    }
}
//args = {}, points = [origin, destiny]
class TranslateExecuter {
    executeAction(document, args, points) {
        document.translate(points[0], points[1]);
    }
}
//args = {angle}, points = [point]
class RotateExecuter {
    executeAction(document, args, points) {
        document.rotate(points[0], args.angle);
    }
}
//args = {sx, sy}, points = [point]
class ScaleExecuter {
    executeAction(document, args, points) {
        document.scale(points[0], new utils_1.Point(args.sx, args.sy));
    }
}
//args = {x_units, y_units}, points = [point]
class GridExecuter {
    executeAction(document, args, points) {
        document.grid(points[0], args.x_units, args.y_units, '#ED553B');
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
class AddLayerExecuter {
    executeAction(document, args, points) {
        document.createLayer(args.layer);
    }
}
class SetLayerExecuter {
    executeAction(document, args, points) {
        document.setLayer(args.layer);
    }
}

},{"../view/simpledraw_view":16,"./utils":6}],6:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
        return new Point(rotatedX + centerPoint.x, rotatedY + centerPoint.y);
    }
    static getTriangleArea(pointA, pointB, pointC) {
        return (Math.abs(pointA.x * (pointB.y - pointC.y) +
            pointB.x * (pointC.y - pointA.y) +
            pointC.x * (pointA.y - pointB.y)) / 2);
    }
}
exports.Utils = Utils;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    isNil() {
        return this.x == -1 && this.y == -1;
    }
}
exports.Point = Point;
class NullPoint extends Point {
    constructor() {
        super(-1, -1);
    }
}
exports.NullPoint = NullPoint;

},{}],7:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const simpledraw_view_1 = require("./view/simpledraw_view");
const renderer_canvas_1 = require("./view/renderer_canvas");
const renderer_svg_1 = require("./view/renderer_svg");
window.setTimeout(() => {
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
    canvas1.addEventListener('click', function (event) {
        event.preventDefault();
    });
    divCanvas1.appendChild(canvas1);
    const canvas2 = document.createElement('canvas');
    canvas2.id = 'canvas2';
    canvas2.width = divCanvas2.clientWidth;
    canvas2.height = divCanvas2.clientHeight;
    canvas2.style.zIndex = '8';
    canvas2.style.position = 'absolute';
    canvas2.style.border = '1px solid black';
    canvas2.addEventListener('click', function (event) {
        event.preventDefault();
    });
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
}, 500);

},{"./view/renderer_canvas":14,"./view/renderer_svg":15,"./view/simpledraw_view":16}],8:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const utils_1 = require("../controller/utils");
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
    constructor(doc, center, radius, color) {
        super(doc, new shape_1.Circle(center, radius, color), doc.layersManager.activeLayer);
        this.center = center;
        this.radius = radius;
        this.color = color;
    }
    accept(visitor) {
        return visitor.visitCreateCircleAction(this);
    }
}
exports.CreateCircleAction = CreateCircleAction;
class CreateRectangleAction extends CreateShapeAction {
    constructor(doc, center, width, height, color) {
        super(doc, new shape_1.Rectangle(center, width, height, color), doc.layersManager.activeLayer);
        this.center = center;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    accept(visitor) {
        return visitor.visitCreateRectangleAction(this);
    }
}
exports.CreateRectangleAction = CreateRectangleAction;
class CreateTriangleAction extends CreateShapeAction {
    constructor(doc, p0, p1, p2, color) {
        super(doc, new shape_1.Triangle(p0, p1, p2, color), doc.layersManager.activeLayer);
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.color = color;
    }
    accept(visitor) {
        return visitor.visitCreateTriangleAction(this);
    }
}
exports.CreateTriangleAction = CreateTriangleAction;
class GridAction {
    constructor(doc, shape, x_units, y_units, color, clickedPoint) {
        this.doc = doc;
        this.shape = shape;
        this.x_units = x_units;
        this.y_units = y_units;
        this.color = color;
        this.clickedPoint = clickedPoint;
    }
    do() {
        console.log(this);
        for (let i = 0, w = 0; i < this.x_units; i++, w += this.shape.getWidthFromCenter() * 2 + 5) {
            for (let j = 0, h = 0; j < this.y_units; j++, h += this.shape.getHeightFromCenter() * 2 + 5) {
                if (i == 0 && j == 0)
                    continue;
                const s = this.shape.clone();
                s.color = this.color;
                s.isGrid = true;
                s.translate(new utils_1.Point(this.shape.center.x + w, this.shape.center.y + h));
                this.shape.children.push(s);
                this.doc.objects.push(s);
            }
        }
        this.shape.isGrid = true;
    }
    undo() {
        for (const shape of this.shape.children)
            this.doc.objects = this.doc.objects.filter(o => o !== shape);
        this.shape.isGrid = false;
    }
    accept(visitor) {
        return visitor.visitGridAction(this);
    }
}
exports.GridAction = GridAction;
class TranslateAction {
    constructor(shape, newPoint, clickedPoint) {
        this.shape = shape;
        this.newPoint = newPoint;
        this.clickedPoint = clickedPoint;
    }
    do() {
        this.oldPoint = this.shape.center;
        this.shape.translate(this.newPoint);
        if (this.shape.isGrid) {
            for (const s of this.shape.children) {
                const p = new utils_1.Point(s.center.x - this.oldPoint.x, s.center.y - this.oldPoint.y);
                const np = new utils_1.Point(this.newPoint.x + p.x, this.newPoint.y + p.y);
                s.translate(np);
            }
        }
    }
    undo() {
        this.shape.translate(this.oldPoint);
        if (this.shape.isGrid) {
            for (const s of this.shape.children) {
                const p = new utils_1.Point(s.center.x - this.newPoint.x, s.center.y - this.newPoint.y);
                const np = new utils_1.Point(this.oldPoint.x + p.x, this.oldPoint.y + p.y);
                s.translate(np);
            }
        }
    }
    accept(visitor) {
        return visitor.visitTranslateAction(this);
    }
}
exports.TranslateAction = TranslateAction;
class RotateAction {
    constructor(shape, angled, clickedPoint) {
        this.shape = shape;
        this.angled = angled;
        this.clickedPoint = clickedPoint;
    }
    do() {
        this.oldAngle = this.shape.angle;
        this.shape.rotate(this.angled);
        if (this.shape.isGrid) {
            for (const s of this.shape.children)
                s.rotate(this.angled);
        }
    }
    undo() {
        this.shape.angle = this.oldAngle;
        if (this.shape.isGrid) {
            for (const s of this.shape.children)
                s.angle = this.oldAngle;
        }
    }
    accept(visitor) {
        return visitor.visitRotateAction(this);
    }
}
exports.RotateAction = RotateAction;
class ScaleAction {
    constructor(shape, scaled, clickedPoint) {
        this.shape = shape;
        this.scaled = scaled;
        this.clickedPoint = clickedPoint;
    }
    do() {
        this.shape.scale(this.scaled.x, this.scaled.y);
        if (this.shape.isGrid) {
            for (const s of this.shape.children)
                s.scale(this.scaled.x, this.scaled.y);
        }
    }
    undo() {
        this.shape.scale(1.0 / this.scaled.x, 1.0 / this.scaled.y);
        if (this.shape.isGrid) {
            for (const s of this.shape.children)
                s.scale(1.0 / this.scaled.x, 1.0 / this.scaled.y);
        }
    }
    accept(visitor) {
        return visitor.visitScaleAction(this);
    }
}
exports.ScaleAction = ScaleAction;

},{"../controller/utils":6,"./shape":11}],9:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("./actions");
const undo_1 = require("./undo");
const layers_1 = require("./layers");
class SimpleDrawDocument {
    constructor() {
        this.objects = new Array();
        this.rendererObservers = new Array();
        this.layerObservers = new Array();
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
    notifyRendererObservers() {
        for (const obs of this.rendererObservers)
            obs.notify(this);
    }
    notifyLayersObservers() {
        for (const obs of this.layerObservers)
            obs.notify(this.getLayersForRendering());
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
        // saveMode.visitAll(this.objects)
        saveMode.visitAllDoActions(this.undoManager.doStack);
    }
    createRectangle(center, width, height, color) {
        return this.do(new actions_1.CreateRectangleAction(this, center, width, height, color));
    }
    createCircle(center, radius, color) {
        return this.do(new actions_1.CreateCircleAction(this, center, radius, color));
    }
    createTriangle(p0, p1, p2, color) {
        return this.do(new actions_1.CreateTriangleAction(this, p0, p1, p2, color));
    }
    grid(p, x_units, y_units, color) {
        console.log(x_units, y_units, p);
        for (let index = this.objects.length - 1; index >= 0; index--) {
            const shape = this.objects[index];
            if (shape.isHit(p) && !shape.isGrid)
                return this.do(new actions_1.GridAction(this, shape, x_units, y_units, color, p));
        }
    }
    translate(clickedPoint, newPoint) {
        //the transformation is only applied to one shape(the one in front)
        for (let index = this.objects.length - 1; index >= 0; index--) {
            const shape = this.objects[index];
            if (shape.isHit(clickedPoint))
                return this.do(new actions_1.TranslateAction(shape, newPoint, clickedPoint));
        }
    }
    rotate(clickedPoint, angled) {
        //the transformation is only applied to one shape(the one in front)
        for (let index = this.objects.length - 1; index >= 0; index--) {
            const shape = this.objects[index];
            if (shape.isHit(clickedPoint))
                return this.do(new actions_1.RotateAction(shape, angled, clickedPoint));
        }
    }
    scale(clickedPoint, scaled) {
        //the transformation is only applied to one shape(the one in front)
        for (let index = this.objects.length - 1; index >= 0; index--) {
            const shape = this.objects[index];
            if (shape.isHit(clickedPoint))
                return this.do(new actions_1.ScaleAction(shape, scaled, clickedPoint));
        }
    }
    getObjectsForRendering() {
        return this.layersManager.mapObjectsToLayers(this.objects);
    }
    getLayersForRendering() {
        return this.layersManager.getOrderedLayers();
    }
    registerRendererObserver(observer) {
        this.rendererObservers.push(observer);
    }
    registerLayersObserver(observer) {
        this.layerObservers.push(observer);
    }
    createLayer(layer) {
        this.layersManager.createLayer(layer);
        this.notifyLayersObservers();
    }
    setLayer(layer) {
        this.layersManager.setActiveLayer(layer);
        this.notifyLayersObservers();
    }
}
exports.SimpleDrawDocument = SimpleDrawDocument;

},{"./actions":8,"./layers":10,"./undo":12}],10:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class LayersManager {
    constructor() {
        this.layers = new Array();
        this.createLayer('default');
        this.setActiveLayer('default');
    }
    createLayer(layerName) {
        if (this.layers.indexOf(layerName) == -1)
            this.layers.unshift(layerName);
        this.setActiveLayer(layerName);
    }
    setActiveLayer(layerName) {
        console.log(layerName);
        if (this.layers.indexOf(layerName) != -1) {
            this.activeLayer = layerName;
            console.log("Setting active layer");
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
        let ret = this.layers.reverse();
        ret = ret.filter(o => o !== this.activeLayer);
        ret.push(this.activeLayer);
        return ret;
    }
}
exports.LayersManager = LayersManager;

},{}],11:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../controller/utils");
class Shape {
    constructor(center, color) {
        this.center = center;
        this.color = color;
        this.angle = 0;
        this.isGrid = false;
        this.children = new Array();
    }
    translate(point) {
        this.center = point;
    }
    rotate(angled) {
        if (angled < 0)
            angled = 360 + angled;
        this.angle = (this.angle + angled) % 360;
    }
}
exports.Shape = Shape;
class Rectangle extends Shape {
    constructor(center, width, height, color) {
        super(center, color);
        this.width = width;
        this.height = height;
    }
    accept(visitor) {
        return visitor.visitRectangle(this);
    }
    isHit(point) {
        const rectangleArea = this.width * this.height;
        const centerPoint = this.center;
        const pointA = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new utils_1.Point(centerPoint.x - this.width / 2, centerPoint.y - this.height / 2));
        const pointB = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new utils_1.Point(centerPoint.x - this.width / 2, centerPoint.y + this.height / 2));
        const pointC = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new utils_1.Point(centerPoint.x + this.width / 2, centerPoint.y + this.height / 2));
        const pointD = utils_1.Utils.getRotatedPoint(centerPoint, this.angle, new utils_1.Point(centerPoint.x + this.width / 2, centerPoint.y - this.height / 2));
        let trianglesArea = utils_1.Utils.getTriangleArea(pointA, pointB, point);
        trianglesArea += utils_1.Utils.getTriangleArea(pointB, pointC, point);
        trianglesArea += utils_1.Utils.getTriangleArea(pointC, pointD, point);
        trianglesArea += utils_1.Utils.getTriangleArea(pointD, pointA, point);
        return Math.abs(rectangleArea - trianglesArea) < 1;
    }
    scale(sx, sy) {
        let radAngle = (this.angle * Math.PI) / 180;
        let addWidth = (Math.abs(Math.cos(radAngle)) * (sx - 1)) * this.width + (Math.abs(Math.sin(radAngle)) * (sy - 1)) * this.width;
        let addHeight = (Math.abs(Math.cos(radAngle)) * (sy - 1)) * this.height + (Math.abs(Math.sin(radAngle)) * (sx - 1)) * this.height;
        this.width += addWidth;
        this.height += addHeight;
    }
    getWidthFromCenter() {
        return this.width / 2;
    }
    getHeightFromCenter() {
        return this.height / 2;
    }
    clone() {
        const s = new Rectangle(this.center, this.width, this.height, this.color);
        s.layer = this.layer;
        return s;
    }
}
exports.Rectangle = Rectangle;
class Circle extends Shape {
    constructor(center, radius, color) {
        super(center, color);
        this.radius = radius;
        this.rx = radius;
        this.ry = radius;
    }
    accept(visitor) {
        return visitor.visitCircle(this);
    }
    isHit(point) {
        return Math.hypot(point.x - this.center.x, point.y - this.center.y) < this.radius;
    }
    scale(sx, sy) {
        let radAngle = (this.angle * Math.PI) / 180;
        let addX = (Math.abs(Math.cos(radAngle)) * (sx - 1)) * this.rx + (Math.abs(Math.sin(radAngle)) * (sy - 1)) * this.rx;
        let addY = (Math.abs(Math.cos(radAngle)) * (sy - 1)) * this.ry + (Math.abs(Math.sin(radAngle)) * (sx - 1)) * this.ry;
        this.rx = addX + +this.rx;
        this.ry = addY + +this.ry;
    }
    getWidthFromCenter() {
        return this.rx;
    }
    getHeightFromCenter() {
        return this.ry;
    }
    clone() {
        const s = new Circle(this.center, this.radius, this.color);
        s.rx = this.rx;
        s.ry = this.ry;
        s.layer = this.layer;
        return s;
    }
}
exports.Circle = Circle;
class Triangle extends Shape {
    constructor(p0, p1, p2, color) {
        super(new utils_1.Point((p0.x + p1.x + p2.x) / 3.0, (p0.y + p1.y + p2.y) / 3.0), color);
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }
    accept(visitor) {
        return visitor.visitTriangle(this);
    }
    //Taken from here: https://stackoverflow.com/a/34093754
    isHit(p) {
        const p0 = utils_1.Utils.getRotatedPoint(this.center, this.angle, this.p0);
        const p1 = utils_1.Utils.getRotatedPoint(this.center, this.angle, this.p1);
        const p2 = utils_1.Utils.getRotatedPoint(this.center, this.angle, this.p2);
        const dX = p.x - p2.x;
        const dY = p.y - p2.y;
        const dX21 = p2.x - p1.x;
        const dY12 = p1.y - p2.y;
        const D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
        const s = dY12 * dX + dX21 * dY;
        const t = (p2.y - p0.y) * dX + (p0.x - p2.x) * dY;
        if (D < 0)
            return s <= 0 && t <= 0 && s + t >= D;
        return s >= 0 && t >= 0 && s + t <= D;
    }
    scale(sx, sy) {
        const p0 = utils_1.Utils.getRotatedPoint(this.center, this.angle, this.p0);
        const p1 = utils_1.Utils.getRotatedPoint(this.center, this.angle, this.p1);
        const p2 = utils_1.Utils.getRotatedPoint(this.center, this.angle, this.p2);
        let newp0 = new utils_1.Point(sx * (p0.x - this.center.x) + this.center.x, sy * (p0.y - this.center.y) + this.center.y);
        let newp1 = new utils_1.Point(sx * (p1.x - this.center.x) + this.center.x, sy * (p1.y - this.center.y) + this.center.y);
        let newp2 = new utils_1.Point(sx * (p2.x - this.center.x) + this.center.x, sy * (p2.y - this.center.y) + this.center.y);
        this.p0 = utils_1.Utils.getRotatedPoint(this.center, -this.angle, newp0);
        this.p1 = utils_1.Utils.getRotatedPoint(this.center, -this.angle, newp1);
        this.p2 = utils_1.Utils.getRotatedPoint(this.center, -this.angle, newp2);
    }
    translate(newPoint) {
        let delta = new utils_1.Point(newPoint.x - this.center.x, newPoint.y - this.center.y);
        this.p0 = new utils_1.Point(this.p0.x + delta.x, this.p0.y + delta.y);
        this.p1 = new utils_1.Point(this.p1.x + delta.x, this.p1.y + delta.y);
        this.p2 = new utils_1.Point(this.p2.x + delta.x, this.p2.y + delta.y);
        this.center = newPoint;
    }
    getWidthFromCenter() {
        let maxX = this.p0.x;
        if (this.p1.x > maxX)
            maxX = this.p1.x;
        if (this.p2.x > maxX)
            maxX = this.p2.x;
        return maxX - this.center.x;
    }
    getHeightFromCenter() {
        let maxY = this.p0.y;
        if (this.p1.y > maxY)
            maxY = this.p1.y;
        if (this.p2.y > maxY)
            maxY = this.p2.y;
        return maxY - this.center.y;
    }
    clone() {
        const s = new Triangle(this.p0, this.p1, this.p2, this.color);
        s.center = this.center;
        s.layer = this.layer;
        return s;
    }
}
exports.Triangle = Triangle;

},{"../controller/utils":6}],12:[function(require,module,exports){
'use strict';
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

},{}],13:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../controller/utils");
class Renderer {
    constructor(elementID) {
        this.elementID = elementID;
        this.GRID_STEP = 50;
        this.GRID_COLOR = '#BBBBBB';
        this.mode = 'Wireframe';
        this.zoom = 1.0;
        this.currObjects = new Map();
        this.currLayers = new Array();
        const modeElem = (document.getElementById(elementID + '_mode'));
        modeElem.addEventListener('change', () => {
            this.mode = modeElem.value;
            this.renderAgain();
        });
        const zoomElem = (document.getElementById(elementID + '_zoom'));
        zoomElem.addEventListener('change', () => {
            this.zoom = Number(zoomElem.value);
            this.renderAgain();
        });
    }
    render(objs, layers) {
        this.currObjects = objs;
        this.currLayers = layers;
        this.clearCanvas();
        this.init();
        this.applyZoom();
        this.drawGrid();
        this.drawObjects();
        this.finish();
    }
    renderAgain() {
        this.render(this.currObjects, this.currLayers);
    }
    mapToRenderer(point) {
        const dimensions = this.element.getBoundingClientRect();
        const x = dimensions.left;
        const y = dimensions.top;
        const width = x + dimensions.width;
        const height = y + dimensions.height;
        if (point.x < x || point.x > width || point.y < y || point.y > height)
            return new utils_1.NullPoint();
        const mapped = new utils_1.Point(point.x - x, point.y - y);
        mapped.x *= (1 / this.zoom);
        mapped.y *= (1 / this.zoom);
        return mapped;
    }
    getDimensions() {
        const width = this.element.getBoundingClientRect().width;
        const height = this.element.getBoundingClientRect().height;
        return [width, height];
    }
    drawGrid() {
        const width = this.getDimensions()[0] * (1 / this.zoom);
        const height = this.getDimensions()[1] * (1 / this.zoom);
        for (let i = 0; i < width; i += this.GRID_STEP)
            this.drawLine(i, 0, i, height);
        for (let i = 0; i < height; i += this.GRID_STEP)
            this.drawLine(0, i, width, i);
    }
    notify(document) {
        this.render(document.getObjectsForRendering(), document.getLayersForRendering());
    }
    resize() {
        const parent = this.element.parentElement;
        this.element.setAttribute('width', parent.clientWidth.toString());
        this.element.setAttribute('height', parent.clientHeight.toString());
        this.renderAgain();
    }
}
exports.Renderer = Renderer;

},{"../controller/utils":6}],14:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const shape_1 = require("../model/shape");
class CanvasRenderer extends renderer_1.Renderer {
    constructor(elementID) {
        super(elementID);
        this.factory = new CanvasShapeRendererFactory();
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
    drawObjects() {
        for (const layer of this.currLayers) {
            for (const shape of this.currObjects.get(layer)) {
                let renderableObject = this.factory.make(shape);
                this.ctx.save();
                this.ctx.beginPath();
                switch (this.mode) {
                    case 'Color':
                        renderableObject = new CanvasColorDecorator(renderableObject);
                        break;
                    case 'Gradient':
                        renderableObject = new CanvasGradientDecorator(renderableObject);
                        break;
                    case 'Wireframe':
                    case 'None':
                    default:
                        break;
                }
                renderableObject.render(this.ctx);
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }
    drawLine(x1, y1, x2, y2) {
        const defaultWidth = this.ctx.lineWidth;
        const defaultColor = this.ctx.strokeStyle;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.GRID_COLOR;
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
        this.ctx.resetTransform();
    }
    applyZoom() {
        this.ctx.scale(this.zoom, this.zoom);
    }
    finish() {
        this.ctx.restore();
    }
}
exports.CanvasRenderer = CanvasRenderer;
class CanvasShapeRenderer {
    constructor(shape) {
        this.shape = shape;
    }
}
class CanvasShapeRendererFactory {
    make(shape) {
        if (shape instanceof shape_1.Rectangle)
            return new CanvasRectangleRenderer(shape);
        if (shape instanceof shape_1.Circle)
            return new CanvasCircleRenderer(shape);
        if (shape instanceof shape_1.Triangle)
            return new CanvasTriangleRenderer(shape);
        else
            return new CanvasNullRenderer(shape);
    }
}
class CanvasNullRenderer extends CanvasShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render(ctx) {
        return;
    }
}
class CanvasRectangleRenderer extends CanvasShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render(ctx) {
        const shape = this.shape;
        ctx.translate(shape.center.x, shape.center.y);
        ctx.rotate((shape.angle * Math.PI) / 180);
        ctx.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
    }
}
class CanvasCircleRenderer extends CanvasShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render(ctx) {
        const shape = this.shape;
        ctx.ellipse(shape.center.x, shape.center.y, shape.rx, shape.ry, (shape.angle * Math.PI) / 180, 0, 2 * Math.PI);
    }
}
class CanvasTriangleRenderer extends CanvasShapeRenderer {
    constructor(shape) {
        super(shape);
    }
    render(ctx) {
        const shape = this.shape;
        ctx.translate(shape.center.x, shape.center.y);
        ctx.rotate((shape.angle * Math.PI) / 180);
        ctx.moveTo(shape.p0.x - shape.center.x, shape.p0.y - shape.center.y);
        ctx.lineTo(shape.p1.x - shape.center.x, shape.p1.y - shape.center.y);
        ctx.lineTo(shape.p2.x - shape.center.x, shape.p2.y - shape.center.y);
    }
}
class CanvasColorDecorator extends CanvasShapeRenderer {
    constructor(obj) {
        super(obj.shape);
        this.obj = obj;
    }
    render(ctx) {
        this.obj.render(ctx);
        ctx.fillStyle = this.shape.color;
        ctx.fill();
    }
}
class CanvasGradientDecorator extends CanvasShapeRenderer {
    constructor(obj) {
        super(obj.shape);
        this.obj = obj;
    }
    render(ctx) {
        this.obj.render(ctx);
        ctx.fillStyle = this.makeGradient(ctx);
        ctx.fill();
    }
    makeGradient(ctx) {
        const gradient = ctx.createLinearGradient(0, 100, 200, 100);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#FFFFFF');
        return gradient;
    }
}

},{"../model/shape":11,"./renderer":13}],15:[function(require,module,exports){
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
    drawObjects() {
        for (const layer of this.currLayers) {
            for (const shape of this.currObjects.get(layer)) {
                let renderableObject = this.factory.make(shape);
                switch (this.mode) {
                    case 'Color':
                        renderableObject = new SVGColorDecorator(renderableObject);
                        break;
                    case 'Wireframe':
                        renderableObject = new SVGWireframeDecorator(renderableObject);
                        break;
                    case 'Gradient':
                        renderableObject = new SVGGradientDecorator(renderableObject);
                        break;
                    case 'None':
                    default:
                        break;
                }
                const e = renderableObject.render();
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
        newLine.setAttribute('stroke', this.GRID_COLOR);
        this.element.appendChild(newLine);
    }
    clearCanvas() {
        this.element.innerHTML = '';
    }
    init() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = (document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient'));
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#000000');
        stop1.setAttribute('stop-opacity', '1');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#FFFFFF');
        stop2.setAttribute('stop-opacity', '1');
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        gradient.setAttribute('id', 'linear');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '50%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '50%');
        defs.appendChild(gradient);
        this.element.appendChild(defs);
    }
    applyZoom() {
        const zoomX = Number(this.element.getAttribute("width")) * (1 / this.zoom);
        const zoomY = Number(this.element.getAttribute("height")) * (1 / this.zoom);
        const viewBox = "0 0 " + zoomX + " " + zoomY;
        this.element.setAttribute("viewBox", viewBox);
    }
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
        if (shape instanceof shape_1.Triangle)
            return new SVGTriangleRenderer(shape);
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
        let e = this.obj.render();
        if (e.tagName == 'g') {
            let realElement = e.firstElementChild;
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`);
            realElement.setAttribute('fill-opacity', '0.0');
        }
        else {
            e.setAttribute('style', `stroke: black; fill: #FFFFFF`);
            e.setAttribute('fill-opacity', '0.0');
        }
        return e;
    }
}
class SVGGradientDecorator extends SVGShapeRenderer {
    constructor(obj) {
        super(obj.shape);
        this.obj = obj;
    }
    render() {
        let e = this.obj.render();
        if (e.tagName == 'g') {
            let realElement = e.firstElementChild;
            realElement.setAttribute('style', `stroke: black; fill: url(#linear)`);
            e.setAttribute('fill-opacity', '1.0');
        }
        else {
            e.setAttribute('style', `stroke: black; fill: url(#linear)`);
            e.setAttribute('fill-opacity', '1.0');
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
        g.setAttribute('transform', `translate(${shape.center.x}, ${shape.center.y}) rotate(${shape.angle})`);
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
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const shape = this.shape;
        g.setAttribute('transform', `translate(${shape.center.x}, ${shape.center.y}) rotate(${shape.angle})`);
        e.setAttribute('cx', '0');
        e.setAttribute('cy', '0');
        e.setAttribute('rx', shape.rx.toString());
        e.setAttribute('ry', shape.ry.toString());
        g.appendChild(e);
        return g;
    }
}
class SVGTriangleRenderer extends SVGShapeRenderer {
    render() {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const shape = this.shape;
        g.setAttribute('transform', `translate(${shape.center.x}, ${shape.center.y}) rotate(${shape.angle})`);
        e.setAttribute('points', (shape.p0.x - shape.center.x) +
            ',' +
            (shape.p0.y - shape.center.y) +
            ' ' +
            (shape.p1.x - shape.center.x) +
            ',' +
            (shape.p1.y - shape.center.y) +
            ' ' +
            (shape.p2.x - shape.center.x) +
            ',' +
            (shape.p2.y - shape.center.y));
        g.appendChild(e);
        return g;
    }
}

},{"../model/shape":11,"./renderer":13}],16:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("../model/document");
const interpreter_1 = require("../controller/interpreter");
const simpledraw_api_1 = require("../controller/simpledraw_api");
const click_controller_1 = require("../controller/click_controller");
const converter_1 = require("../controller/converter");
const utils_1 = require("../controller/utils");
const loadXML_1 = require("../controller/loadXML");
class SimpleDrawView {
    constructor() {
        this.renderers = new Array();
        this.document = new document_1.SimpleDrawDocument();
        this.api = new simpledraw_api_1.SimpleDrawAPI(this.document);
        this.interpreter = new interpreter_1.Interpreter(this.api);
        this.click_controller = new click_controller_1.ClickController(this.api);
        this.document.registerLayersObserver(this);
        document.getElementById('repl').addEventListener('submit', (e) => {
            e.preventDefault();
            const replPrompt = document.querySelector('#prompt');
            const replRes = document.querySelector('#res');
            const command = replPrompt.value;
            if (command == null)
                return;
            const success = this.interpreter.eval(command);
            replRes.innerHTML = success ? '&nbsp;✔️' : '&nbsp;❌';
        });
        document.getElementById('circle').addEventListener('click', (e) => {
            e.preventDefault();
            this.click_controller.processEvent(new UserEventAction(Action.CREATE_CIRCLE));
        });
        document.getElementById('square').addEventListener('click', (e) => {
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
            const x_units = Number(document.getElementById('x_units').value);
            const y_units = Number(document.getElementById('y_units').value);
            const isPositiveInt = (str) => {
                const n = Math.floor(Number(str));
                return n !== Infinity && n === str && n > 0;
            };
            if (isPositiveInt(x_units) && isPositiveInt(y_units)) {
                this.click_controller.processEvent(new UserEventAction(Action.GRID, { x_units: x_units, y_units: y_units }));
            }
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
        });
        document.getElementById('file').addEventListener('change', (e) => {
            //Taken from here https://stackoverflow.com/questions/23331546/how-to-use-javascript-to-read-local-text-file-and-read-line-by-line
            const file = e.target.files[0];
            const reader = new FileReader();
            console.log(file);
            reader.onload = event => {
                const extention = file.name.split('.').pop();
                if (extention === 'txt') {
                    const fileResult = reader.result;
                    const allLines = fileResult.split('\r\n');
                    // Reading line by line and executing each action
                    allLines.forEach(line => {
                        this.interpreter.eval(line);
                    });
                }
                else if (extention === 'xml') {
                    const fileResult = reader.result;
                    var oParser = new DOMParser();
                    var oDOM = oParser.parseFromString(fileResult, 'application/xml');
                    let load = new loadXML_1.loadXML(oDOM.documentElement, this.api);
                    load.load();
                    // print the name of the root element or error message
                    console.log(oDOM.documentElement.nodeName == 'parsererror'
                        ? 'error while parsing'
                        : oDOM.documentElement.children);
                }
            };
            reader.onerror = event => {
                alert(e.target.name);
            };
            reader.readAsText(file);
        });
        document.getElementById('addLayerButton').addEventListener('click', (e) => {
            e.preventDefault();
            const elem = document.getElementById('addLayerInput');
            const layerName = elem.value;
            elem.value = '';
            if (layerName != null && layerName.length < 2)
                return;
            this.click_controller.processEvent(new UserEventAction(Action.ADD_LAYER, { layer: layerName }));
        });
        document.getElementById('layers').addEventListener('change', () => {
            let layer = document.getElementById('layers').value;
            layer = layer.replace(/\d\.\ /, '');
            this.click_controller.processEvent(new UserEventAction(Action.SET_LAYER, { layer: layer }));
        });
        document.body.addEventListener('mousedown', (e) => {
            let screenClick = new utils_1.Point(e.pageX, e.pageY);
            let renderCoord = this.mapScreenspaceToRenderspace(screenClick);
            if (!renderCoord.isNil())
                this.click_controller.processEvent(new UserEventPoint(renderCoord));
        }, true);
        window.addEventListener('resize', () => {
            for (const renderer of this.renderers)
                renderer.resize();
        });
    }
    addRenderer(renderer) {
        this.renderers.push(renderer);
        this.document.registerRendererObserver(renderer);
        renderer.drawGrid();
    }
    mapScreenspaceToRenderspace(point) {
        let res = new utils_1.NullPoint();
        for (const renderer of this.renderers) {
            res = renderer.mapToRenderer(point);
            if (!res.isNil())
                break;
        }
        return res;
    }
    notify(layers) {
        layers = layers.reverse();
        const select = document.getElementById('layers');
        select.options.length = 0;
        for (let i = 0; i < layers.length; i++) {
            const option = document.createElement('option');
            option.text = i + 1 + '. ' + layers[i];
            select.add(option);
            if (i == 0)
                select.value = option.text;
        }
    }
}
exports.SimpleDrawView = SimpleDrawView;
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
    Action[Action["ADD_LAYER"] = 9] = "ADD_LAYER";
    Action[Action["SET_LAYER"] = 10] = "SET_LAYER";
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

},{"../controller/click_controller":1,"../controller/converter":2,"../controller/interpreter":3,"../controller/loadXML":4,"../controller/simpledraw_api":5,"../controller/utils":6,"../model/document":9}]},{},[7]);
