'use strict'

import { SimpleDrawDocument } from './document'

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

export class REPL {
    index: number = 0

    constructor(private sdd: SimpleDrawDocument, private res: HTMLLabelElement) {}

    eval(text: string): boolean {
        this.index = 0
        const tokens = text.split(' ')

        if (tokens[this.index] === 'add') {
            this.index++
            return this.addExpr(tokens)
        }
        if (tokens[this.index] === 'move') {
            this.index++
            return this.moveExpr(tokens)
        }
        this.print('Unable to parse action', false)
        return false
    }

    print(text: string, success: boolean): void {
        if (this.res != null) {
            this.res.classList.add(success ? 'text-success' : 'text-danger')
            this.res.innerHTML = text
        }
    }

    isNumber(token: string): boolean {
        return !isNaN(Number(token)) || parseInt(token) > 0
    }

    isColor(token: string): boolean {
        const regex = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$')
        return regex.test(token)
    }

    addExpr(tokens: Array<string>): boolean {
        if (tokens[this.index] === 'square') {
            this.index++
            return this.squareExpr(tokens)
        }
        if (tokens[this.index] === 'circle') {
            this.index++
            return this.circleExpr(tokens)
        }
        if (tokens[this.index] === 'triangle') {
            this.index++
            return this.triangleExpr(tokens)
        }
        return false
    }

    moveExpr(tokens: Array<string>): boolean {
        for (let i = 0; i < 4; i++) {
            if (!this.isNumber(tokens[this.index])) return false
            else this.index++
        }
        this.print('Move executed', true)
        return true
    }

    squareExpr(tokens: Array<string>): boolean {
        for (let i = 0; i < 4; i++) {
            if (!this.isNumber(tokens[this.index])) return false
            else this.index++
        }
        if (!this.isColor(tokens[this.index])) return false
        this.sdd.createRectangle(
            Number(tokens[2]),
            Number(tokens[3]),
            Number(tokens[4]),
            Number(tokens[5]),
            tokens[6]
        )
        this.print('Square added', true)
        return true
    }

    circleExpr(tokens: Array<string>): boolean {
        for (let i = 0; i < 2; i++) {
            if (!this.isNumber(tokens[this.index])) return false
            else this.index++
        }
        if (!this.isColor(tokens[this.index])) return false
        this.print('Circle added', true)
        return true
    }

    triangleExpr(tokens: Array<string>): boolean {
        for (let i = 0; i < 6; i++) {
            if (!this.isNumber(tokens[this.index])) return false
            else this.index++
        }
        if (!this.isColor(tokens[this.index])) return false
        //this.sdd.createTriangle
        this.print('Triangle added', true)
        return true
    }
}
