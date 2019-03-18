import {TaskType} from "./types"
import {Data} from "./data"

export class Zip implements TaskType
{
    applyTransformation(data: Data): Data {
        return new Data()
    }

}

export class MD5 implements TaskType
{
    applyTransformation(data: Data): Data {
        return new Data()
    }

}