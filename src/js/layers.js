
/*--------------------------------CONSTANTS-------------------------------------*/
var count = 0;

var nodeRadius = 40;
var distLabelGroup = 0;

var selectionFlag = false;

//var datafile = "https://raw.githubusercontent.com/FabricioLayedra/CiverseData/master/authors_relations_SC_JD_sample2015.json";
var datafile = "./data/authors_relations_SC_JD_sample2015.json";

//var datafile = "./data/authors_relations_63nodes_sample2016.json";
//var datafile = "./data/authors_relations_2015.json";
var datafile2 = "https://raw.githubusercontent.com/FabricioLayedra/CiverseData/master/authors_relations_19nodes_sample2016.json";


var LAYERS = {};

var GRAPHS = {};

var SELECTION = [];

var COLORS = ["#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD", "#8C564B", "#E3775E", "#7F7F7F", "#BCBD22", "#17BECF"];

var el = document.getElementById("layers-table");

var active = null;

var activeLayer = null;

var setCanvases = $("#content");

var generalWidth = setCanvases.width();
var generalHeight = $(document).height() - 70;
console.log(generalWidth, generalHeight);



var sortable = new Sortable(el, {

    onEnd: function (evt) {
        var list = document.getElementById("layers-table");
        sortLayers(list);
    }});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getColor() {
    if (Object.keys(LAYERS).length < 10) {
        return COLORS[Object.keys(LAYERS).length];
    } else {
        alert("No more available layers.")
    }
}

/*----------------------------CREATION OF LAYERS--------------------------------*/

function addNewLayer(layerName) {
    var color = getColor();
//    console.log(color);
    var layer = createLayer(layerName, color);
    $("#layers-table").append(layer);
    addColorsAndBorders(layerName, color);
    addEvents(layerName);
    sortLayers($("#layers-table"));
}

function createLayer(layerName, color) {
//    var canvas = document.createElement("div");
    var container = document.getElementById("set-canvases");
    var canvas = createSVG(container, layerName, generalWidth, generalHeight, color);

    canvas.setAttribute("id", "layer-" + layerName);
    canvas.setAttribute("style", "position: absolute;");
    container.appendChild(canvas);
    var layer = document.getElementById('li-element').content.cloneNode(true);
    if (typeof layerName === "undefined") {
        var id = Object.keys(LAYERS).length;
    } else {
        var id = layerName;
    }
    changeLayerNames(layer, id);

    addDroppingZones(layerName);

    return layer;
}

function addDroppingZones(layerName) {
    var layer = LAYERS[layerName];
    var drawer = layer.layer;
    var layerHeight = drawer.height();
    let rectAttributes = {stroke: 'none', fill: '#ddd', opacity: 0};
    let lineAttributes = {stroke: 'black', 'stroke-width': 2, fill: '#efefef', opacity: 0, linecap: 'round'};
    let h = 55;
    let w = 70;

    layer.bottom = {
        line: drawer.line(w, 0, drawer.width() - w - 20, 0).move(w, layerHeight - h).attr(lineAttributes),
        rect: drawer.rect("100%", h).move(0, layerHeight - h).attr(rectAttributes)
    };
    layer.left = {
        line: drawer.line(0, h, 0, drawer.height() - 40).move(w, 40).attr(lineAttributes),
        rect: drawer.rect(w, "100%").move(0, 0).attr(rectAttributes)
    };

}

function createSVG(container, layerName, width, height, color) {
    var draw = SVG(container).size(width, height).attr({"id": "layer-" + layerName});
//    window.draw = draw;
    LAYERS[layerName] = {layer: draw, "physics-engine": null, color: color, axis: {x: false, y: false}};
//    addLayerEvents(draw.node, draw);
    return draw.node;
}

function changeLayerNames(item, id) {

    $(item.querySelector("li[id^='layer']")).attr("id", "layerItem-" + id);
    $(item.querySelector("div[id^='color']")).attr("id", "color-" + id);
    $(item.querySelector("div[id^='container-item']")).attr("id", "container-item-" + id);
    $(item.querySelector("input[id^='item']")).attr("id", "item-" + id);
    $(item.querySelector("input[id^='item']")).attr("value", "Layer " + id);
    $(item.querySelector("button[id^='visibility']")).attr("id", "visibility-" + id);
    $(item.querySelector("button[id^='delete']")).attr("id", "delete-" + id);
//    $(item.querySelector('div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("id", "color-" + id);
//    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("id", "p-" + id);
//    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("value", "Layer " + id);
//    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-aut > input')).attr("style", "cursor: grab");
//    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("data-target", "#collapse-" + id);
//    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("aria-controls", "collapse-" + id);
//    $(item.querySelector('div > div.row.collapse')).attr("id", "collapse-" + id);
//    $(item.querySelector('div > div.row.collapse > div > div.row > h6:nth-child(2)')).attr("id", "opacity-" + id);
//    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).attr("id", "range-" + id);
//    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).attr("id", "gravity-handler-" + id);
//    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div:nth-child(2) > div.col-4 > input')).attr("id", "gravity-handler-" + id);
}

function addColorsAndBorders(layerName, color) {
    $("#color-" + layerName).attr("style", "background-color: " + color + "; height: auto; width: 5px; background-clip: content-box");
    $("#container-item-" + layerName).attr("style", "background-color: #eee; border:  solid 1.5px " + color);
}

function addEvents(id) {

//    //checkbox opacity
//    $(item.querySelector('div > div:nth-child(1) > div.col-sm-auto.pr-0 > input')).change(function () {
//        showHideLayer(this);
//    });
//    //checkbox physics up
//    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).change(function () {
//        gravityHandler(this, true);
//    });
//
//    //checkbox physics down
//    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div:nth-child(2) > div.col-4 > input')).change(function () {
//        gravityHandler(this, false);
//    });
//    //button
//    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).click(function () {
//        stopDrag();
//    });
//    //range
//    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).on("input", function () {
//        console.log("run");
//        opacityChanger(this);
//    });
////    $(item.querySelector('#p-'+layerName)).mouseenter(function () {
////        highlightLayer(layerName, true);
////    });
////    $(item.querySelector('#p-'+layerName)).mouseleave(function () {
////        highlightLayer(layerName);
////    })

    $("#container-item-" + id).on('pointerdown', function () {
//        console.log(this);
        if (selectionFlag) {
            includeSelection(id);
        }
        activateLayer(id);
    });

    $("#visibility-" + id).on('pointerdown', function () {
        console.log("Touching");
        showHideLayer(id);
    });
}

function activateLayer(layerName) {
//    console.logitem);
    if (active) {
        $(active).css("background-color", "#eee");
    }
    active = $("#container-item-" + layerName);
    activeLayer = LAYERS[layerName];

    var layers = getLayersNames(LAYERS);
    for (var i = 0; i < layers.length; i++) {
        let layer = "#layer-" + layers[i];
        if (layers[i] === layerName) {
            SVG.get(layer).attr({'pointer-events': 'auto'});
        } else {
            SVG.get(layer).attr({'pointer-events': 'none'});
        }
//        $("#set-canvases").prepend($("#layer-" + layer).detach());
    }

    $(active).css("background-color", lightenDarkenColor(LAYERS[layerName]["color"], 20));
}

function showHideLayer(layerName) {
    var layer = "#layer-" + layerName;

    console.log($(layer).css('display') === 'block');

    if ($(layer).css("display") === 'none') {
        $(layer).css("display", "block");
    } else if ($(layer).css("display") === 'block') {
        console.log("fs");
        $(layer).css("display", "none");
    } else {
        console.log("YRS");
    }
//    if (checkbox.checked) {
//        $(layer).css("display", "block");
//    } else {
//    }
}

function getPhysicsEngine(layerName) {
    var engine = null;
    if (!LAYERS[layerName]["physics-engine"]) {
        engine = createPhysicsWorld(layerName);
    } else {
        engine = LAYERS[layerName]["physics-engine"];
    }
    return engine;
}



function activatePhysics(layerTag) {
    let layer = layerTag.split("-")[1];
//    console.log(LAYERS);
//    console.log(layer);
    var engine;

    if (!LAYERS[layer]["physics-engine"]) {
        engine = createPhysicsWorld(layer);
        addElementsToWorld(engine.world, layer);
    } else {
        engine = LAYERS[layer]["physics-engine"];
        addMissingElementsToWorld(engine.world, layer);
    }
    return engine;
}

function addMissingElementsToWorld(world, layer) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;
    var Composite = Matter.Composite;

    var elements = LAYERS[layer].layer.children();
    var actualWorldElements = Composite.allBodies(world);

    for (var i = 0; i < elements.length; i++) {
        var group = elements[i];

        if (actualWorldElements.includes(group.matter)) {
            console.log("YA INGRESADO")
        } else {
            let circle = getElementFromGroup(group, "circle");
            if (circle) {
                var x = group.cx() - group.childDX;
                //            console.log(circle.cx());
                //            console.log(group.cx()-group.childDX);

                var y = group.cy() - group.childDY;
                //            console.log(circle.cy());
                //            console.log(group.cy()-group.childDY)
                //            LAYERS[layer].layer.circle(5).center(x,y).attr({fill:"red",opacity:0.25});

                var radius = circle.attr("r");
                //            var deltaX = group.cx()-circle.cx();
                //            var deltaY = group.cy()-circle.cy();

                var matterObject = Bodies.circle(x, y, radius);

                //nodeData.matter = matterObject;
                matterObject.svg = group;
                group.matter = matterObject;
                //            console.log(group.x());
                group.initX = x;
                group.initY = y;

                World.add(world, matterObject);
            } else if (group.type === 'rect') {
                addElementToWorld(world, group);
            } else if (group.type === 'text') {
                console.log("ADDING TEXT: " + group.node.textContent);
                addElementToWorld(world, group);
//                console.log(group);
            }
        }
    }


}

function gravityHandler(checkbox, up) {
    var layer = checkbox.id.split("-")[2];

    if (checkbox.checked) {
//        activatePhysics(layer);
        addGravity(activatePhysics(layer), up);

//        console.log(checkbox.id)
//        //Initialize the engine if it is not created
//        var engine;
//        if (!LAYERS[layer]["physics-engine"]) {
//            activatePhysics(layer)
//            //add elements to physics world
//            addElementsToWorld(engine.world, layer);
//            addGravity(engine,up);
//        } else {
//            engine = LAYERS[layer]["physics-engine"];
//            addGravity(engine,up);
//        }
//        //Initialize the engine if it is not created

        console.log("Adding gravity...");
    } else {
        if (!LAYERS[layer]["physics-engine"]) {
            console.log("No engine");
        } else {
            console.log("Stoping engine...");
            Matter.World.clear(LAYERS[layer]["physics-engine"].world);
            Matter.Engine.clear(LAYERS[layer]["physics-engine"]);
//            stop_physics(LAYERS[layer]["physics-engine"]);
            LAYERS[layer]["physics-engine"] = null;

        }
        console.log("Removing physics...");
    }
}

function stopDrag() {
    console.log(sortable["options"]["disabled"]);
    if (sortable["options"]["disabled"] === true) {
        sortable["options"]["disabled"] = false;
    } else {
        sortable["options"]["disabled"] = true;
    }
}

function highlightLayer(layerName, blurOthers) {

    Object.keys(LAYERS).forEach(function (aLayer) {
        if (aLayer !== layerName) {
            let currentLayer = SVG.get(getSvgId(aLayer));
            let elements = currentLayer.select("*");
            if (blurOthers) {
                currentLayer.attr('opacity', currentLayer.attr('opacity') / 2);
                elements.filter(function (add) {
                    add.gaussianBlur(3)
                            .componentTransfer({
                                rgb: {type: 'discrete', tableValues: [0, 0.2, 0.4, 0.6, 0.8, 1]}
                            });
                });
            } else {
                currentLayer.attr('opacity', currentLayer.attr('opacity') * 2);
                elements.unfilter(true);
            }
        }
    });

}

