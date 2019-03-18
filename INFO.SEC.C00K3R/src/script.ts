import { Recipe } from './recipe'
import {ToFile, ToWebsocket} from "./Sinks"
import {FromFile, FromURL} from "./Sources"
import {Zip, MD5} from "./Tasks"

const r = new Recipe()

r.addSource("s1", new FromFile("data"))
r.addTask("t1", new Zip())
r.connectTasks("s1", "t1")
r.run()