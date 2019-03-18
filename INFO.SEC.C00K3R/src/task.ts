import {TaskType, SinkType, SourceType} from "./types"

export abstract class GenericTask
{
    constructor(public id: string){}
}

export class Task extends GenericTask
{
    constructor(public id: string, public type: TaskType){
        super(id)
    }
}

export class Sink extends GenericTask
{
    constructor(public id: string, public type: SinkType){
        super(id)
    }
}

export class Source extends GenericTask
{
    constructor(public id: string, public type: SourceType){
        super(id)
    }
}