function opacityChanger(range) {
//   sortable["options"]["disabled"] = false;
    console.log(sortable["options"]["disabled"]);
    var layer_name = range.id.split("-")[1];
    $("#opacity-" + layer_name).html(range.value);
    // changing the opacity of the entire SVG element so that we don't have to iterate
    SVG.get(getSvgId(layer_name)).attr('opacity', range.value / 100);
}
;

function sortLayers(list) {
    var children = $(list).children();
    for (var i = 0; i < children.length; i++) {
        let layer = children[i].getAttribute("id").toLowerCase().split("-")[1];
        $("#set-canvases").prepend($("#layer-" + layer).detach());
    }


}

/*---------------------------------PHYSICS--------------------------------------*/

Matter.use('matter-attractors');

// module aliases
var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Runner = Matter.Runner, Render = Matter.Render, Body = Matter.Body;

function createPhysicsWorld(layer_name, boundaries) {

    // create an engine
    var engine = Engine.create();

    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: generalWidth,
            height: generalHeight
        }
    });
    Render.run(render);
//    

    // create demo scene
    var world = engine.world;
    world.gravity.scale = 0;

    var strongness = 300;

//   var length = 120000;
//   var dimensions = [1200,800];
//   var tickerLength = 300;
//    
    var roof = Bodies.rectangle(generalWidth / 2, -(strongness / 2) + 5, generalWidth, strongness, {isStatic: true});
    var leftWall = Bodies.rectangle(-(strongness / 2) + 10, 0 + generalHeight / 2, strongness, generalHeight, {isStatic: true});
    var rightWall = Bodies.rectangle(0 + generalWidth + strongness / 2 - 20, 0 + generalHeight / 2, strongness, generalHeight, {isStatic: true});
//    console.log(generalWidth);

    var ground = Bodies.rectangle(0 + generalWidth / 2, generalHeight + 100 - distLabelGroup / 2, generalWidth, 200, {isStatic: true});
//    console.log(ground);

//
    World.add(world, roof);
    World.add(world, leftWall);
    World.add(world, rightWall);
    World.add(world, ground);

    //Add more boundaries
    Engine.run(engine);
    LAYERS[layer_name]["physics-engine"] = engine;
    return engine;
}

function removeWorld(engine) {
    Matter.World.clear(engine.world);
    Matter.Engine.clear(engine);
}

//send a matter engine to restart it
function run_physics(engine) {
    engine.enabled = true;
}

//send a matter engine to stop it
function stop_physics(engine) {
    engine.enabled = false;
}

function addGravity(engine, x, y, factor) {
//    if (engine.world.gravity.scale !== 0) {
////        document.querySelector('#add-gravity > span.text.text-white-50').textContent = "Add gravity" ;
//        engine.world.gravity.scale = 0;
//    } else if (!up) {
////        document.querySelector('#add-gravity > span.text.text-white-50').textContent = "Remove gravity" ;
//        engine.world.gravity.scale = 0.01;
//    } else if (up) {
//    if (factor){
//      engine.world.gravity.scale = factor;
//      return;
//    }
    engine.world.gravity.x = x;
    engine.world.gravity.y = y;
    engine.world.gravity.scale = factor * 0.00001;
//    console.log(engine.world.gravity);
}


function addElementsToWorld(world, layer) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;

    var elements = LAYERS[layer].layer.children();

    for (var i = 0; i < elements.length; i++) {
        var group = elements[i];
//        console.log(group.children());
        let circle = getElementFromGroup(group, "circle");
//        count+=1;
//        console.log(count);
//        console.log(circle);
//        if (element.type === "circle") {  
        if (circle) {
            var x = group.cx() - group.childDX;
//            console.log(circle.cx());
//            console.log(group.cx()-group.childDX);

            var y = group.cy() - group.childDY;
//            console.log(circle.cy());
//            console.log(group.cy()-group.childDY)
//            LAYERS[layer].layer.circle(5).center(x,y).attr({fill:"red",opacity:0.25});

            var radius = circle.attr("r");
//            var deltaX = group.cx()-circle.cx();
//            var deltaY = group.cy()-circle.cy();

            var matterObject = Bodies.circle(x, y, radius);

            //nodeData.matter = matterObject;
            matterObject.svg = group;
            group.matter = matterObject;
//            console.log(group.x());
            group.initX = x;
            group.initY = y;

            World.add(world, matterObject);
        } else if (group.type === "text") {

            var bbox = group.node.getBBox();
            var width = bbox.width;
            var height = bbox.height;

            let valueX = bbox.x + (width / 2) - (nodeRadius / 2);

            let valueY = bbox.y;

            var matterObject = Bodies.rectangle(valueX, valueY, nodeRadius, height, {isStatic: true
            });
            matterObject.density = 1;
//      
            matterObject.svg = group;
            group.matter = matterObject;
            World.add(world, matterObject);
//        getActiveLayer().layer.rect(nodeRadius,height).move(valueX,valueY);
        }

    }
}

function addElementToWorld(world, element) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;

    var circle = getElementFromGroup(element, "circle");


    if (!element.matter && circle) {

        console.log("Adding node...");
        var x = circle.cx();
        var y = circle.cy();
        var radius = circle.attr("r");

//        console.log("Parameters child");
//        console.log(x,y,radius);


        var matterObject = Bodies.circle(x, y, radius);
        matterObject.frictionAir = 0.05;
        matterObject.restitution = 0.025;


        //nodeData.matter = matterObject;
        matterObject.svg = element;
        element.matter = matterObject;

        World.add(world, matterObject);
    } else if (element.type === "rect") {
        console.log("Adding rect...");

        var x = element.attr('x');
        var y = element.attr('y');
        var width = element.width();
        var height = element.height();

        let valueX = 0;
        let valueY = 0;

        if (width > height) {
            valueX = x + width / 2;
            valueY = y;
        } else if (height > width) {
            valueX = x + width / 2;
            valueY = y + height / 2;
        }
//        console.log("************VALUES**********");
//       
//        console.log(width,height);
//        console.log(x,y);
//        console.log(valueX,valueY);
        var matterObject = Bodies.rectangle(valueX, valueY, width, height, {isStatic: true
        });
        matterObject.density = 1;
//      
        matterObject.svg = element;
        element.matter = matterObject;
        World.add(world, matterObject);
    } else if (element.type === "text") {
        console.log("Adding atttribute Value...");

        var bbox = element.node.getBBox();
        var width = bbox.width;
        var height = bbox.height;

        let valueX = bbox.x + (width / 2) - (nodeRadius / 2);

        let valueY = bbox.y;

        var matterObject = Bodies.rectangle(valueX, valueY, nodeRadius, height, {isStatic: true
        });

        console.log(matterObject);

        matterObject.density = 1;
//      
        matterObject.svg = element;
        element.matter = matterObject;
        World.add(world, matterObject);
//        getActiveLayer().layer.rect(nodeRadius,height).move(valueX,valueY);
    }
}

function addAttractorToWorld(world, element) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;

    var matterObject;

    if (element.type === "circle") {

        var x = element.cx();
        var y = element.cy();
        var radius = element.attr("r");


        matterObject = Bodies.circle(x, y, radius, {
            isStatic: true,
            plugin: {
                attractors: [
                    function (theAttractor, theBody) {
                        let x = 0, y = 0, angle, d = 100;
                        if (theBody.attractedTo && theBody.attractedTo.includes(theAttractor)) {
                            let deltaX = theAttractor.position.x - theBody.position.x;
                            let deltaY = theAttractor.position.y - theBody.position.y;
                            angle = Math.atan(-deltaY, -deltaX);
                            x = (deltaX + d * Math.cos(angle)) * 1e-5;
                            y = (deltaY + d * Math.sin(angle)) * 1e-5;
                        }
                        return {x: x, y: y};
                    }
                ]
            }
        });

        matterObject.svg = element;
        element.matter = matterObject;
        World.add(world, matterObject);


    } else if (element.type === "rect") {

        var x = element.attr('x');
        var y = element.attr('y');
        var width = element.width();
        var height = element.height();

//        let valueX = 0;
//        let valueY = 0; 

        if (width > height) {
            valueX = x + width / 2;
            valueY = y;
        } else if (height > width) {
            valueX = x + width / 2;
            valueY = y + height / 2;
        }
//        console.log("************VALUES**********");
//       
//        console.log(width,height);
//        console.log(x,y);
//        console.log(valueX,valueY);
        var matterObject = Bodies.rectangle(valueX, valueY, width, height, {isStatic: true,

            plugin: {
                attractors: [
                    function (theAttractor, theBody) {
                        let x = 0, y = 0, angle, d = 100;
                        if (theBody.attractedTo && theBody.attractedTo.includes(theAttractor)) {
                            let deltaX = theAttractor.position.x - theBody.position.x;
                            let deltaY = theAttractor.position.y - theBody.position.y;
                            angle = Math.atan(-deltaY, -deltaX);
                            x = (deltaX + d * Math.cos(angle)) * 1e-5;
                            y = (deltaY + d * Math.sin(angle)) * 1e-5;
                        }
                        return {x: x, y: y};
                    }
                ]
            }
        });

//      
        matterObject.svg = element;
        element.matter = matterObject;
        World.add(world, matterObject);
    } else if (element.type === 'text') {
        console.log("Adding text as an attractor...");
        var bbox = element.node.getBBox();
        var width = bbox.width;
        var height = bbox.height;

        var direction = element.direction;

        let valueX = bbox.x + (width / 2) - (nodeRadius / 2);

        let valueY = bbox.y;

        getActiveLayer().layer.rect(nodeRadius, height).move(valueX, valueY);

        let matterX = 0;
        let matterY = 0;
        let matterWidth = 0;
        let matterHeight = 0;

        if (direction === 'horizontal') {
            matterX = valueX + (nodeRadius / 2);
            matterY = valueY + (height / 2);
            matterWidth = nodeRadius;
            matterHeight = 5;
        } else {
            matterX = valueX + (nodeRadius / 2);
            matterY = valueY + (height / 2);
            matterWidth = 5;
            matterHeight = nodeRadius;
        }



        var matterObject = Bodies.rectangle(matterX, matterY, matterWidth, matterHeight, {isStatic: true,

            plugin: {
                attractors: [
                    function (theAttractor, theBody) {
                        let x = 0, y = 0, angle, d = 100;
                        if (theBody.attractedTo && theBody.attractedTo.includes(theAttractor)) {
                            let deltaX = theAttractor.position.x - theBody.position.x;
                            let deltaY = theAttractor.position.y - theBody.position.y;
                            angle = Math.atan(-deltaY, -deltaX);
                            x = (deltaX + d * Math.cos(angle)) * 1e-5;
                            y = (deltaY + d * Math.sin(angle)) * 1e-5;
                        }
                        return {x: x, y: y};
                    }
                ]
            }
        });

//      
        matterObject.svg = element;
        element.matter = matterObject;
        World.add(world, matterObject);
    }
    return matterObject;
}

/*----------------------------GRAPHS' ACTIONS-----------------------------------*/

function showCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    return [x, y];
}

