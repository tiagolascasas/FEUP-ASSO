import { Shape } from "./shape"
import { Page } from "./page";

export function selectedShape(shape: Shape, page: Page){
    console.log(shape);
    shape.color = "#FF0000"
    page.render()
}
