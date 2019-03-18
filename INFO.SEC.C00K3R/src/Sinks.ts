import {SinkType} from "./types"

export class ToFile implements SinkType
{
    exportData(data: import("./data").Data) {
        throw new Error("Method not implemented.");
    }

}

export class ToWebsocket implements SinkType
{
    exportData(data: import("./data").Data) {
        throw new Error("Method not implemented.");
    }

}