//loads the JSON file and creates the graph using graphLib and adds it to GRAPHS
function loadGraph(filename, key, directed) {
    return $.getJSON(filename).done(function (json) {
        // Creates a new directed graph
        var g = new graphlib.Graph({directed: directed});
        g._label = key;
        var edges = json.links;
        var nodes = json.nodes;

        nodes.forEach(function (data) {
//            console.log(data);
            var keys = Object.keys(data);
            dataInfo = {};
            dataInfo["name"] = data["id"];
            for (var index in keys) {
                dataInfo[keys[index]] = data[keys[index]];
            }
//            console.log(dataInfo);

            g.setNode(format_id(data["id"]), {authorInfo: dataInfo});
        });

        edges.forEach(function (data) {
            //Load it data-drivenish (TO DO)
            g.setEdge(format_id(data["source"]), format_id(data["target"]), {colabInfo: {value: data["value"], id: data["id"]}});
        });

        if (Object.keys(GRAPHS).includes(key)) {
            console.log("Request Failed: " + "Data Already Loaded");
        } else {
            GRAPHS[key] = g;
        }
    }).fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
        return null;
    });

}

// Adds a graph as a layer in the tool
function addGraphAsLayer(g, layerName) {

//    var color = addNewLayer(layer_name);
//    var darkenColor = lightenDarkenColor(color, -10);

    addNewLayer(layerName);
    var color = LAYERS[layerName].color;
//    console.log("COLOR NODES");
//    console.log(color);
    var darkenColor = lightenDarkenColor(color, -10);

//    drawGr714aph(LAYERS[layer_name].layer, g);
    drawGraph(layerName, g);
//    var svg_id = $("#" + layerName).children("svg").attr("id");
    var svg_id = "layer-" + layerName;

//    console.log(svg_id);
    SVG.get(svg_id).select("circle").attr({fill: color, stroke: darkenColor, 'stroke-width': 2});

}

function drawGraph(layer_name, g) {
    var draw = LAYERS[layer_name].layer;
    var color = LAYERS[layer_name].color;
//    console.log(color);
    var graphId = g._label;
    var directed = g.directed;
    var nodeKeys = g.nodes();
    var edges = g.edges();
    var dataKeys = null;

    // adding to the nodes objects of the graph both the fabric and the matter associated objects
    nodeKeys.forEach(function (nodeKey) {

        var nodeData = g.node(nodeKey);
//        if (directed){
        nodeData.inEdges = new Array();
        nodeData.outEdges = new Array();
//        }else{
//            nodeData.edges = new Array();
//        }

        var radius = nodeRadius;

        //HERE WE HAVE TO SET THE POSITION TAKING INTO ACCOUNT A LAYOUT
        var y = getRandomBetween(30, 600);
        var x = getRandomBetween(30, 1200);

        //GOTTA CHANGE IF THE GRAPH STRUCTURE CHANGES
        var labelName = nodeData.authorInfo.name;

        //CREATION OF THE GROUP
        var group = draw.group().attr({id: "group-" + nodeKey, class: "node"});
        group.layerName = layer_name;
        group.firstTime = true;

        // creation of the elements
        var circle = drawCircleInLayer(draw, radius, x, y, nodeKey, directed, graphId, color);
        var label = drawLabel(draw, nodeKey, circle.cx(), circle.cy() + (radius / 2), graphId, labelName);
        var r = circle.attr('r') + circle.attr('stroke-width') / 2;
        var ear = drawEarInCircle(draw, r, circle.cx(), circle.cy(), LAYERS[layer_name]["color"]);

        //addition of the elements
        group.add(ear);
        group.add(circle);
        group.add(label);

        //set the distance between the group and the circle
        group.childDX = group.cx() - getElementFromGroup(group, 'circle').cx();
        group.childDY = group.cy() - getElementFromGroup(group, 'circle').cy();

        //set the distance between the group and its label
        group.textDX = group.cx() - getElementFromGroup(group, 'text').cx();
        group.textDY = group.cy() - getElementFromGroup(group, 'text').cy();

        distLabelGroup = radius / 2;

        //addition of highlights and events
        createHighlight(group);
        addTouchEvents(group);
        addSelectionEvents(group);

        //circular references
        nodeData.svg = circle;
        nodeData.label = label;
        circle.nodeData = nodeData;

        dataKeys = Object.keys(nodeData.authorInfo);
        //removing the keys I do not want
        dataKeys = arrayRemove(dataKeys, 'id');
        dataKeys = arrayRemove(dataKeys, 'group');
        dataKeys = arrayRemove(dataKeys, 'name');
        dataKeys = arrayRemove(dataKeys, 'number of papers');

    });

    LAYERS[layer_name].attributes = dataKeys;
//    console.log("DICTIONARY");
    LAYERS[layer_name].data = getValuesByAttributeDict(SVG.select('g.node').members, dataKeys);

    addAttributesAsTools(dataKeys);


    edges.forEach(function (edge) {

        var from = g.node(edge.v);
        var to = g.node(edge.w);

        var id = edge.v + edge.w;
        var fromCenterX = from.svg.cx();
        var fromCenterY = from.svg.cy();

        var toCenterX = to.svg.cx();
        var toCenterY = to.svg.cy();

        let controlX = (fromCenterX + (toCenterX - fromCenterX) / 2);
        let controlY = (fromCenterY + (toCenterY - fromCenterY) / 2);

        // creating a QUADRATIC CURVE. See https://www.sitepoint.com/html5-svg-quadratic-curves/ and http://fabricjs.com/quadratic-curve
//        var path = "M" + fromCenterX + "," + fromCenterY + " Q" + controlX + "," + controlY + " " + toCenterX + "," + toCenterY;

        var edgePath = drawPathInLayer(draw, fromCenterX, fromCenterY,
                controlX, controlY, toCenterX, toCenterY, id, graphId, layer_name);

        var group = draw.group().attr({id: "path-" + id, });
        //    console.log(group);
        group.add(edgePath);
        group.layerName = layer_name;
        group.back();


//        if (directed){
        to.inEdges.push(edgePath);
        from.outEdges.push(edgePath);
//        }else{
//            to.edges.push(edgePath);
//            from.edges.push(edgePath);
//        }

    });

    addHighlightToGroups(SVG.select('g').members);

//    forceLayout(g, pxs, pys);
}

function addHighlightToGroups(groups) {
//    console.log(groups);

    for (var i = 0; i < groups.length; i++) {
//            console.log(groups[i].type);
        createHighlight(groups[i]);
    }
}

function drawCircleInLayer(drawer, radius, cx, cy, id, directed, graphId, color) {

    var nodeGraphics = drawer.circle(radius)
            .attr({cx: cx,
                cy: cy,
                id: id,
                graph: graphId
            })
            .move(cx, cy).fill(color);

    //Add context_menu to the element using the selector, in this case the id
//    addContextMenu("#" + id);

    return nodeGraphics;
}

function drawHaloInCircle(drawer, circle, distance, color) {
    var halo = drawer.path()
            .M({x: circle.cx() - (circle.attr('r') + distance), y: circle.cy()})
            .a(circle.attr('r') + distance, circle.attr('r') + distance, 0, 1, 0, {x: (circle.attr('r') + distance) * 2, y: 0})
            .a(circle.attr('r') + distance, circle.attr('r') + distance, 0, 1, 0, {x: -((circle.attr('r') + distance) * 2), y: 0})
            .attr({
                stroke: color,
                fill: 'transparent',
                'stroke-width': 2,
                'pointer-events': 'none'
            });
    return halo;
}

function drawEarInCircle(drawer, r, cx, cy, color) {
    var ear = drawer.path()
            .M({x: cx, y: cy - r})
            .a(r, r, 0, 1, 0, {x: r, y: r})
            .L({x: cx + r, y: cy - r})
            .Z()
//                    .L({x: cx, y: cy-r})
//                    .a(r, r, 0, 1, 0, {x: r , y: r})
            .attr({
//                        stroke: color,
                fill: color,
//                        'stroke-width': 2,
                'pointer-events': 'none'
            });
    return ear;
}

function drawPathInLayer(drawer, fromCenterX, fromCenterY,
        controlX, controlY, toCenterX, toCenterY, id, graphId, layerName) {
    var edgePath = drawer.path()
            .M({x: fromCenterX, y: fromCenterY})
            .Q({x: controlX, y: controlY}, {x: toCenterX, y: toCenterY})
            .attr({
                stroke: LAYERS[layerName].color,
                fill: 'transparent',
                'stroke-width': 3.5,
                id: id,
                'pointer-events': 'visibleStroke'
            }).off();
//    edgePath.layerName = layerName;
    return edgePath;
}

function drawLabel(drawer, id, x, y, graphId, label) {
    var labelText = drawer.text(label).attr({
        id: "label-" + id,
        graph: graphId,
        "text-anchor": "middle",
        "alignment-baseline": "hanging",
        fill: 'black'
    });
    labelText.move(x, y);
    return labelText;
}

function updateHighlight(object) {

    var highlight = object.highlight;

    if (!highlight) {
        return;
    }



    if (object.type === 'circle') {

        // IMPORTANT: It was IMPOSIBLE to just set the position of the path with the move/center/cx,cy/x,y methods
        // so I am just replacing the path itself it using the plot method
        // How sad that positioning was not enough. Understanding this was absolutely frustrating :(


//        let newPath = "M" + x + "," + y;
//        newPath += "M" + (x - r) + "," + y;
//        newPath += "a" + r + "," + r + " 0 1,0 " + (r * 2) + ",0";
//        newPath += "a" + r + "," + r + " 0 1,0 " + -(r * 2) + ",0";
//        highlight.plot(newPath);

        let x = object.cx();
        let y = object.cy();
        let r = object.attr('r') + object.attr('stroke-width') / 2 + 2;
        let layerName = object.layerName;
        let drawer = LAYERS[layerName].layer;
        let tmp = drawer.path()
                .M({x: x - r, y: y})
                .a(r, r, 0, 1, 0, {x: r * 2, y: 0})
                .a(r, r, 0, 1, 0, {x: -r * 2, y: 0})
                .hide();

        highlight.replaceSegment(0, tmp.getSegment(0));
        highlight.replaceSegment(1, tmp.getSegment(1));
        highlight.replaceSegment(2, tmp.getSegment(2));

    } else if (object.type === 'path') {
        highlight.replaceSegment(0, object.getSegment(0));
        highlight.replaceSegment(1, object.getSegment(1));
    }
}

function updateHighlights(object) {
    updateHighlight(object);
    object.nodeData.inEdges.forEach(function (inEdge) {
        updateHighlight(inEdge);
    });
    object.nodeData.outEdges.forEach(function (outEdge) {
        updateHighlight(outEdge);
    });
}

function updateEdgesEnds(nodeGraphics, coordX, coordY, directed) {
    var x = !coordX ? nodeGraphics.cx() : coordX;
    var y = !coordY ? nodeGraphics.cy() : coordY;
    var segment;

//    if (directed){
    nodeGraphics.nodeData.inEdges.forEach(function (inEdge) {
        segment = inEdge.getSegment(1);
//        console.log(x,y);
//        console.log(inEdge.getSegment(1));
        // TMP: to make it straight, we just set the control point at the ending point
        segment.coords[0] = x;
        segment.coords[1] = y;
        segment.coords[2] = x;
        segment.coords[3] = y;
        inEdge.replaceSegment(1, segment);
//        console.log(inEdge.getSegment(1));

        inEdge.highlight.replaceSegment(1, inEdge.getSegment(1))
//        break;

    });
    nodeGraphics.nodeData.outEdges.forEach(function (outEdge, i) {
//        console.log(outEdge);

        segment = outEdge.getSegment(0);
        segment.coords[0] = x;
        segment.coords[1] = y;
        outEdge.replaceSegment(0, segment);
        outEdge.highlight.replaceSegment(0, outEdge.getSegment(0))


        // to make it straight, we just set the control point at the starting one
        segment = outEdge.getSegment(1);
        segment.coords[0] = x;
        segment.coords[1] = y;
        outEdge.replaceSegment(1, segment);
        outEdge.highlight.replaceSegment(1, outEdge.getSegment(1))

    });

//    }else{
//       nodeGraphics.nodeData.edges.forEach(function(edge){
//            segment = edge.getSegment(1);
//            segment.coords[2] = x;
//            segment.coords[3] = y;
//            edge.replaceSegment(1, segment);
//            segment = edge.getSegment(0);
//            segment.coords[0] = x;
//            segment.coords[1] = y;
//            edge.replaceSegment(0, segment);
//       });
//    }
}



