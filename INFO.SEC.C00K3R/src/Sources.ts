import {SourceType} from "./types"
import { Data } from "data";

export class FromFile implements SourceType
{
    constructor(public resource: string){}

    readData(resource: string): import("./data").Data {
        return new Data()
    }
}

export class FromURL implements SourceType
{
    readData(resource: string): import("./data").Data {
        return new Data()
    }
}