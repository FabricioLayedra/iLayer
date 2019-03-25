
/*--------------------------------CONSTANTS-------------------------------------*/
var count = 0;

var distLabelGroup = 0;

var selectionMode = false;

var datafile = "https://raw.githubusercontent.com/FabricioLayedra/CiverseData/master/authors_relations_SC_JD_sample2015.json";
//var datafile = "./data/authors_relations_SC_JD_sample2015.json";

//var datafile = "./data/authors_relations_63nodes_sample2016.json";
//var datafile = "./data/authors_relations_2015.json";
var datafile2 = "./data/authors_relations_2015.json";


var LAYERS = {};

var GRAPHS = {};

var SELECTION = [];

var COLORS = ["#1F77B4","#FF7F0E","#2CA02C","#D62728","#9467BD","#8C564B","#E3775E","#7F7F7F","#BCBD22","#17BECF"];

var el = document.getElementById("layers-table");

var active = null;

var activeLayer = null;

var setCanvases = $("#content");

var generalWidth = setCanvases.width();
var generalHeight = $(document).height()-70;
console.log(generalWidth,generalHeight);



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
    if (Object.keys(LAYERS).length < 10){
        return COLORS[Object.keys(LAYERS).length];
    }else{
        alert("No more available layers.")
    }
}

/*----------------------------CREATION OF LAYERS--------------------------------*/

function addNewLayer(layerName) {
    var color = getColor();
    console.log(color);
    var layer = createLayer(layerName,color);
    $("#layers-table").append(layer);
    addColorsAndBorders(layerName,color);
    addEvents(layerName);
    sortLayers($("#layers-table"));
}

function createLayer(layerName,color) {
//    var canvas = document.createElement("div");
    var container = document.getElementById("set-canvases");
    var canvas = createSVG(container,layerName, generalWidth, generalHeight,color);

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
    return layer;
}

function createSVG(container,layerName, width, height, color) {
    var draw = SVG(container).size(width, height).attr({"id":"layer-"+layerName});
//    window.draw = draw;
    LAYERS[layerName] = {"layer": draw, "physics-engine": null, color:color};
//    addLayerEvents(draw.node, draw);
    return draw.node;
}