//function addHoveringEvents(object, directed) {
//
//    object.on('mouseenter', function event() {
//        if (!object.highlight) {
//            createHighlight(object.parent());
//        } else {
//            object.parent().highlight.show();
//        }
//        object.nodeData.inEdges.forEach(function (inEdge) {
//            if (!inEdge.highlight) {
//                createHighlight(inEdge.parent());
//            } else {
//                inEdge.parent().highlight.show();
//            }
//        });
//        object.nodeData.outEdges.forEach(function (outEdge) {
//            if (!outEdge.highlight) {
//                createHighlight(outEdge.parent());
//            } else {
//                outEdge.parent().highlight.show();
//            }
//        });
//    });
//
//    object.on('mouseleave', function event() {
//        if (object.parent().highlight) {
//            object.parent().highlight.hide();
//        }
//        object.nodeData.inEdges.forEach(function (inEdge) {
//            if (inEdge.parent().highlight) {
//                inEdge.parent().highlight.hide();
//            }
//        });
//        object.nodeData.outEdges.forEach(function (outEdge) {
//            if (outEdge.parent().highlight) {
//                outEdge.parent().highlight.hide();
//            }
//        });
//    });
//
//}

function addMovingEvents(nodeGraphics, directed) {
    nodeGraphics.parent().draggable();
    nodeGraphics.parent().on('dragmove', function event(e) {
        let theBody = nodeGraphics.matter;
        if (theBody) {
            let event = e.detail.event;
            var x = event.offsetX;
            var y = event.offsetY;
            Body.translate(nodeGraphics.matter, {
                x: (x - theBody.position.x) * 0.25,
                y: (y - theBody.position.y) * 0.25
            });
        }
        console.log(nodeGraphics);
        updateEdgesEnds(nodeGraphics, directed);
//        updateLabelPosition(nodeGraphics);
//        updateHighlights(nodeGraphics);
    });
}

function updateLabelPosition(nodeGraphics) {
    nodeGraphics.nodeData.label.attr({x: nodeGraphics.cx(), y: nodeGraphics.cy() + 15});
}

function addMouseEvents(object) {
    object.draggable();
    object.on("click", function (d) {
        if (d.shiftKey) {
            if (SELECTION.includes(this)) {
                SELECTION = arrayRemove(SELECTION, this);
            } else {
                SELECTION.push(this);
                console.log("Added");
//                console.log(this);
                $.contextMenu('destroy', "#" + this.node.id);
                addContextMenuSelection("#" + this.node.id);
            }
            console.log("SELECTION");
            console.log(SELECTION);
        }
    });

}

function getSvgId(layer_name) {
    return "#layer-" + layer_name;
}

function getGraphFromSVGElement(svgElement) {
    var graph_name = $("#" + svgElement.node.id).attr("graph");
    return GRAPHS[graph_name];
}

function getGraphFromSelector(selector) {
    var graph_name = $(selector).attr("graph");
    return GRAPHS[graph_name];
}

function getSpanningTree(selector, n_levels) {
    var graph = getGraphFromSelector(selector);
    var edges = graph.edges();
    //This substring is just the name without the # of the selector
    var idNode = selector.substring(1, selector.length);
//    var limit;
//    if (graph.directed){
//        limit = source.inEdges.length + source.outEdges.length;
//    }else{
//        limit = source.edges.length;
//    }
//    console.log(limit);
    var count = 0;
    var ego = [];
    var links = [];
    edges.forEach(function (edge) {
//        if (graph.directed){
////            if (edge.v === svgElement.attr("id")){
////                console.log("YEIH!")
////            }
//        }else{
        var neighbour;
        if (edge.v === idNode) {
            neighbour = edge.w;
            count++;
            ego.push(neighbour);

            if (!links.includes(edge)) {
                try {
                    links.push(SVG.get(idNode + edge.w));
                } catch (e) {
                    try {
                        links.push(SVG.get(edge.w + idNode));
                    } catch (e) {
                    }
                }
            }

        } else if (edge.w === idNode) {
            neighbour = edge.v;
            count++;
            ego.push(neighbour);

            if (!links.includes(edge)) {
                try {
                    links.push(SVG.get(idNode + edge.v));
                } catch (e) {
                    try {
                        links.push(SVG.get(edge.v + idNode));
                    } catch (e) {
                    }
                }
            }

        }
//        }
    });
    return [idNode, ego, links];
}

function getParentLayerName(svgElement) {
    return $(svgElement).parent().parent().parent().attr("id");
}

function getActiveLayerName() {
    return getActiveLayer().layer.node.id.split("-")[1];
}
/*-----------------------------CONTEXT MENU-------------------------------------*/

function addContextMenu(sel) {
    $.contextMenu({
        selector: sel,
        build: function ($trigger, e) {
            var data = getLayersNames(LAYERS);
            var layer = getParentLayerName(sel);
            // this callback is executed every time the menu is to be shown
            // its results are destroyed every time the menu is hidden
            // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
            return {
                callback: function (key, options) {
                    console.log(key, options);
                },
                items: {
                    "send": {
                        "name": "Send to...",
                        "items": Object.assign({},
                                generateLayersNamesMenu(
                                        data,
                                        function (destination) {
                                            sendElementToLayer(sel, destination);
                                        }, layer
                                        ),
                                newLayerItem(function () {
                                    var destination = prompt("Enter the name of the layer:", "");
                                    addNewLayer(destination);
                                    sortLayers(el);
                                    sendElementToLayer(sel, destination);
                                }))
                    },
                    "ego": {
                        "name": "Send adjacents to...",
                        "items": Object.assign({},
                                generateLayersNamesMenu(
                                        data,
                                        function (destination) {
                                            sendAdjacentsToLayer(sel, destination);
                                        }, layer
                                        ),
                                newLayerItem(function () {
                                    var destination = prompt("Enter the name of the layer:", "");
                                    addNewLayer(destination);
                                    sortLayers(el);
                                    sendAdjacentsToLayer(sel, destination);
                                }))
                    },
                    "transform": {
                        "name": "Attract..",
                        "items": {
                            "neighbours": {"name": "Adjacent nodes",
                                "callback": function () {
                                    makeAttractor(this);
                                }
                            }
                        }
                    }

//                    ,
//                    "select": {"name": "Select .."}
                }
            };
        }
    });
}

function addContextMenuSelection(sel) {
    $.contextMenu({
        selector: sel,
        build: function ($trigger, e) {
            var data = getLayersNames(LAYERS);
            var layer = getParentLayerName(sel);

            // this callback is executed every time the menu is to be shown
            // its results are destroyed every time the menu is hidden
            // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
            return {
                callback: function (key, options) {
                    console.log(key, options);
                },
                items: {
                    "send": {
                        "name": "Send selection to...",
                        "items": Object.assign({},
                                generateLayersNamesMenu(
                                        data,
                                        function (destination) {
                                            sendSelectionToLayer(destination);
                                        }, layer
                                        ),
                                newLayerItem(function () {
                                    var destination = prompt("Enter the name of the layer:", "");
                                    addNewLayer(destination);
                                    sortLayers(el);
                                    sendSelectionToLayer(destination);
                                }))
                    }
                }
            };
        }
    });
}

function newLayerItem(callback) {
    return {"send":
                {
                    "name": "New Layer...",
                    "callback": callback
                }
    };
}

function sendSelectionToLayer(destination) {
    for (var i = 0; i < SELECTION.length; i++) {
        let object = SELECTION[i];
        let svg_destination = getSvgId(destination);
        SVG.get(svg_destination).put(object.remove());
        SVG.get(svg_destination).put(object.nodeData.label.remove());
        // this need revision, as the highlight might exist already, so it only has to change of color and be animated
        if (object.highlight) {
            object.highlight.remove();
            object.highlight = null;
        }
        createHighlight(object.parent(), true, true, LAYERS[destination].color);
    }
}

function getNodesNames(nodes) {
    var names = [];
    for (var nodeIndex in nodes) {
        names.push(nodes[nodeIndex].node.id.split("-")[1]);
    }
    return names;
}

function sendEdgesToLayer(source, nodesNames, edges, destination) {
    var layerName = destination.split("-")[1];
//    console.log("neighbour");
    for (var index in edges) {
//        console.log(edges[index]);
//        console.log(edges[index].node.id);
//        console.log(edges[index].node.id.split("#")[1]);
//        console.log();
        if (nodesNames.includes(edges[index].node.id.replace(source.node.id, ""))) {

            SVG.get(edges[index].node.id).attr({"stroke": LAYERS[layerName].color});
            SVG.get(destination).put(SVG.get(edges[index].node.id).remove()).back();
            console.log("Included");
        }
    }
}

function includeSelection(layerName) {
//    console.log(getActiveLayer());
    selectionMode(false);


    var dataKeys = [];
    var names = getNodesNames(SELECTION);

    $("#container-item-" + layerName).addClass('item-animated');


//    $("#container-item-"+layerName).animate({height: '+=10px',width: '+=10px'});
//    $("#container-item-"+layerName).animate({height: '-=10px',width: '-=10px'});
    //Todo has to be changed!
    var nodes = SVG.select('g.node').members;

//    console.log(nodes);

    for (var i = 0; i < nodes.length; i++) {
        let object = nodes[i];
//        console.log(SELECTION.includes(nodes[i]));
        if (SELECTION.includes(nodes[i])) {
            let svgDestination = getSvgId(layerName);
            object = SVG.get(svgDestination).put(object.remove());
            //            getElementFromGroup(object,'circle').highlight = null;
            var circle = getElementFromGroup(object, 'circle');

            dataKeys = Object.keys(circle.nodeData.authorInfo);
            //removing the keys I do not want
            dataKeys = arrayRemove(dataKeys, 'id');
            dataKeys = arrayRemove(dataKeys, 'group');
            dataKeys = arrayRemove(dataKeys, 'name');
            dataKeys = arrayRemove(dataKeys, 'number of papers')
            console.log(dataKeys);
            LAYERS[layerName].attributes = dataKeys;
//            addAttributesAsTools(dataKeys);
            circle.fill(LAYERS[layerName].color);
            sendEdgesToLayer(circle, names, circle.nodeData.inEdges, svgDestination);
//            isNeighbour(circle,names,circle.nodeData.outEdges);


            getElementFromGroup(object, 'path').remove();

            getElementFromGroup(object, 'path').attr({fill: LAYERS[layerName].color, "stroke-fill": LAYERS[layerName].color});

            createHighlight(object);
        }
//            createHighlight(object, true, true, LAYERS[layerName].color);

        object.off("pointerdown");
        addTouchEvents(object);
        addSelectionEvents(object);
    }
    SELECTION = [];
    selectionFlag = false;
}

function generateLayersNamesMenu(list, callback, layerName) {
    var items = {};
    var count = list.length;
    for (var i = 0; i < count; i++) {
        var text = list[i];
//        console.log("Comparing...");
//        console.log(text,layerName);
        if (text !== layerName) {
            var item = {};
            item["name"] = "Layer " + text;
            item["callback"] = callback;
            items[text] = item;
        }
    }
    return items;
}

function getLayersNames(dict) {
    return Object.keys(dict);
}

