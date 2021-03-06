# SimpleDraw

SimpleDraw is a browser-only drawing tool written in TypeScript

ASSO / FEUP 2018/2019

[**Try it here**](https://tiagolascasas.github.io/FEUP-ASSO/)

## Team Members

*  Catarina Ferreira - up201506671@fe.up.pt
*  Tiago Neves - up201506203@fe.up.pt
*  Tiago Santos - up201503616@fe.up.pt

## Functionalities

*  Multiple SVG and HTMLCanvas renderers
*  Persistence in multiple formats, with save/load operations
*  Different objects (rectangles, circles and triangles)
*  Different tools (translate, scale, rotate, grid)
*  Layers
*  4 different viewports (2 of each renderer type), with 3 levels of zoom
*  3 different viewport styles (wireframe, color and gradient)
*  Interaction through a point-n-click GUI and through a REPL
*  Unlimited undo/redo operations


## Implementation Details

Here are the descriptions of how we implemented some of the features and components, including the relevant design and architectural patterns. We will not discuss the ones already discussed in class, such as the Command Pattern used for the undo/redo operations

### Overall architecture

We have refactored the original project into a clear [**Model-View-Controller**](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) architecture. These three components do the following:

*  **Model** - most of the code of the original project ended up here. It represents the concept of a document, its objects and the actions performed over them.
*  **View** - contains the GUI and the renderers. Collects user input in the form of events. Reads the model in order to render.
*  **Controller** - processes the events generated on the GUI, be them clicks or commands inserted into the REPL, and triggers the appropriate changes on the model based on those events.

### REPL

We implemented the REPL using the [**Interpreter Pattern**](https://en.wikipedia.org/wiki/Interpreter_pattern), and whose grammar can be found
on the implementation file. We tokenized the input string and put it on a data structure with an implementation of the [**Iterator Pattern**](https://en.wikipedia.org/wiki/Iterator_pattern).

### User input through the GUI

The user input depends on a series of different events: clicking on buttons and on the canvas. Some tools require pressing a button first and then one click on the canvas,
while others may require three clicks on the canvas, for example. To implement this, we used the [**State Pattern**](https://en.wikipedia.org/wiki/State_pattern), which handles all sequences of events until a valid action can be performed, and resets the state machine when an invalid sequence is done.

### Abstracting the interaction mode

Since inputs can come from different sources (GUI or REPL), and since the API provided by the original SimpleDraw implementation was not compatible with that approach, we decided to abstract it using the [**Façade Pattern**](https://en.wikipedia.org/wiki/Facade_pattern), which provides a new API to interact with the SimpleDraw model. This new API simply receives actions that can come from whatever sources, converts them and executes the right calls on SimpleDraw. These actions are indexed on an hash table using an enumeration, and their individual details are abstracted through the [**Strategy Pattern**](https://en.wikipedia.org/wiki/Strategy_pattern). Thus, adding a new action is as simple as creating a new implementation of the ```executeAction``` method, add an identifier to the enum and index it on the hash table inside the façade.

### Rendering

An arbitrary number of renderers are supported and the rendering of the model is triggered using the [**Observer Pattern**](https://en.wikipedia.org/wiki/Observer_pattern). Upon a change in the model (eg. new object created), the model notifies all renderers that its state has changed, and then the rendering is performed.

The rendering algorithms were implemented using the [**Template Method Pattern**](https://en.wikipedia.org/wiki/Template_method_pattern). The general algorithm for rendering is always the same - run any initialization procedures, set the zoom level, draw the background grid, draw all objects and then finalize. However, each of these stages depend on the rendering engine being used, and as such have to be implemented on a renderer-by-renderer basis.

Since each shape is rendered in a different way, we implemented a class for each shape type that renders it (one class per renderer type, so technically there is a SVGShapeRenderer and a CanvasShapeRenderer for each shape). In order to build each rendering object, we used the [**Factory Method Pattern**](https://sourcemaking.com/design_patterns/factory_method), which, given any shape, creates the right renderer. We used the [**Null Object Pattern**](https://en.wikipedia.org/wiki/Null_object_pattern) inside the Factory in order to return something when it gets an unrecognized shape type as input.

The Wireframe, Color and Gradient modes also integrate into this logic. All rendering objects, by default, render the shape in all black, but in order to alter this behaviour we used the [**Decorator Pattern**](https://sourcemaking.com/design_patterns/decorator). If the Wireframe, Color or Gradient mode are on, the renderer decorates all its rendering objects with the new behaviours, and renders them accordingly. This is a change that requires the model to be rendered again, but since nothing changed on the model the view does not get notified that it should render again. Instead, the view holds references to all the objects it rendered last time, and re-renders them again with the appropriate decorators.

### Save

We can save our work by saving all the actions that were made to the document in two distinct ways: a .txt file and a .xml file.
These two ways of saving the document were implemented using the Strategy Pattern and the Visitor Pattern.

The [**Strategy Pattern**](https://en.wikipedia.org/wiki/Strategy_pattern) is used to define and make the saving operation interchangable between different saving methods, in this case the txt and the xml.

The [**Visitor Pattern**](https://en.wikipedia.org/wiki/Visitor_pattern) is used to define a saving operation for all the actions without having the code that represents the saving method directly explicit in the actions.

### Grid operation

The grid operation allows for the replication in both dimensions of an object. The original object becomes the pivot, and every operation applied to the pivot is also applied to all its replicas. However, an operation on a replica has no influence on the other replicas or the pivot. To achieve this, we used the [**Composite Pattern**](https://en.wikipedia.org/wiki/Composite_pattern), which allows for all the operations that were applied to the pivot to be applied to all other objects as well.

To better visualize this, the pivot keeps its original color, while the replicas are set to red.
