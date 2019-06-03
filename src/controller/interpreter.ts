'use strict'

import { SimpleDrawAPI } from './simpledraw_api';

/*
REPL Grammar:

Start :=  <add> AddExpr 
        | <translate> TranslateExpr
        | <rotate> RotateExpr
        | <scale> ScaleExpr
        | <grid> GridExpr
AddExpr := <square> SquareExpr
        |  <circle> CircleExpr 
        |  <triangle> TriangleExpr
SquareExpr := <number> <number> <number> <number> <color>
CircleExpr := <number> <number> <color>
TriangleExpr := <number> <number> <number> <number> <number> <number> <color>
TranslateExpr := <number> <number> <number> <number>

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
}

interface Expression {
    interpret(context: Context): boolean
}

abstract class TerminalExpression implements Expression {
    interpret(context: Context): boolean {
        return false
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
            const regex = new RegExp('^[0-9]+$')
            return regex.test(token)
        } else return false
    }
}

class MoveExpression implements Expression {
    interpret(context: Context): boolean {
        let termExp = new TerminalNumberExpression()
        return (
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context) &&
            termExp.interpret(context)
        )
    }
}

class TriangleExpression implements Expression {
    interpret(context: Context): boolean {
        let termNumberExp = new TerminalNumberExpression()
        let termColorExp = new TerminalColorExpression()
        return (
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)
        )
    }
}

class CircleExpression implements Expression {
    interpret(context: Context): boolean {
        let termNumberExp = new TerminalNumberExpression()
        let termColorExp = new TerminalColorExpression()
        return (
            termNumberExp.interpret(context) &&
            termNumberExp.interpret(context) &&
            termColorExp.interpret(context)
        )
    }
}

class SquareExpression implements Expression {
    interpret(context: Context): boolean {
        let termNumberExp = new TerminalNumberExpression()
        let termColorExp = new TerminalColorExpression()
        if (!termNumberExp.interpret(context))
            return false
        if (!termNumberExp.interpret(context))
            return false
        if (!termNumberExp.interpret(context))
            return false
        if (!termNumberExp.interpret(context))
            return false
        if (!termColorExp.interpret(context))
            return false
        return true
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
        let termTokenExpAdd = new TerminalTokenExpression('add')
        let expAdd = new AddExpression()
        let newContext = context.clone()
        if (termTokenExpAdd.interpret(newContext) && expAdd.interpret(newContext)) return true

        let termTokenExpMove = new TerminalTokenExpression('move')
        let expMove = new MoveExpression()
        newContext = context.clone()
        if (termTokenExpMove.interpret(newContext) && expMove.interpret(newContext)) return true

        return false
    }
}

export class Interpreter {
    constructor(private api: SimpleDrawAPI) { }

    eval(sentence: string): boolean {
        let ctx = new Context(sentence, this.api)
        let startExpr = new StartExpression()
        return startExpr.interpret(ctx)
    }
}
