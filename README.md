# SimpleDraw

SimpleDraw is a browser-only drawing tool written in TypeScript

ASSO / FEUP 2018/2019

[**Try it here**](https://tiagolascasas.github.io/FEUP-ASSO/)

## Team Members

*  Catarina Ferreira - up201506671@fe.up.pt
*  Tiago Neves - up201506203@fe.up.pt
*  Tiago Santos - up201503616@fe.up.pt

## Implementation Details

Here are the descriptions of how we implemented some of the features and components, including the relevant design and architectural patterns

### Overall architecture

We have refactored the original project into a clear [**Model-View-Controller**](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) architecture. These three components do the following:

*  **Model** - most of the code of the original project ended up here. It represents the concept of a document, its objects and the actions performed over them.
*  **View** - contains the GUI and the renderers. Collects user input in the form of events. Reads the model in order to render.
*  **Controller** - processes the events generated on the GUI, be them clicks or commands inserted into the REPL, and triggers the appropriate changes on the model based on those events.

### REPL

We implemented the REPL using the [**Interpeter Pattern**](https://en.wikipedia.org/wiki/Interpreter_pattern), and whose grammar can be found
on the implementation file. We tokenized the input string and put it on a data structure with an implementation of the [**Iterator Pattern**](https://en.wikipedia.org/wiki/Iterator_pattern).

### User input through the GUI

The user input depends on a series of different events: clicking on buttons and on the canvas. Some tools require pressing a button first and then one click on the canvas,
while others may require three clicks on the canvas, for example. To implement this, we used the [**State Pattern**](https://en.wikipedia.org/wiki/State_pattern), which handles all sequences of events until a valid action can be performed, and resets the state machine when an invalid sequence is done.

### Multiple interaction modes

Since inputs can come from different sources (GUI or REPL), and since the API provided by the original SimpleDraw implementation was not compatible with that approach, we decided to abstract it using the [**Façade Pattern**](https://en.wikipedia.org/wiki/Facade_pattern), which provides a new API to interact with the SimpleDraw model. This new API simply receives actions that can come from whatever sources, converts them and executes the right calls on SimpleDraw. These actions are indexed on an hash table using an enumeration, and their individual details are abstracted through the [**Strategy Pattern**](https://en.wikipedia.org/wiki/Strategy_pattern). Thus, adding a new action is as simple as creating a new implementation of the ```executeAction``` method, add an identifier to the enum and index it on the hash table inside the façade.

### Rendering

An arbitrary number of renderers are supported and the rendering of the model is triggered using the [**Observer Pattern**](https://en.wikipedia.org/wiki/Observer_pattern). Upon a change in the model (eg. new object inserted), the model notifies all renderers that its state has changed, and then the rendering is performed.