function changeLayerNames(item, id) {
        
    $(item.querySelector("li[id^='layer']")).attr("id", "layerItem-" + id);
    $(item.querySelector("div[id^='color']")).attr("id", "color-" + id);
    $(item.querySelector("div[id^='container-item']")).attr("id", "container-item-" + id);
    $(item.querySelector("input[id^='item']")).attr("id", "item-" + id);
    $(item.querySelector("input[id^='item']")).attr("value", "Layer " + id);
    $(item.querySelector("i[id^='visibility']")).attr("id", "visibility-" + id);
    $(item.querySelector("i[id^='delete']")).attr("id", "delete-" + id);
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

function addColorsAndBorders(layerName,color){
    $("#color-"+layerName).attr("style", "background-color: " + color + "; height: auto; width: 5px; background-clip: content-box");
    $("#container-item-"+layerName).attr("style","border:  solid 1px "+color);
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
    
    $("#container-item-"+id).on('pointerdown', function(){
        console.log(this);
        activateLayer(id);
//        includeSelection(layerName);
    });
}

function activateLayer(layerName){
//    console.logitem);
    if (active){
        $(active).css("background-color","");
    }
    active = $("#container-item-"+layerName);
    activeLayer = LAYERS[layerName];
    
    var layers = getLayersNames(LAYERS);
    for (var i = 0; i < layers.length; i++) {
	let layer = "#layer-" + layers[i];
        if (layers[i]===layerName){
            SVG.get(layer).attr({'pointer-events':'auto'});
        }else{
            SVG.get(layer).attr({'pointer-events':'none'});
        }
//        $("#set-canvases").prepend($("#layer-" + layer).detach());
    }
       

    $(active).css("background-color",lightenDarkenColor(LAYERS[layerName]["color"],20));
}

function showHideLayer(layerName) {
    var layer = "#" + layerName;
    
//    if (checkbox.checked) {
//        $(layer).css("display", "block");
//    } else {
//        $(layer).css("display", "none");
//    }
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
        var element = elements[i];
        if (element.type === "circle") {
            if (actualWorldElements.includes(element.matter)) {
                console.log("YA INGRESADO")
            } else {
                var x = element.cx();
                var y = element.cy();
                var radius = element.attr("r");

                var matterObject = Bodies.circle(x, y, radius);

                //nodeData.matter = matterObjasect;
                matterObject.svg = element;
                element.matter = matterObject;


                World.add(world, matterObject);
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
    for (var i = 0; i <children.length; i++) {
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

//    var render = Render.create({
//        element: document.body,
//        engine: engine,
//        options: {
//         width: generalWidth,
//         height: generalHeight
//       }
//    });
//    Render.run(render);
//    

    // create demo scene
    var world = engine.world;
    world.gravity.scale = 0;
    
    var strongness = 300;
    
//   var length = 120000;
//   var dimensions = [1200,800];
//   var tickerLength = 300;
//    
    var roof = Bodies.rectangle(generalWidth/2,-(strongness/2)+5, generalWidth,strongness, {isStatic: true});
    var leftWall = Bodies.rectangle(-(strongness/2)+10,0+generalHeight/2,  strongness, generalHeight, {isStatic: true});
    var rightWall = Bodies.rectangle(0+generalWidth+strongness/2-20, 0+generalHeight/2, strongness, generalHeight, {isStatic: true});
    console.log(generalWidth);
    
    var ground = Bodies.rectangle(0+generalWidth/2,generalHeight+100-distLabelGroup/2,generalWidth,200, {isStatic: true});
    console.log(ground);
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

function removeWorld(engine){
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

function addGravity(engine,x,y,factor) {
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
    engine.world.gravity.x =x;
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
        let circle = getElementFromGroup(group,"circle");
//        count+=1;
//        console.log(count);
//        console.log(circle);
//        if (element.type === "circle") {  
        if (circle){
            var x = group.cx()-group.childDX;
//            console.log(circle.cx());
//            console.log(group.cx()-group.childDX);

            var y = group.cy()-group.childDY;
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
        }
    }
}

function add_element_to_world(world, element) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;

    if (element.type === "circle" && !element.matter) {

        var x = element.cx();
        var y = element.cy();
        var radius = element.attr("r");

        var matterObject = Bodies.circle(x, y, radius);
        matterObject.frictionAir = 0.025;

        //nodeData.matter = matterObject;
        matterObject.svg = element;
        element.matter = matterObject;

        World.add(world, matterObject);
    } else if (element.type === "path") {
        // Edges
    }
}

function add_attractor_to_world(world, element) {
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


    } else if (element.type === "path") {
        // Edges
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
            g.setNode(format_id(data["id"]), {authorInfo: {name: data["id"], group: data["group"]}});
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

function lightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255)
        r = 255;
    else if (r < 0)
        r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255)
        b = 255;
    else if (b < 0)
        b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255)
        g = 255;
    else if (g < 0)
        g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}

// Adds a graph as a layer in the tool
function addGraphAsLayer(g, layerName) {

//    var color = addNewLayer(layer_name);
//    var darkenColor = lightenDarkenColor(color, -10);

    addNewLayer(layerName);
    var color = '#688bd6';
    var darkenColor = lightenDarkenColor(color, -10);

//    drawGraph(LAYERS[layer_name].layer, g);
    drawGraph(layerName, g);
//    var svg_id = $("#" + layerName).children("svg").attr("id");
    var svg_id = "layer-" + layerName;

    console.log(svg_id);
    SVG.get(svg_id).select("circle").attr({fill: color, stroke: darkenColor, 'stroke-width': 2});
    
    
    var tools = document.getElementsByClassName("tool");
        for (var i =0; i<tools.length; i++){
            addToolEvents(tools[i],LAYERS[layerName].layer);
        }
}

function drawGraph(layer_name, g) {
    var draw = LAYERS[layer_name].layer;
    var graphId = g._label;
    var directed = g.directed;
    var nodeKeys = g.nodes();
    var edges = g.edges();

    // adding to the nodes objects of the graph both the fabric and the matter associated objects
    nodeKeys.forEach(function (nodeKey) {

        var nodeData = g.node(nodeKey);
//        if (directed){
        nodeData.inEdges = new Array();
        nodeData.outEdges = new Array();
//        }else{
//            nodeData.edges = new Array();
//        }

        var radius = 50;
        
        //HERE WE HAVE TO SET THE POSITION TAKING INTO ACCOUNT A LAYOUT
        var y = getRandomBetween(30,600);
        var x = getRandomBetween(30,800);
        
        //GOTTA CHANGE IF THE GRAPH STRUCTURE CHANGES
        var labelName = nodeData.authorInfo.name;
        
        //CREATION OF THE GROUP
        var group = draw.group().attr({id:"group-"+nodeKey,class:"node"});
        group.layerName = layer_name;
        group.firstTime = true;
        
        // creation of the elements
        var circle = drawCircleInLayer(draw, radius, x, y, nodeKey, directed, graphId);
        var label = drawLabel(draw, nodeKey, circle.cx(), circle.cy() + (radius/2), graphId,labelName);
        var r = circle.attr('r') + circle.attr('stroke-width') / 2 ;
        var ear = drawEarInCircle(draw,r,circle.cx(),circle.cy(),LAYERS[layer_name]["color"]);
        
        //addition of the elements
        group.add(ear);
        group.add(circle);
        group.add(label);
        
        //set the distance between the group and the circle
        group.childDX = group.cx()-getElementFromGroup(group,'circle').cx();
        group.childDY = group.cy()-getElementFromGroup(group,'circle').cy();
        
        //set the distance between the group and its label
        group.textDX = group.cx()-getElementFromGroup(group,'text').cx();
        group.textDY = group.cy()-getElementFromGroup(group,'text').cy();
        
        distLabelGroup  = radius/2;
        
        //addition of highlights and events
        createHighlight(group);
        addTouchEvents(group);
        addSelectionEvents(group);

        //circular references
        nodeData.svg = circle;
        nodeData.label = label;
        circle.nodeData = nodeData;

    });

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
                controlX, controlY, toCenterX, toCenterY, id, graphId,layer_name);
                
        var group = draw.group().attr({id:"path-"+id});
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

function addHighlightToGroups(groups){
//    console.log(groups);

    for (var i = 0; i<groups.length;i++){
//            console.log(groups[i].type);
        createHighlight(groups[i]);
    }
}

function drawCircleInLayer(drawer, radius, cx, cy, id, directed, graphId) {
    
    var nodeGraphics = drawer.circle(radius)
            .attr({cx: cx,
                cy: cy,
                id: id,
                graph: graphId
            })
            .move(cx, cy);
    
    //Add context_menu to the element using the selector, in this case the id
    addContextMenu("#" + id);
 
    return nodeGraphics;
}

function drawHaloInCircle(drawer,circle,distance,color){
    var halo = drawer.path()
                    .M({x: circle.cx() - (circle.attr('r') +distance), y: circle.cy()})
                    .a(circle.attr('r')+distance, circle.attr('r')+distance, 0, 1, 0, {x: (circle.attr('r')+distance) * 2, y: 0})
                    .a(circle.attr('r')+distance, circle.attr('r')+distance, 0, 1, 0, {x: -((circle.attr('r')+distance) * 2), y: 0})
                    .attr({
                        stroke: color,
                        fill: 'transparent',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    });
                

                
    return halo;
}

function drawEarInCircle(drawer,r,cx,cy,color){
    var ear = drawer.path()
                    .M({x: cx , y: cy-r})
                    .a(r, r, 0, 1, 0, {x: r, y: r})
                    .L({x: cx+r, y: cy-r})
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
        controlX, controlY, toCenterX, toCenterY, id, graphId,layerName) {
    var edgePath = drawer.path()
            .M({x: fromCenterX, y: fromCenterY})
            .Q({x: controlX, y: controlY}, {x: toCenterX, y: toCenterY})
            .attr({
                stroke: 'gray',
                fill: 'transparent',
                strokeWidth: 1,
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

function updateEdgesEnds(nodeGraphics, coordX, coordY,directed) {
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

        inEdge.highlight.replaceSegment(1,inEdge.getSegment(1))
//        break;

    });
    nodeGraphics.nodeData.outEdges.forEach(function (outEdge, i) {
//        console.log(outEdge);

        segment = outEdge.getSegment(0);
        segment.coords[0] = x;
        segment.coords[1] = y;
        outEdge.replaceSegment(0, segment);
        outEdge.highlight.replaceSegment(0,outEdge.getSegment(0))


        // to make it straight, we just set the control point at the starting one
        segment = outEdge.getSegment(1);
        segment.coords[0] = x;
        segment.coords[1] = y;
        outEdge.replaceSegment(1, segment);
        outEdge.highlight.replaceSegment(1,outEdge.getSegment(1))

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
    return $("#" + layer_name).children("svg").attr("id");
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
                                    },layer
                                ),
                                newLayerItem(function(){
                                    var destination = prompt("Enter the name of the layer:","");
                                    addNewLayer(destination);
                                    sortLayers(el);
                                    sendElementToLayer(sel,destination);
                                }))
                    },
                    "ego": {
                        "name": "Send adjacents to...",
                        "items": Object.assign({},
                                generateLayersNamesMenu(
                                    data,
                                    function (destination) {
                                        sendAdjacentsToLayer(sel, destination);
                                    },layer
                                ),
                                newLayerItem(function(){
                                    var destination = prompt("Enter the name of the layer:","");
                                    addNewLayer(destination);
                                    sortLayers(el);
                                    sendAdjacentsToLayer(sel,destination);
                                }))
                    },
                    "transform": {
                        "name": "Attract..",
                        "items":{
                            "neighbours": {"name":"Adjacent nodes",
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
                                    },layer
                                ),
                                newLayerItem(function(){
                                    var destination = prompt("Enter the name of the layer:","");
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

function newLayerItem(callback){
    return {"send":
            {
                "name": "New Layer...",
                "callback": callback           
            }
        };
}

function sendSelectionToLayer(destination){
    for (var i =0; i<SELECTION.length; i++){
        let object = SELECTION[i];
        let svg_destination = getSvgId(destination);
        SVG.get(svg_destination).put(object.remove());
        SVG.get(svg_destination).put(object.nodeData.label.remove());
            // this need revision, as the highlight might exist already, so it only has to change of color and be animated
        if (object.highlight){
            object.highlight.remove();
            object.highlight = null;
        }
        createHighlight(object.parent(), true, true, LAYERS[destination].color);
    }
}

function includeSelection(layerName){
    if (selectionMode){
        
        
        for (var i =0; i<SELECTION.length; i++){
            let object = SELECTION[i];
            let svgDestination = getSvgId(layerName);
            object = SVG.get(svgDestination).put(object.remove());
//            getElementFromGroup(object,'circle').highlight = null;
            
            getElementFromGroup(object,'path').remove();
            
            getElementFromGroup(object,'path').attr({fill:LAYERS[layerName].color,"stroke-fill":LAYERS[layerName].color});
            
            createHighlight(object);
            
//            createHighlight(object, true, true, LAYERS[layerName].color);
            
            object.off("pointerdown");
            addTouchEvents(object);
            addSelectionEvents(object);
            
//            console.log(highlight);
//            console.log(object.node);
//            highlight.drawAnimated({
//                duration: 500
//            });
//
//            setTimeout(function () {
//                highlight.animate().attr({opacity: 0});
//            }, waitingTime);
        }
            
//            SVG.get(svg_destination).put(object.nodeData.label.remove());
                // this need revision, as the highlight might exist already, so it only has to change of color and be animated
//            if (object.highlight){
//                object.highlight.remove();
//                object.highlight = null;
//            }
//            createHighlight(object.parent(), true, true, LAYERS[destination].color);
        
        selectionMode = false;
    }
}


function generateLayersNamesMenu(list, callback,layerName) {
    var items = {};
    var count = list.length;
    for (var i = 0; i < count; i++) {
        var text = list[i];
//        console.log("Comparing...");
//        console.log(text,layerName);
        if (text !== layerName){
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
    if (object.highlight){
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
    add_attractor_to_world(world, attractorGraphics);

    var attractor = attractorGraphics.matter;


    for (var i = 0; i < spanning_tree[1].length; i++) {

        var graphics = SVG.get(spanning_tree[1][i]);

//        graphics.attr('fill', theColor);

        var body = graphics.matter;

        if (!body) {
            add_element_to_world(world, graphics);
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
            function(){
                console.log("STOP");
                renderer.stop();
                document.getElementById("loading").style.display = "none";
                scaleLayout(g,pxs,pys);
            },500);

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
//                console.log(bodies.length);

                /*console.log('LAYERS[layer]["physics-engine"].world.gravity.scale');
                 console.log(LAYERS[layer]["physics-engine"].world.gravity.scale);*/

                for (var i = 0; i < bodies.length; i += 1) {

                    var currentBody = bodies[i];
                    var nodeGraphics = currentBody.svg;
 
                    if (nodeGraphics) {
                        let newX = currentBody.position.x;
                        let newY = currentBody.position.y;
//                        nodeGraphics.cx(newX-nodeGraphics.initX);
//                        nodeGraphics.cy(newY-nodeGraphics.initY);
//                        nodeGraphics.center(,newY-nodeGraphics.initY);

                        nodeGraphics.dmove(newX-nodeGraphics.initX,newY-nodeGraphics.initY);
                        nodeGraphics.initX = nodeGraphics.cx()-nodeGraphics.childDX;
                          nodeGraphics.initY = nodeGraphics.cy()-nodeGraphics.childDY;
//                        console.log(newX-nodeGraphics.initX,newY-nodeGraphics.initY);
//                        console.log(LAYERS[layer].layer.circle(5).center(newX-nodeGraphics.initX,newY-nodeGraphics.initY));;

//                        if (i===0){
//                        console.log(newX-nodeGraphics.initX,newY-nodeGraphics.initY);
//                        console.log(newX-nodeGraphics.initX)
////                            LAYERS[layer].layer.circle(5).center(nodeGraphics.cx(),nodeGraphics.cy());
//
//                        }                        
                        updateEdgesEnds(getElementFromGroup(nodeGraphics,'circle'),nodeGraphics.cx()-nodeGraphics.childDX,nodeGraphics.cy()- nodeGraphics.childDY);

                        
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
        
        window.requestAnimationFrame(render);
    };
    
    render();

    loadGraph(datafile, "authors2016", false).then(function () {
        addGraphAsLayer(GRAPHS["authors2016"], "1");
        loadGraph(datafile, "authors2015", false).then(function () {
            addGraphAsLayer(GRAPHS["authors2015"], "2");

    //        addGraphAsLayer(GRAPHS["authors2016"], "3");

    //        activateLayer("1");
        });
        
//        addGraphAsLayer(GRAPHS["authors2016"], "3");

        activateLayer("1");
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
                /*setting events to the tools*/
        var tools = document.getElementsByClassName("tool");
        for (var i =0; i<tools.length; i++){
            addToolEvents(tools[i]);
        }
    });
    
}

main();


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
$("input[id|='p']").dblclick(function () {
  // body...
    console.log("Doble_Clickeando");
    // console.log();
    $(this).attr("previous-layer-name",$(this).val().toLowerCase());
    $(this).attr("readonly",false);
    // console.log(this);

});
//
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
    
    if (object.type === 'g'){
        
        
        
        if (!object.node.id.includes("path")) {
            let firstChild = getElementFromGroup(object,'circle');
                        
//                        console.log(object.id.includes("path"));

            let cx = firstChild.cx();
            let cy = firstChild.cy();
            let r = firstChild.attr('r') + firstChild.attr('stroke-width') / 2 + 2;

            highlight = drawer.path()
                    .M({x: cx - r , y: cy})
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


        } else{
            let firstChild = getElementFromGroup(object,'path');

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