'use strict'

import { UserEvent, UserEventAction, Action, UserEventPoint, Point } from '../view/simpledraw_view'
import { Executor } from './executor';

export class ClickController {
    public currState = new IdleState()

    constructor(public executor: Executor) {}

    processEvent(event: UserEvent): void {
        this.currState.processEvent(this, event)
    }
}

export interface State {
    processEvent(context: ClickController, event: UserEvent): void
}

export class IdleState implements State {
    processEvent(context: ClickController, event: UserEvent): void {
        if (event instanceof UserEventAction)
            context.currState = new ActionPressedState(event.action)
    }
}

export class ActionPressedState implements State {
    constructor(public action: Action) {}

    processEvent(context: ClickController, event: UserEvent): void {
        if (event instanceof UserEventPoint) {
            if (this.action != Action.TRANSLATE) {
                //EXECUTE
                //...
                context.currState = new IdleState()
            } else context.currState = new FirstPointClickedState(this.action, event.point)
        } else context.currState = new IdleState()
    }
}

export class FirstPointClickedState implements State {
    constructor(public action: Action, public point1: Point) {}

    processEvent(context: ClickController, event: Event): void {
        if (event instanceof UserEventPoint) {
            //EXECUTE
            //...
        }
        context.currState = new IdleState()
    }
}