function sendElementToLayer(selector, destination) {

    let object = SVG.get(selector);
    createHighlight(object.parent(), true, true, LAYERS[destination].color);

    let svg_destination = getSvgId(destination);
    SVG.get(svg_destination).put(object.remove());
    SVG.get(svg_destination).put(object.nodeData.label.remove());

    // this need revision, as the highlight might exist already, so it only has to change of color and be animated
    if (object.highlight) {
        object.highlight.remove();
        object.highlight = null;
    }

}

function sendAdjacentsToLayer(selector, destination) {
    var spanning_tree = getSpanningTree(selector, 1);
    var source = spanning_tree[0];
    var targets = spanning_tree[1];
    //send the center
    sendElementToLayer(source, destination);
    //send the target nodes and edges
    for (var i = 0; i < targets.length; i++) {
        // target nodes
        sendElementToLayer(targets[i], destination);
        try {
            sendElementToLayer(source + targets[i], destination);

        } catch (error) {
            try {
                sendElementToLayer(targets[i] + source, destination);
            } catch (error) {
                console.error(error);
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
            }
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
        }
        //edges
        //sendElementToLayer(source+targets[i],destination);
    }

    console.log(spanning_tree);

}

function makeAttractor(svgElement) {
    //get spanning tree correr mundo y anadir propiedades al matter de los svgs diciendo que son atraidos por
//    console.log(svgElement);
//    console.log(getGraphFromSelector("#"+svgElement.attr("id")))

    var svgID = svgElement.attr("id");
    var attractorGraphics = SVG.get(svgElement.attr("id"));

    var spanning_tree = getSpanningTree("#" + svgID, 1);

    var layer_name = getParentLayerName(svgElement);

    var engine = null;

    if (!LAYERS[layer_name]["physics-engine"]) {
        engine = createPhysicsWorld(layer_name);
    } else {
        engine = LAYERS[layer_name]["physics-engine"];
    }

    var world = engine.world;
    addAttractorToWorld(world, attractorGraphics);

    var attractor = attractorGraphics.matter;


    for (var i = 0; i < spanning_tree[1].length; i++) {

        var graphics = SVG.get(spanning_tree[1][i]);

//        graphics.attr('fill', theColor);

        var body = graphics.matter;

        if (!body) {
            addElementToWorld(world, graphics);
            body = graphics.matter;
        } else {
            // IMPORTANT: we need to do this to update objects that are attracted to more than one attractor
            Matter.Composite.remove(world, body);
            World.add(world, body);
        }

        if (!body.attractedTo) {
            body.attractedTo = new Array();
        }
        body.attractedTo.push(attractor);


    }
}
var pxs;
var pys;
function forceLayout(g) {
    var renderer;
    var pxs = {};
    var pys = {};
    // make a new graph
    var graph = new Springy.Graph();
    var edges = g.edges();
    var nodes = g.nodes();
    var data = {"nodes": [], "edges": []};

    // make some nodes

    for (var i = 0; i < nodes.length; i++) {
        data["nodes"].push(nodes[i]);
    }
    for (var i = 0; i < edges.length; i++) {
        data["edges"].push([edges[i].v, edges[i].w]);
    }

    graph.loadJSON(data);
//
    var layout = new Springy.Layout.ForceDirected(graph, 400.0, 400.0, 0.8);

    renderer = new Springy.Renderer(layout,
            function clear() {
//        console.log(this);
            },
            function drawEdge(edge, p1, p2) {
//        console.log(edge,p1,p2);
            },
            function drawNode(node, p) {
//        console.log(node.id,p.x,p.y);
                // calculate bounding box of graph layout.. with ease-in
//	var currentBB = layout.getBoundingBox();
//	var targetBB = {bottomleft: new Springy.Vector(-2, -2), topright: new Springy.Vector(2, 2)};
//	var toScreen = function(p) {
//		var size = currentBB.topright.subtract(currentBB.bottomleft);
//		var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * 1200;
//		var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * 800;
//		return new Springy.Vector(sx, sy);
//	};
//        var s = toScreen(p);
//        			var contentWidth = 5;
//			var contentHeight = 5;
//			var boxWidth = contentWidth + 6;
//			var boxHeight = contentHeight + 6;
                var nodeGraphics = g.node(node.id).svg;
                pxs[node.id] = nodeGraphics.cx() + p.x;
                pys[node.id] = nodeGraphics.cy() + p.y;
//                nodeGraphics.dmove(p.x,p.y);
                nodeGraphics.cx(pxs[node.id]);
                nodeGraphics.cy(pys[node.id]);
//                nodeGraphics.on("stop",function(){console.log("PARO")});
//                updateEdgesEnds(nodeGraphics,false);
//        updateLabelPosition(nodeGraphics);


//         .cx(g.node(node.id).svg.cx()+p.x),g.node(node.id).svg.cy(g.node(node.id).svg.cy()+p.y);
//        g.node(node.id).svg.dmove(s.x, s.y);

//g.node(node.id).svg.transform({"x":p.x,"y":p.y});
//        console.log(layout.getBoundingBox());
            }
    );

    renderer.start();
//        console.log(renderer);

//    renderer.onRenderStop = function(d){
//        console.log("paro");
//    };

    setTimeout(
            function () {
                console.log("STOP");
                renderer.stop();
                document.getElementById("loading").style.display = "none";
                scaleLayout(g, pxs, pys);
            }, 500);

    pxs = {};
    pys = {};
//    console.log(getSvgId("colab"));
//    svgPanZoom(getSvgId("colab"));
//  
//     var springy = window.springy = jQuery('#springydemo').springy({
//        graph: graph,
//        nodeSelected: function(node){
//          console.log('Node selected: ' + JSON.stringify(node));
//        }
//      });
}

function scaleLayout(g, pxs, pys) {
    var oldMaxX = getMaxArray(valuesDict(pxs));
    var oldMinX = getMinArray(valuesDict(pxs));
    var newMaxX = 790;
    var newMinX = 50;
    var oldMaxY = getMaxArray(valuesDict(pys));
    var oldMinY = getMinArray(valuesDict(pys));
    var newMaxY = 600;
    var newMinY = 50;
    var nodesNames = Object.keys(pxs);
    for (var i = 0; i < nodesNames.length; i++) {
        let nodeGraphics = g.node(nodesNames[i]).svg.parent();
        let newX = scaleValue(oldMaxX, oldMinX, newMaxX, newMinX, nodeGraphics.cx());
        let newY = scaleValue(oldMaxY, oldMinY, newMaxY, newMinY, nodeGraphics.cy());
        nodeGraphics.cx(newX);
        nodeGraphics.cy(newY);
        updateEdgesEnds(nodeGraphics, false);
        updateLabelPosition(nodeGraphics);
    }

}



//function forceLayout2(g){
//    var graph = createGraph();
//    var edges = g.edges();
//    var nodes = g.nodes();
//    var data = {"nodes":[],"edges":[]};
//
//    // make some nodes
////    
////    for (var i = 0; i< nodes.length; i++){
////        data["nodes"].push(nodes[i]);
////
////    }
//    for (var i = 0; i< edges.length; i++){
//        graph.addLink(edges[i].v,edges[i].w);
//    }
//    console.log(graph.forcelayout()));
//}

/*-----------------------------------MAIN---------------------------------------*/

function main() {
    var bodies = [];
    var Composite = Matter.Composite;

    function render() {
        for (var layer in LAYERS) {
            //        console.log(LAYERS[layer])
            if (LAYERS[layer]["physics-engine"]) {
                bodies = Composite.allBodies(LAYERS[layer]["physics-engine"].world);
//                console.log(bodies);

                /*console.log('LAYERS[layer]["physics-engine"].world.gravity.scale');
                 console.log(LAYERS[layer]["physics-engine"].world.gravity.scale);*/

                for (var i = 0; i < bodies.length; i += 1) {

                    var currentBody = bodies[i];

                    var nodeGraphics = currentBody.svg;
                    if (nodeGraphics) {

                        if (nodeGraphics.type !== 'rect' && nodeGraphics.type !== 'text') {
//                     console.log(currentBody.svg);

                            let newX = currentBody.position.x;
                            let newY = currentBody.position.y;
//                        nodeGraphics.cx(newX-nodeGraphics.initX);
//                        nodeGraphics.cy(newY-nodeGraphics.initY);
//                        nodeGraphics.center(,newY-nodeGraphics.initY);

                            nodeGraphics.dmove(newX - nodeGraphics.initX, newY - nodeGraphics.initY);
                            nodeGraphics.initX = nodeGraphics.cx() - nodeGraphics.childDX;
                            nodeGraphics.initY = nodeGraphics.cy() - nodeGraphics.childDY;
//                        console.log(newX-nodeGraphics.initX,newY-nodeGraphics.initY);
//                        console.log(LAYERS[layer].layer.circle(5).center(newX-nodeGraphics.initX,newY-nodeGraphics.initY));;

//                        if (i===0){
//                        console.log(newX-nodeGraphics.initX,newY-nodeGraphics.initY);
//                        console.log(newX-nodeGraphics.initX)
////                            LAYERS[layer].layer.circle(5).center(nodeGraphics.cx(),nodeGraphics.cy());
//
//                        }                        
                            updateEdgesEnds(getElementFromGroup(nodeGraphics, 'circle'), nodeGraphics.cx() - nodeGraphics.childDX, nodeGraphics.cy() - nodeGraphics.childDY);


//                        nodeGraphics.cx(newX)
//                        nodeGraphics.cy(newY);

//                        console.log(nodeGraphics.center());


//                        console.log(nodeGraphics.cy());add
//                        console.log(nodeGraphics.parent().cx());
//                        console.log(nodeGraphics.parent().cy());


//                        console.log(nodeGraphics.parent());
//                        nodeGraphics.parent().center(newX,newY);
//                        console.log()

//                        updateEdgesEnds(getElementFromGroup(nodeGraphics,'circle'));
//                        updateHighlights(nodeGraphics.parent());


                        }
                    }
                }
            }
        }

        window.requestAnimationFrame(render);
    }
    ;

    render();


    var tools = document.getElementsByClassName("tool");
    for (var i = 0; i < tools.length; i++) {
        var type = $(tools[i]).attr("id");
        addToolEvents(tools[i], type);
    }






    loadGraph(datafile, "authors2016", false).then(function () {
        addGraphAsLayer(GRAPHS["authors2016"], "1");
//        loadGraph(datafile2, "authors2015", false).then(function () {
//            addGraphAsLayer(GRAPHS["authors2015"], "2");
//
//    //        addGraphAsLayer(GRAPHS["authors2016"], "3");
//
//    //        activateLayer("1");
//        });

//        addGraphAsLayer(GRAPHS["authors2016"], "3");

        activateLayer("1");


//        addAttractorsToWorld(['affiliation','citations'],100,'affiliation')
    });


//    loadGraph(datafile2,"authors2015",false).then(function(){
//        console.log(GRAPHS);
//        addGraphAsLayer(GRAPHS["authors2015"],"colab2");
//    }); 


    $("#new-layer").click(function () {
        let layerName = "" + (Object.keys(LAYERS).length + 1);
        addNewLayer(layerName);
        //    readDataColab(datafile,random_id());
        sortLayers(el);
//                /*setting events to the tools*/
//        var tools = document.getElementsByClassName("tool");
//        for (var i =0; i<tools.length; i++){
//            addToolEvents(tools[i]);
//        }
    });

}

main();

$(function () {
    $(this).bind("contextmenu", function (e) {
        e.preventDefault();
    });
});


