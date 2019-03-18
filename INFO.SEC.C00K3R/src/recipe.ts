import {Task, Sink, Source, GenericTask} from "./task"
import {TaskType, SinkType, SourceType} from "./types"

export class Recipe
{
    sources = new Array<Source>()
    tasks = new Array<Task>()
    sinks = new Array<Sink>()
    connections = new Array<Connection>()

    public addSource(id: string, sourceType: SourceType)
    {
        this.sources.push(new Source(id, sourceType))
    }

    public addTask(id: string, taskType: TaskType)
    {
        this.tasks.push(new Task(id, taskType))
    }

    public addSink(id: string, sinkType: SinkType)
    {
        this.sinks.push(new Sink(id, sinkType))
    }

    public connectTasks(t1: string, t2: string)
    {
        let gt1 : GenericTask
        let gt2 : GenericTask

        for (const iterator of this.sources) {
            if (iterator.id == t1)
                gt1 = iterator
            if (iterator.id == t2)
                gt2 = iterator
        }
        for (const iterator of this.tasks) {
            if (iterator.id == t1)
                gt1 = iterator
            if (iterator.id == t2)
                gt2 = iterator
        }
        for (const iterator of this.sinks) {
            if (iterator.id == t1)
                gt1 = iterator
            if (iterator.id == t2)
                gt2 = iterator
        }
        this.connections.push(new Connection(gt1, gt2))
    }

    public run()
    {

    }
}

class Connection
{
    constructor(public t1: GenericTask, public t2: GenericTask){}
}