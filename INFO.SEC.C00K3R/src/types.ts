import {Data} from "./data"

export interface SourceType
{
     readData(resource: string) : Data
}

export interface TaskType
{
    applyTransformation(data: Data) : Data
}

export interface SinkType
{
    exportData(data: Data) : any    
}