/*---------------------------------GARBAGE--------------------------------------*/
///* FILLING DOWN THE NAME OF THE LAYER */
//
//$("input[id|='p']").click(function () {
//  // body...
//    console.log("clickeando")
//    console.log("cambia color");
//
//    let value = $(this).attr("id").split("-")[1];
//    let color = $("#color-"+value).css("background-color");
//    if (d3.selectAll("."+value).attr("filter") != null){
//        d3.selectAll("."+value).attr("filter",null);
//    }else{
//        d3.selectAll("."+value).attr("filter",function(d){return getFilter(color,value);});
//
//    }
//});
//
//$("input[id|='p']").dblclick(function () {
//  // body...
//    console.log("Doble_Clickeando");
//    // console.log();
//    $(this).attr("previous-layer-name",$(this).val().toLowerCase());
//    $(this).attr("readonly",false);
//    // console.log(this);
//
//});
////
//$("input[id|='p']").on('keypress',function(e) {
//    $(this).attr("readonly",true);
//    d3.select("."+$(this).attr("previous-layer-name")).attr("class",className);
//});

//$("p[id|='p']").click(function () {
//  // body...
//    console.log("clickeando");
//    console.log("cambia color");
//
//
//    let value = $(this).attr("id").split("-")[1];
//
//    d3.selectAll("."+value).attr()
//    // //$("."+value).css("box-shadow","10px 10px 5px red");
//    // //$("."+value).css("stroke","10px 10px 5px red");
//    // if (active_color=== value){
//    //     //console.log("COLOR");
//    //     //console.log(active_color);
//    //     $("."+value).css("box-shadow","10px 10px 5px red");
//    // }
//    // console.log(this);
//    // //   var value = evt.item.childNodes[1].innerText.trimRight().trimLeft().toLowerCase();
//
//    // // console.log(value);
//    // // reset_color(active_color);
//    // active_color = $(this).attr("id").split("-")[1];
//    // let color = "red";
//    // console.log("COLOR");
//    // console.log(active_color);
//    // console.log(color);
//    // if (color === active_color){
//        
//
//    //     console.log("IGUAL");
//    // }
//    
//});


function drawCircularPath(cx, cy, r) {

    var p = "M" + cx + "," + cy;
    p += "m" + -r + ",0";
    p += "a" + r + "," + r + " 0 1,0 " + (r * 2) + ",0";
    p += "a" + r + "," + r + " 0 1,0 " + -(r * 2) + ",0";
    return p;
}


function createHighlight(object, animate, hideAfter, color) {

    var highlight;
    let layerName = object.layerName;
//    console.log(object);
//    console.log(LAYERS[layerName])
    let drawer = LAYERS[layerName].layer;
    var waitingTime = 0;
    color = color || LAYERS[layerName].color;

    if (object.type === 'g') {



        if (!object.node.id.includes("path")) {
            let firstChild = getElementFromGroup(object, 'circle');

//                        console.log(object.id.includes("path"));

            let cx = firstChild.cx();
            let cy = firstChild.cy();
            let r = firstChild.attr('r') + firstChild.attr('stroke-width') / 2 + 2;

            highlight = drawer.path()
                    .M({x: cx - r, y: cy})
                    .a(r, r, 0, 1, 0, {x: r * 2, y: 0})
                    .a(r, r, 0, 1, 0, {x: -r * 2, y: 0})
                    .attr({
                        stroke: color,
                        fill: 'transparent',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    });

//                console.log(highlight);

            //                console.log("highlight.cx(): " + highlight.cx(100));
            //                console.log("highlight.cy(): " + highlight.cy(100));
            firstChild.highlight = highlight;


        } else {
            let firstChild = getElementFromGroup(object, 'path');

            let coords1 = firstChild.getSegment(0).coords;
            let coords2 = firstChild.getSegment(1).coords;

            highlight = drawer.path()
                    .M({x: coords1[0], y: coords1[1]})
                    .Q({x: coords2[0], y: coords2[1]}, {x: coords2[2], y: coords2[3]})
                    .attr({
                        stroke: color,
                        fill: 'transparent',
                        'stroke-width': 3,
                        'pointer-events': 'none'
                    });

            highlight.back();
            firstChild.highlight = highlight;

        }
    }
    object.add(highlight);

    highlight.filter(function (add) {
        add.gaussianBlur(2)
                .componentTransfer({
                    rgb: {type: 'discrete', tableValues: [0, 2, 0.4, 0.6, 0.8, 1]}
                });
    });

    if (animate) {
        waitingTime = 500;
        highlight.drawAnimated({
            duration: 500
        });
    }

    if (hideAfter) {
        setTimeout(function () {
            highlight.animate().attr({opacity: 0});
        }, waitingTime);
    }

    highlight.hide();


}

function addAttributesDraggingEvents(element, attributeName, isDiscrete) {

    let mc = new Hammer(element);
    mc.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    let group = null;
    let rect = null;
    let label = null;
    let startingPoint = null;
    let currentPoint = null;
    let theDistance = null;
    let theDroppingZone = null;
    let activeLayer = null;
    let drawer = null;
    let direction = null;

    mc.on("panstart", function (ev) {

        drawer = getActiveLayer().layer;
        startingPoint = {x: ev.srcEvent.pageX - $("#accordionSidebar").width(), y: ev.srcEvent.pageY - 70};

        label = drawer.text(attributeName).attr({
            fill: 'black',
            "text-anchor": "middle",
            "alignment-baseline": "hanging",
            "dominant-baseline": "middle",
            "font-size": "18px"
        }).move(startingPoint.x, startingPoint.y - 10);

        rect = drawer.rect(Math.min(label.rbox().w + 10, 82), 30).attr({
            fill: '#d8d9df',
            rx: 5,
            ry: 5,
            stroke: "#858796",
            class: 'toolable proxy',
            value: attributeName,
            isDiscrete: isDiscrete
        }).center(startingPoint.x, startingPoint.y);

        rect.values = [];

        group = drawer.group();
        group.add(rect);
        group.add(label);

    });

    mc.on("panmove", function (ev) {

        currentPoint = {x: ev.srcEvent.pageX - $("#accordionSidebar").width(), y: ev.srcEvent.pageY - 70};
        group.move(currentPoint.x - startingPoint.x, currentPoint.y - startingPoint.y);

        activeLayer = getActiveLayer();
        let threshold = 300;
        let distanceToLeft = currentPoint.x - (activeLayer.left.rect.x() + activeLayer.left.rect.width());
        let distanceToBottom = activeLayer.bottom.rect.y() - currentPoint.y;

        activeLayer.bottom.rect.attr({opacity: 0});
        activeLayer.left.rect.attr({opacity: 0});

        if (distanceToLeft < distanceToBottom) {
            theDistance = distanceToLeft;
            theDroppingZone = activeLayer.left;
            direction = "vertical";
        } else {
            theDistance = distanceToBottom;
            theDroppingZone = activeLayer.bottom;
            direction = "horizontal";
        }

        if (theDistance < threshold) {
            theDroppingZone.rect.attr({opacity: 1 - (theDistance / threshold)});

            if (theDistance < 0) {
                if (!theDroppingZone.valueLabels) {

                    let x = null;
                    let y = null;
                    let space = null;
                    rect.direction = direction;

                    if (direction === "horizontal") {
                        x = activeLayer.bottom.line.x();
                        y = theDroppingZone.rect.cy() - 25;
                        space = activeLayer.bottom.line.width();
                    } else {
                        x = activeLayer.left.rect.cx();
                        y = activeLayer.left.line.y();
                        space = activeLayer.left.line.rbox().h;
                    }

                    addAttributeValues(attributeName, theDroppingZone, x, y, space, drawer, direction, rect);

                } else {
                    setVisibilityOfAttributeValues(theDroppingZone, 0.5);
                }
            } else {
                setVisibilityOfAttributeValues(theDroppingZone, 0);
            }

        } else {
            theDroppingZone.rect.attr({opacity: 0});
            theDroppingZone = null;
        }
    });

    mc.on("panend", function (ev) {

        blink(group);

        setTimeout(function () {

            // attribute dropped inside a dropping area
            if (theDroppingZone && theDistance < 0) {

                let x = null;
                let y = null;

                if (direction === "horizontal") {
                    x = -startingPoint.x + activeLayer.bottom.line.x() + activeLayer.bottom.line.rbox().w + rect.rbox().w / 2 + 5;
                    y = theDroppingZone.line.cy() - startingPoint.y;
                } else {
                    x = -startingPoint.x + theDroppingZone.rect.width();
                    y = -startingPoint.y + rect.height() / 2 + 5;
                }

                group.animate(250).move(x, y);

                theDroppingZone.rect.animate(250).attr({opacity: 0});

                setTimeout(function () {

                    theDroppingZone.line.animate(250).attr({opacity: 1});
                    setVisibilityOfAttributeValues(theDroppingZone, 1, false);

                }, 350);


            } else {
                removeWithAnimation(group);
                activeLayer.bottom.rect.animate(250).attr({opacity: 0});
                activeLayer.left.rect.animate(250).attr({opacity: 0});
            }

        }, 300);



    });

}

function setVisibilityOfAttributeValues(droppingZone, opacity, progressive) {
    if (droppingZone.valueLabels) {
        droppingZone.valueLabels.forEach(function (label, index) {
            if (progressive) {
                setTimeout(function () {
//                    blink(label);
                    label.attr({opacity: opacity});
                }, 25 * index);
            } else {
                label.attr({opacity: opacity});
            }
        });
    }
}

