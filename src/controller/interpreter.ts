'use strict'

import { SimpleDrawAPI } from './simpledraw_api'
import { Action } from '../view/simpledraw_view'
import { Point } from './utils'

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
    private tokens: Array<string>
    public index: number = 0

    constructor(private sentence: string, public api: SimpleDrawAPI) {
        this.tokens = sentence.split(' ')
    }

    hasNext(): boolean {
        return this.index < this.tokens.length
    }

    next(): string {
        let current = this.tokens[this.index]
        this.index++
        return current
    }

    clone(): Context {
        let newContext = new Context(this.sentence, this.api)
        newContext.index = this.index
        return newContext
    }

    get(i: number): string {
        return this.tokens[i]
    }
}

interface Expression {
    interpret(context: Context): boolean
}

abstract class TerminalExpression implements Expression {
    interpret(context: Context): boolean {
        return false
    }
}

class EmptyExpression extends TerminalExpression {
    interpret(context: Context): boolean {
        return context.hasNext() == false
    }
}

class TerminalTokenExpression extends TerminalExpression {
    constructor(private token: string) {
        super()
    }

    interpret(context: Context): boolean {
        if (context.hasNext()) return context.next() == this.token
        else return false
    }
}

class TerminalColorExpression extends TerminalExpression {
    constructor() {
        super()
    }

    interpret(context: Context): boolean {
        if (context.hasNext()) {
            let token = context.next()
            const regex = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$')
            return regex.test(token)
        } else return false
    }
}

class TerminalNumberExpression extends TerminalExpression {
    constructor() {
        super()
    }

    interpret(context: Context): boolean {
        if (context.hasNext()) {
            let token = context.next()
            const regex = new RegExp('^[0-9]+\.?[0-9]*$')
            return regex.test(token)
        } else return false
    }
}

class GridExpression implements Expression {
    interpret(context: Context): boolean {
        let termExp = new TerminalNumberExpression()
        if (
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(3)), Number(context.get(4)))
            let horizontal_units = context.get(1)
            let vertical_units = context.get(2)
            context.api.execute(
                Action.GRID,
                { x_units: horizontal_units, y_units: vertical_units },
                [p1]
            )
            return true
        } else return false
    }
}

class ScaleExpression implements Expression {
    interpret(context: Context): boolean {
        let termExp = new TerminalNumberExpression()
        if (
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(3)), Number(context.get(4)))
            let sx = context.get(1)
            let sy = context.get(2)
            context.api.execute(Action.SCALE, { sx: sx, sy: sy }, [p1])
            return true
        } else return false
    }
}

class RotateExpression implements Expression {
    interpret(context: Context): boolean {
        let termExp = new TerminalNumberExpression()
        if (
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(2)), Number(context.get(3)))
            let angle = context.get(1)
            context.api.execute(Action.ROTATE, { angle: angle }, [p1])
            return true
        } else return false
    }
}

class TranslateExpression implements Expression {
    interpret(context: Context): boolean {
        let termExp = new TerminalNumberExpression()
        if (
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(1)), Number(context.get(2)))
            let p2 = new Point(Number(context.get(3)), Number(context.get(4)))
            context.api.execute(Action.TRANSLATE, {}, [p1, p2])
            return true
        } else return false
    }
}

class TriangleExpression implements Expression {
    interpret(context: Context): boolean {
        let termNumberExp = new TerminalNumberExpression()
        let termColorExp = new TerminalColorExpression()
        if (
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(2)), Number(context.get(3)))
            let p2 = new Point(Number(context.get(4)), Number(context.get(5)))
            let p3 = new Point(Number(context.get(6)), Number(context.get(7)))
            context.api.execute(Action.CREATE_TRIANGLE, {}, [p1, p2, p3])
            return true
        } else return false
    }
}

class CircleExpression implements Expression {
    interpret(context: Context): boolean {
        let termNumberExp = new TerminalNumberExpression()
        let termColorExp = new TerminalColorExpression()
        if (
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(2)), Number(context.get(3)))
            let radius = context.get(4)
            context.api.execute(Action.CREATE_CIRCLE, { radius: radius }, [p1])
            return true
        } else return false
    }
}

class SquareExpression implements Expression {
    interpret(context: Context): boolean {
        let termNumberExp = new TerminalNumberExpression()
        let termColorExp = new TerminalColorExpression()
        if (
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)
        ) {
            let p1 = new Point(Number(context.get(2)), Number(context.get(3)))
            let p2 = new Point(Number(context.get(4)), Number(context.get(5)))
            context.api.execute(Action.CREATE_SQUARE, {}, [p1, p2])
            return true
        } else return false
    }
}

class AddExpression implements Expression {
    interpret(context: Context): boolean {
        let termTokenExpSq = new TerminalTokenExpression('square')
        let expSq = new SquareExpression()
        let newContext = context.clone()
        if (termTokenExpSq.interpret(newContext) && expSq.interpret(newContext)) return true

        let termTokenExpCi = new TerminalTokenExpression('circle')
        let expCi = new CircleExpression()
        newContext = context.clone()
        if (termTokenExpCi.interpret(newContext) && expCi.interpret(newContext)) return true

        let termTokenExpTri = new TerminalTokenExpression('triangle')
        let expTri = new TriangleExpression()
        newContext = context.clone()
        if (termTokenExpTri.interpret(newContext) && expTri.interpret(newContext)) return true

        return false
    }
}

class StartExpression implements Expression {
    interpret(context: Context): boolean {
        //Add expr
        let termTokenExpAdd = new TerminalTokenExpression('add')
        let expAdd = new AddExpression()
        let newContext = context.clone()
        if (termTokenExpAdd.interpret(newContext) && expAdd.interpret(newContext)) return true

        //Translate expr
        let termTokenExpMove = new TerminalTokenExpression('translate')
        let expMove = new TranslateExpression()
        newContext = context.clone()
        if (termTokenExpMove.interpret(newContext) && expMove.interpret(newContext)) return true

        //Scale expr
        let termTokenExpScale = new TerminalTokenExpression('scale')
        let expScale = new ScaleExpression()
        newContext = context.clone()
        if (termTokenExpScale.interpret(newContext) && expScale.interpret(newContext)) return true

        //Rotate expr
        let termTokenExpRotate = new TerminalTokenExpression('rotate')
        let expRotate = new RotateExpression()
        newContext = context.clone()
        if (termTokenExpRotate.interpret(newContext) && expRotate.interpret(newContext)) return true

        //Grid expr
        let termTokenExpGrid = new TerminalTokenExpression('grid')
        let expGrid = new GridExpression()
        newContext = context.clone()
        if (termTokenExpGrid.interpret(newContext) && expGrid.interpret(newContext)) return true

        //Undo
        let termTokenUndo = new TerminalTokenExpression('undo')
        newContext = context.clone()
        if (termTokenUndo.interpret(newContext)) {
            context.api.execute(Action.UNDO, {}, [])
            return true
        }

        //Redo
        let termTokenRedo = new TerminalTokenExpression('redo')
        newContext = context.clone()
        if (termTokenRedo.interpret(newContext)) {
            context.api.execute(Action.REDO, {}, [])
            return true
        }

        return false
    }
}

export class Interpreter {
    constructor(private api: SimpleDrawAPI) {}

    eval(sentence: string): boolean {
        let ctx = new Context(sentence, this.api)
        let startExpr = new StartExpression()
        return startExpr.interpret(ctx)
    }
}
