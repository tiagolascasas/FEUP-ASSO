'use strict'

import { UserEvent, UserEventAction, Action, UserEventPoint, Point } from '../view/simpledraw_view'
import { SimpleDrawAPI } from './simpledraw_api'

export class ClickController {
    public currState = new IdleState()

    constructor(public api: SimpleDrawAPI) {}

    processEvent(event: UserEvent): void {
        this.currState.processEvent(this, event)
    }
}

export interface State {
    processEvent(context: ClickController, event: UserEvent): void
}

export class IdleState implements State {
    processEvent(context: ClickController, event: UserEvent): void {
        if (event instanceof UserEventAction) context.currState = new ActionPressedState(event)
    }
}

export class ActionPressedState implements State {
    constructor(public event: UserEventAction) {}

    processEvent(context: ClickController, event: UserEvent): void {
        if (event instanceof UserEventPoint) {
            if (this.event.action != Action.TRANSLATE) {
                context.api.execute(this.event.action, this.event.args, [event.point])
                context.currState = new IdleState()
            } else context.currState = new FirstPointClickedState(this.event, event.point)
        } else context.currState = new IdleState()
    }
}

export class FirstPointClickedState implements State {
    constructor(public event: UserEventAction, public point1: Point) {}

    processEvent(context: ClickController, event: Event): void {
               
        if (event instanceof UserEventPoint) {
            console.log("first point clicked");
            console.log(event);
            
            context.api.execute(this.event.action, this.event.args, [this.point1, event.point])
        }
        context.currState = new IdleState()
    }
}