function addAttributeValues(attributeName, droppingZone, x, y, width, drawer, direction, proxy) {

    let values = getAttributeValues(attributeName);
//    let values = {min: -102, max: 785};
    
    let activeLayer = getActiveLayer();
    let isCategorical = $.isArray(values);

    let space = width / values.length;
    droppingZone.valueLabels = new Array();

    let finalX = null;
    let finalY = null;

    let labelAttributes = {
        fill: activeLayer.color,
        "text-anchor": direction === "horizontal" ? "middle" : "end",
        "alignment-baseline": "hanging",
        "dominant-baseline": "middle",
        "font-size": "14px",
        class: 'toolable',
        attrType: attributeName
    };

    if (isCategorical) {

        values.forEach(function (value, index) {

//            let parts = direction === "horizontal" ? value.match(/.{1,11}/g) : value.match(/.{1,13}/g);
            let parts = direction === "horizontal" ? value.match(/.{1,11}/g) : value.match(/.{1,7}/g);

            if (direction === "horizontal") {
                finalX = x + (space * index);
                finalY = y;
            } else {

                finalX = x;
                finalY = y - (space * index);
            }

            let label = drawer.text(function (add) {
                parts.forEach(function (part) {
                    if (direction === "vertical") {
                        add.tspan(part.trim()).dy(15).attr('x', finalX + 47);
                    } else {
                        add.tspan(part.trim()).dy(15).attr('x', finalX);
                    }
                });
            });

            label.attr(labelAttributes);

            label.direction = direction;
            addAttributeValuesEvents(label, attributeName);
            label.move(finalX, finalY);
            proxy.values.push(label);
            droppingZone.valueLabels.push(label);

        });

    } else {

        // this is a continuous data attribute
        let minTick;
        let maxTick;
        let minLabel = drawer.text('' + values.min).attr(labelAttributes);

        if (direction === "horizontal") {
            minLabel.move(x, y + 10);
        } else {
            minLabel.move(activeLayer.left.line.x() - 15, activeLayer.bottom.line.y() - minLabel.rbox().h / 2);
        }

        let majorTicksAttributes = {stroke: 'black', 'stroke-width': 1.5};
        let minorTicksAttributes = {stroke: 'grey', 'stroke-width': 1};
        let shiftMax = 0;
        let maxLabel = drawer.text('' + values.max).attr(labelAttributes);
        if (direction === "horizontal") {
            finalX = x + width + shiftMax;
            finalY = y + 10;
            minTick = drawer.line(x, y - 2, x, y + 10).attr(majorTicksAttributes);
            maxTick = drawer.line(finalX, y - 2, finalX, y + 10).attr(majorTicksAttributes);
        } else {
            finalX = activeLayer.left.line.x() - 15, y + 10;
            finalY = activeLayer.left.line.y();
            minTick = drawer.line(activeLayer.left.line.x(), minLabel.cy(), activeLayer.left.line.x() - 10, minLabel.cy()).attr(majorTicksAttributes);
        }
        maxLabel.move(finalX, finalY);

        // this has to be done after the maxLabel has been moved
        if (direction === "vertical") {
            maxTick = drawer.line(activeLayer.left.line.x(), maxLabel.cy(), activeLayer.left.line.x() - 10, maxLabel.cy()).attr(majorTicksAttributes);
        }

        droppingZone.valueLabels.push(minLabel);
        droppingZone.valueLabels.push(maxLabel);
        droppingZone.valueLabels.push(minTick);
        droppingZone.valueLabels.push(maxTick);

        let nMajorTicks = 10;
        let init;
        let end;

        if (direction === "horizontal") {
            init = minLabel.cx();
            end = maxLabel.cx();
        } else {
            init = minLabel.cy();
            end = maxLabel.cy();
        }

        let increment = (Math.max(init, end) - Math.min(init, end)) / nMajorTicks;

        // adding the major tick marks
        var upperLimit = Math.max(init, end);

        for (var pos = Math.min(init, end); pos < upperLimit; pos += increment) {
            let shouldAddMajorTick = direction === "horizontal" ? pos !== init : pos !== end;
            if (shouldAddMajorTick) {
                let majorTick;
                let interpolation = Math.round(interpolate(pos, init, end, values.min, values.max) * 100) / 100;
                let majorLabel = drawer.text('' + interpolation).attr(labelAttributes);

                if (direction === "horizontal") {
                    majorTick = drawer.line(pos, activeLayer.bottom.line.y(), pos, activeLayer.bottom.line.y() + 10).attr(majorTicksAttributes);
                    majorLabel.move(pos, y + 10);
                } else {
                    majorTick = drawer.line(activeLayer.left.line.x(), pos, activeLayer.left.line.x() - 10, pos).attr(majorTicksAttributes);
                    majorLabel.move(activeLayer.left.line.x() - 15, pos - majorLabel.rbox().h / 2);
                }
                droppingZone.valueLabels.push(majorTick);
                droppingZone.valueLabels.push(majorLabel);
            }

            // adding the minor tick marks
            let nMinorTicks = 10;
            for (var i = pos; i < pos + increment && i < upperLimit; i += (increment / nMinorTicks)) {
                if (i !== pos) {
                    let minorTick;
                    if (direction === "horizontal") {
                        minorTick = drawer.line(i, activeLayer.bottom.line.y(), i, activeLayer.bottom.line.y() + 7).attr(minorTicksAttributes);
                    } else {
                        minorTick = drawer.line(activeLayer.left.line.x(), i, activeLayer.left.line.x() - 7, i).attr(minorTicksAttributes);
                    }
                    droppingZone.valueLabels.push(minorTick);
                }
            }






        }

    }


}

function addAttributesAsTools(attributesSet) {

    for (var index in attributesSet) {
        let attribute = attributesSet[index];
        var bar = document.getElementById('set-tools');
        var attrTool = document.getElementById('tool-element').content.cloneNode(true);

        $(attrTool.querySelector("button")).html(attribute);
        $(attrTool.querySelector("button")).attr("id", attribute);
        $(attrTool.querySelector("button")).addClass("attributeTool");

        $("#search-bar-container").before(attrTool);
        // true because everything is discrete now
        addAttributesDraggingEvents($("#" + attribute)[0], attribute, true);

    }

}



function getAxisBasisSpace(axisX) {
    var size = 50;
    var spaceBtwnAttractors = 10;
    if (axisX) {
        return generalWidth * 0.01 + spaceBtwnAttractors + size;
    } else {
        return generalHeight * 0.01 + spaceBtwnAttractors + size;
    }
}

function calculateAttractorSizeNdStartingPoints(ammount, distance, axisLength, startingAxisPoint) {
    // set taking into account radius of the nodes

    var startingPoints = [];

    var sizeAttractor = (axisLength - (ammount + 1) * distance) / ammount;

    // TODO : Change taking into account the length of the text

    for (var i = 0; i < ammount; i++) {
        if (i === 0) {
            startingAxisPoint += distance;
        } else {
            startingAxisPoint += sizeAttractor + distance;
        }
        startingPoints.push(startingAxisPoint);
    }

    return [sizeAttractor, startingPoints];
}
//
function getValuesByAttributeDict(elements, textSet) {
    var uniqueAttrValues = {};
    for (var index in textSet) {
        var text = textSet[index];
        uniqueAttrValues[text] = {};

        for (var elIndex in elements) {
            var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;
            if (Object.keys(data).includes(text)) {

                if (Object.keys(uniqueAttrValues[text]).includes(data[text])) {
//                    console.log(uniqueAttrValues[text][data[text]]);

                    uniqueAttrValues[text][data[text]].push(elements[elIndex]);
//                    uniqueAttrValues[text.toString()].push("prueba");

                } else {
                    uniqueAttrValues[text][data[text]] = [elements[elIndex]];
//                    uniqueAttrValues[text][data[text]] = [elements[elIndex]];  

                }
            }
        }
    }
    return uniqueAttrValues;
}

function getAttributeValues(attributeName) {

    var nodes = getActiveLayer().layer.select('g.node').members;
    var activeLayerAtributesLabels = getActiveLayer().attributes;

    console.log(attributeName);
    console.log(getValuesByAttributeDict(nodes, activeLayerAtributesLabels)[attributeName]);
    return Object.keys(getActiveLayer().data[attributeName]);

}

function addAttractorsToWorld(distance, chosen) {
    var textSet = getActiveLayer().attributes;

    var Bodies = Matter.Bodies;
    var World = Matter.World;
    var Composite = Matter.Composite;

    var world = getPhysicsEngine(getActiveLayerName()).world;

    var elements = getActiveLayer().layer.select('g.node').members;

    var uniqueAttrValues = getValuesByAttributeDict(elements, textSet);

    var attractees = uniqueAttrValues[chosen];

//    console.log(attractees);

    var positionData = calculateAttractorSizeNdStartingPoints(Object.keys(attractees).length, distance, generalWidth, 0);
    var width = positionData[0];
    var positions = positionData[1];
//    var width = 130;
    console.log(width);
    console.log(positions);
    var height = 50;
    var y = generalHeight / 1.1 - height + distLabelGroup / 2;


//    console.log(Object.keys(attractees));
    for (var attractIndex in Object.keys(attractees)) {
        console.log(positions[attractIndex]);
        var attractorGraphics = getActiveLayer().layer.rect(width, height).move(positions[attractIndex], y).fill(getActiveLayer().color);

        addAttractorToWorld(world, attractorGraphics);

        //    addElementsToWorld(world,'1');

        var attractor = attractorGraphics.matter;
        var aff = Object.keys(attractees)[attractIndex];

        var label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex] + width / 2, y + height / 2 - 5, 'authors2016', aff).attr({fill: "white"});
//            label.center(x+width/2,y+height/2);

        for (var elIndex in elements) {
            var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;


            var body = elements[elIndex].matter;

            if (Object.keys(data).includes(chosen)) {
//                    console.log(aff);
//                    console.logdata[chosen]);
//                    console.log(data[chosen].toString()===aff);
                if (data[chosen].toString() === aff) {
                    //add attractee
                    //        console.log(attractee);
                    if (!body) {
                        addElementToWorld(world, elements[elIndex]);
                        body = elements[elIndex].matter;
                    } else {
                        // IMPORTANT: we need to do this to update objects that are attracted to more than one attractor
                        Matter.Composite.remove(world, body);
                        World.add(world, body);
                    }

                    if (!body.attractedTo) {
                        body.attractedTo = new Array();
                    }
                    body.attractedTo.push(attractor);
                }
            }
        }

//              = x + 50 + distance;

    }

}

function calculatePositionsByOrientation(ammount, distance, width, height, orientation) {
    var axisX = null;
    var zeroPoint = null;
    var positionData = null;

    if (orientation === 'down') {
        positionData = calculateAttractorSizeNdStartingPoints(ammount, distance, width - getAxisBasisSpace(true), getAxisBasisSpace(true));
        axisX = true;
        zeroPoint = height * 0.95;

    } else if (orientation === 'left') {
        positionData = calculateAttractorSizeNdStartingPoints(ammount, distance, height, 0);
        axisX = false;
        zeroPoint = height * 0.01;
    } else if (orientation === 'right') {
        positionData = calculateAttractorSizeNdStartingPoints(ammount, distance, height, 0);
        axisX = false;
        zeroPoint = width * 0.95;

    } else if (orientation === 'up') {
        positionData = calculateAttractorSizeNdStartingPoints(ammount, distance, width - getAxisBasisSpace(true), getAxisBasisSpace(true));
        axisX = true;
        zeroPoint = height * 0.01;
    }
    console.log(axisX, zeroPoint, positionData);
    return [axisX, zeroPoint, positionData];
}

function sortByAttributeWalls(distance, chosen, orientation) {


    var textSet = getActiveLayer().attributes;
    var elements = getActiveLayer().layer.select('g.node').members;

    var Bodies = Matter.Bodies;
    var World = Matter.World;
    var Composite = Matter.Composite;

    var world = getPhysicsEngine(getActiveLayerName()).world;

    var uniqueAttrValues = getValuesByAttributeDict(elements, textSet);
    var attractees = uniqueAttrValues[chosen];
    var positionData = calculatePositionsByOrientation(Object.keys(attractees).length, distance, generalWidth, generalHeight, orientation);

    var width = positionData[2][0];
    var height = 50;
    var positions = positionData[2][1];
    var fixedAxis = positionData[1];
    var axisX = positionData[0];

    for (var attractIndex in Object.keys(attractees)) {
        var aff = Object.keys(attractees)[attractIndex];
        var attractorGraphics = null;
        var label = null;
        if (axisX && !getActiveLayer().axis.x) {

            attractorGraphics = getActiveLayer().layer.rect(width, height).move(positions[attractIndex], fixedAxis).fill(getActiveLayer().color).attr({"class": "attractor"});

            label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex] + width / 2, fixedAxis + height / 2 - 5, 'authors2016', aff).attr({fill: "white"});

            addAttractorToWorld(world, attractorGraphics);


            //    addElementsToWorld(world,'1');

            var attractor = attractorGraphics.matter;
            var aff = Object.keys(attractees)[attractIndex];

//            var label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex]+width/2,y+height/2-5, 'authors2016', aff).attr({fill:"white"});
//            label.center(x+width/2,y+height/2);

            for (var elIndex in elements) {

                var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;

                var body = elements[elIndex].matter;

                if (Object.keys(data).includes(chosen)) {
//                    console.log(aff);
//                    console.logdata[chosen]);
//                    console.log(data[chosen].toString()===aff);
                    if (data[chosen].toString() === aff) {
                        //add attractee
                        //        console.log(attractee);
                        if (!body) {
                            addElementToWorld(world, elements[elIndex]);
                            body = elements[elIndex].matter;
                        } else {
                            // IMPORTANT: we need to do this to update objects that are attracted to more than one attractor
                            Composite.remove(world, body);
                            World.add(world, body);
                        }

                        if (!body.attractedTo) {
                            body.attractedTo = new Array();
                        }
                        body.attractedTo.push(attractor);
                    }
                }
            }















//            for (var elIndex in elements){
//                var data = getElementFromGroup(elements[elIndex],'circle').nodeData.authorInfo;
//                let element = elements[elIndex];
//                if (Object.keys(data).includes(chosen)){
//                    if (data[chosen].toString()=== aff){
//                    //add attractee
//                        let pointX = getRectMiddle(attractorGraphics)[0]-element.cx();
//                        elements[elIndex].animate(500).dx(pointX).during(function(){
//                            updateEdgesEnds(getElementFromGroup(element,'circle'),element.cx()-element.childDX,element.cy()-element.childDY);
//                        });
//                    }
//                }
//            } 
        } else if (!axisX && !getActiveLayer().axis.y) {
            attractorGraphics = getActiveLayer().layer.rect(height, width).move(fixedAxis, positions[attractIndex]).fill(getActiveLayer().color);
            label = drawLabel(getActiveLayer().layer, aff, fixedAxis + height / 2 - 5, positions[attractIndex] + width / 2, 'authors2016', aff).attr({fill: "white"}).transform({rotation: 270});
            for (var elIndex in elements) {
                var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;
                let element = elements[elIndex];
                if (Object.keys(data).includes(chosen)) {
                    if (data[chosen].toString() === aff) {
                        //add attractee
                        let pointY = getRectMiddle(attractorGraphics)[1] - element.cy();
                        elements[elIndex].animate(500).dy(pointY).during(function () {
                            updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
                        });
                    }
                }
            }

        }

    }

    if (axisX) {
        getActiveLayer().axis.x = true;
    } else {
        getActiveLayer().axis.y = true;
    }
}

function setWalls(distance, chosen, orientation) {

    var textSet = getActiveLayer().attributes;
    var elements = getActiveLayer().layer.select('g.node').members;

    var Bodies = Matter.Bodies;
    var World = Matter.World;
    var Composite = Matter.Composite;

    var world = getPhysicsEngine(getActiveLayerName()).world;


    var uniqueAttrValues = getValuesByAttributeDict(elements, textSet);
    var attractees = uniqueAttrValues[chosen];
    var positionData = calculatePositionsByOrientation(Object.keys(attractees).length, distance, generalWidth, generalHeight, orientation);

    var width = positionData[2][0];
    var height = 50;
    var positions = positionData[2][1];
    var fixedAxis = positionData[1];
    var axisX = positionData[0];
    for (var attractIndex in Object.keys(attractees)) {
        var position = positions[attractIndex];
        var aff = Object.keys(attractees)[attractIndex];
        let wall1 = getActiveLayer().layer.rect(5, 0).move(position + width / 2 - nodeRadius / 2 - 5, fixedAxis - generalHeight).fill(getActiveLayer().color).back();
//            let wall2 = getActiveLayer().layer.rect(5,generalHeight).move(position+width- nodeRadius*2+5,fixedAxis-generalHeight).fill(getActiveLayer().color).attr({"class":"wall"}).back();
//            let wall1 = getActiveLayer().layer.rect(5,0).move(position,fixedAxis-generalHeight).fill(getActiveLayer().color).attr({"class":"attractor"}).back();
//          let wall1 = getActiveLayer().layer.rect(5,0).move(position,fixedAxis-generalHeight).fill(getActiveLayer().color).attr({"class":"attractor"}).back();
//          wall1.transform({scaleY:-1});
        var time = 500;
        wall1.animate(time).height(generalHeight).after(function () {
            addDragEvents(new Hammer(wall1.node), wall1, wall1);
            addAttractorToWorld(world, wall1);
        });
//            
        let wall2 = getActiveLayer().layer.rect(5, 0).move(position + width / 2 + nodeRadius / 2 + 5, fixedAxis - generalHeight).fill(getActiveLayer().color).back();
        wall2.animate(time).height(generalHeight).after(function () {
            addDragEvents(new Hammer(wall2.node), wall2, wall2);
            addAttractorToWorld(world, wall2);
        });
    }
}

var crossedPoint = false;

function buildWall(graphicObject, width, height, originPosition, mode, insideSpace, orientation) {
    var world = getPhysicsEngine(getActiveLayerName()).world;

    if (mode === 'both') {
        if (!graphicObject.walls) {
            var wallWidth = width;
            var wallHeight = height;
            var originXleft = originPosition[0] - insideSpace;

            var originXright = originPosition[0] + insideSpace - width;

            var originY = originPosition[1];
            var staticAxis = 'x';
//            getActiveLayer().layer.circle(3).center(originXleft,originY).fill('green').front();
            let wall1 = getActiveLayer().layer.rect(wallWidth, 0).move(originXleft, originY).fill(getActiveLayer().color).back();

            addAttractorToWorld(world, wall1);
            addDragEvents(new Hammer(wall1.node), wall1, wall1);


            let wall2 = getActiveLayer().layer.rect(width, 0).move(originXright, originY).fill(getActiveLayer().color).back();



            addAttractorToWorld(world, wall2);
            addDragEvents(new Hammer(wall2.node), wall2, wall2);




            graphicObject.walls = [wall1, wall2];

        } else {
            var currentHeight = null;
            if (graphicObject.walls[0].height() === 0) {
                currentHeight = 1;
            } else {
                currentHeight = graphicObject.walls[0].height();
            }

            var step = height - graphicObject.walls[0].height();
            var wall1 = graphicObject.walls[0];
            var wall2 = graphicObject.walls[1];


            wall1.height(height);
//            console.log("height: "+height);
//            console.log("step: "+step);
//            if(step<0&&height===0){
//                graphicObject.crossedPoint = !graphicObject.crossedPoint ;
//            }
//            
//            if (!graphicObject.crossedPoint){
            wall1.y(wall1.y() - step);
            wall2.y(wall2.y() - step);
//            }

            wall2.height(height);
//            if (orientation==="up"){
//                console.log("orientation");
//                var scale =  height / currentHeight;
//                Matter.Body.scale(wall1.matter,1,scale);
//                Matter.Body.scale(wall2.matter,1,scale);
//            }
//            
//            Matter.Body.setPosition(wall1.matter,{x:wall1.cx(),y:wall1.cy()});
//
//            Matter.Body.setPosition(wall2.matter,{x:wall2.cx(),y:wall2.cy()});
//            
        }
    }
}

function sortByAttribute(distance, chosen, orientation) {

    var textSet = getActiveLayer().attributes;
    var elements = getActiveLayer().layer.select('g.node').members;
    var uniqueAttrValues = getValuesByAttributeDict(elements, textSet);
    var attractees = uniqueAttrValues[chosen];
    var positionData = calculatePositionsByOrientation(Object.keys(attractees).length, distance, generalWidth, generalHeight, orientation);

    var width = positionData[2][0];
    var height = 50;
    var positions = positionData[2][1];
    var fixedAxis = positionData[1];
    var axisX = positionData[0];

    for (var attractIndex in Object.keys(attractees)) {
        var aff = Object.keys(attractees)[attractIndex];
        var attractorGraphics = null;
        var label = null;
        if (axisX && !getActiveLayer().axis.x) {
            attractorGraphics = getActiveLayer().layer.rect(width, height).move(positions[attractIndex], fixedAxis).fill(getActiveLayer().color).attr({"class": "toolable", "attribute-type": chosen});
            label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex] + width / 2, fixedAxis + height / 2 - 5, 'authors2016', aff).attr({fill: "white"});
            attractorGraphics.labelGraphics = label;
//            for (var elIndex in elements) {
//                var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;
//                let element = elements[elIndex];
//                if (Object.keys(data).includes(chosen)) {
//                    if (data[chosen].toString() === aff) {
//                        //add attractee
//                        let pointX = getRectMiddle(attractorGraphics)[0] - element.cx();
//                        elements[elIndex].animate(500).dx(pointX).during(function () {
//                            updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
//                        });
//                    }
//                }
//            }
        } else if (!axisX && !getActiveLayer().axis.y) {
            attractorGraphics = getActiveLayer().layer.rect(height, width).move(fixedAxis, positions[attractIndex]).fill(getActiveLayer().color);
            label = drawLabel(getActiveLayer().layer, aff, fixedAxis + height / 2 - 5, positions[attractIndex] + width / 2, 'authors2016', aff).attr({fill: "white"}).transform({rotation: 270});
            for (var elIndex in elements) {
                var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;
                let element = elements[elIndex];
                if (Object.keys(data).includes(chosen)) {
                    if (data[chosen].toString() === aff) {
                        //add attractee
                        let pointY = getRectMiddle(attractorGraphics)[1] - element.cy();
                        elements[elIndex].animate(500).dy(pointY).during(function () {
                            updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
                        });
                    }
                }
            }

        }

    }

//    setWalls(10,'affiliation','down');

    if (axisX) {
        getActiveLayer().axis.x = true;
    } else {
        getActiveLayer().axis.y = true;
    }
}

function positionElementsByAttribute(attributeGraphics, attributeValue, attributeTypeName, orientation) {
    var elements = getActiveLayer().layer.select('g.node').members;
//        console.log("Position element");
//    console.log(elements);
    for (var elIndex in elements) {
//        console.log("position "+ elements[elIndex]);
        var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;
//        console.log(data);
        let element = elements[elIndex];

        if (data[attributeTypeName].toString() === attributeValue) {
            let pointX = null;
            let pointY = null;
            if (attributeGraphics.type === 'rect') {
                if (orientation === "horizontal") {
                    pointX = getRectMiddle(attributeGraphics)[0] - element.cx();
                    console.log(" For " + attributeValue);
                    console.log(pointX);
                    elements[elIndex].animate(500).dx(pointX).during(function () {
                        updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
                    });

                } else {
                    pointY = getRectMiddle(attributeGraphics)[1] - element.cy();
                    console.log(" For " + attributeValue);
                    console.log(pointY);
                    elements[elIndex].animate(500).dy(pointY).during(function () {
                        updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
                    });
                }
            } else if (attributeGraphics.type === 'text') {
                if (orientation === "horizontal") {
                    pointX = attributeGraphics.node.getBBox().x + (attributeGraphics.node.getBBox().width / 2) - element.cx();

                    console.log(" For " + attributeValue);
                    console.log(pointX);
                    elements[elIndex].animate(500).dx(pointX).during(function () {
                        updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
                    });

                } else {
                    pointY = attributeGraphics.node.getBBox().y + (attributeGraphics.node.getBBox().height / 2) - element.cy();
                    console.log(" For " + attributeValue);
                    console.log(pointY);
                    elements[elIndex].animate(500).dy(pointY).during(function () {
                        updateEdgesEnds(getElementFromGroup(element, 'circle'), element.cx() - element.childDX, element.cy() - element.childDY);
                    });
                }
            }

        }

    }
}

function highlightNodesByAttributeValue(attributeValue, attributeName, show) {

    var groups = getActiveLayer().data[attributeName][attributeValue];
    for (var index in groups) {
        let circle = getElementFromGroup(groups[index], 'circle');

        if (show) {
            blink(groups[index]);
            circle.highlight.show();
        } else {
            circle.highlight.hide();
        }
    }

}

function addAttributeValueAsAttractor(attributeGraphics, attributeValue, attributeTypeName) {

    var World = Matter.World;
    var Composite = Matter.Composite;

    var world = getPhysicsEngine(getActiveLayerName()).world;

    addAttractorToWorld(world, attributeGraphics);

    var attractor = attributeGraphics.matter;

    var elements = getActiveLayer().data[attributeTypeName][attributeValue];
//    
    for (var elIndex in elements) {
//
        var body = elements[elIndex].matter;
//
        if (!body) {
            addElementToWorld(world, elements[elIndex]);
            body = elements[elIndex].matter;
        } else {
//            // IMPORTANT: we need to do this to update objects that are attracted to more than one attractor
            Composite.remove(world, body);
            World.add(world, body);
        }
////        console.log(elements[]);
        if (!body.attractedTo) {
            body.attractedTo = new Array();
        }
        body.attractedTo.push(attractor);
//
    }

}