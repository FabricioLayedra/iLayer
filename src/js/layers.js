
/*--------------------------------CONSTANTS-------------------------------------*/


var datafile = "./data/authors_relations_19nodes_sample2016.json";
//var datafile = "./data/authors_relations_63nodes_sample2016.json";
//var datafile = "./data/authors_relations_2015.json";
var datafile2 = "./data/authors_relations_2015.json";


var LAYERS = {};

var GRAPHS = {};

var SELECTION = {};

var el = document.getElementById("layers-table");


var sortable = new Sortable(el, {

    onEnd: function (evt) {
        var list = document.getElementById("layers-table").getElementsByTagName("li");
        sort_layers(list);
    }});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/*----------------------------CREATION OF LAYERS--------------------------------*/

function add_new_layer(layer_name) {
    var color = getRandomColor();
    var layer = create_layer(layer_name);
    $(layer.querySelector(' div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("style", "background-color: " + color + "; height: auto; width: 5px");
    $("#layers-table").append(layer);
    sort_layers($("#layers-table"));
    LAYERS[layer_name].color = color;
    return color;
}

function create_layer(layer) {

    var canvas = document.createElement("div");
    var container = document.getElementById("set-canvases");
    canvas.setAttribute("id", layer);
    canvas.setAttribute("style", "position: absolute;");
    container.appendChild(canvas);

    window.canvas = canvas;

    create_svg(layer, 1200, 800);
    var template = document.getElementById('li-element').content.cloneNode(true);
    if (typeof layer === "undefined") {
        var id = Object.keys(LAYERS).length;
    } else {
        var id = layer;
    }
    change_layer_names(template, id);
    add_events(template, layer);

    return template;
}

function create_svg(layer_name, width, height) {
    var draw = SVG(layer_name).size(width, height);
    LAYERS[layer_name] = {"layer": draw, "physics-engine": null};
}

function change_layer_names(item, id) {
    //Change this function is anything changes at the nav-item html template
    $(item.querySelector('div > div:nth-child(1) > div.col-sm-auto.pr-0 > input')).attr("layer", id);
    $(item.querySelector('div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("id", "color-" + id);
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("id", "p-" + id);
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("value", "Layer " + id);
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("style", "cursor: grab");
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("data-target", "#collapse-" + id);
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("aria-controls", "collapse-" + id);
    $(item.querySelector('div > div.row.collapse')).attr("id", "collapse-" + id);
    $(item.querySelector('div > div.row.collapse > div > div.row > h6:nth-child(2)')).attr("id", "opacity-" + id);
    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).attr("id", "range-" + id);
    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).attr("id", "gravity-handler-" + id);
}

function add_events(item, layerName) {


    console.log("************ item");
    console.log(item);

    //checkbox opacity
    $(item.querySelector('div > div:nth-child(1) > div.col-sm-auto.pr-0 > input')).change(function () {
        show_hide_layer(this);
    });
    //checkbox physics
    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).change(function () {
        gravity_handler(this);
    });
    //button
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).click(function () {
        stop_drag();
    });
    //range
    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).on("input", function () {
        console.log("run");
        opacity_changer(this);
    });
    $(item.querySelector('div')).mouseenter(function () {
        highlightLayer(layerName, true);
    });
    $(item.querySelector('div')).mouseleave(function () {
        highlightLayer(layerName);
    });
}

function show_hide_layer(checkbox) {
    var layer = "#" + $(checkbox).attr("layer").toLowerCase().split(" ");
    if (checkbox.checked) {
        $(layer).css("display", "block");
    } else {
        $(layer).css("display", "none");
    }
}
;

function gravity_handler(checkbox) {
    var layer = checkbox.id.split("-")[2];

    if (checkbox.checked) {

        console.log(checkbox.id)
        //Initialize the engine if it is not created
        var engine;
        if (!LAYERS[layer]["physics-engine"]) {
            create_physics_worlds(layer);
            engine = LAYERS[layer]["physics-engine"];
            console.log(LAYERS[layer]["physics-engine"]);
            //add elements to physics world
            add_elements_to_world(engine.world, layer);
            addGravity(engine);
        } else {
            engine = LAYERS[layer]["physics-engine"];
        }
        //Initialize the engine if it is not created

        console.log("Adding physics...");
    } else {
        if (!LAYERS[layer]["physics-engine"]) {
            console.log("No engine");
        } else {
            console.log("Stoping engine...");
//            stop_physics(LAYERS[layer]["physics-engine"]);
            LAYERS[layer]["physics-engine"] = null;
        }
        console.log("Removing physics...");
    }
}

function stop_drag() {
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
            let currentLayer = SVG.get(get_svg_id(aLayer));
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

function opacity_changer(range) {
//   sortable["options"]["disabled"] = false;
    console.log(sortable["options"]["disabled"]);
    var layer_name = range.id.split("-")[1];
    $("#opacity-" + layer_name).html(range.value);
    //SEARCH FOR SELLECT ALL THE ELEMENTS OF THE LAYERS
//    SVG.get(get_svg_id(layer_name)).select("circle").attr({"fill-opacity": range.value / 100, "stroke-opacity": range.value / 100});
//    SVG.get(get_svg_id(layer_name)).select("path").attr("opacity", range.value / 100);

    // changing the opacity of the entire SVG element so that we don't have to iterate
    SVG.get(get_svg_id(layer_name)).attr('opacity', range.value / 100);

    //
    //d3.selectAll("."+layer_name).style("opacity",this.value/100);
    //CHANGE TO NEW LIBRARY
}
;

function sort_layers(list) {
    for (var element of Array.prototype.slice.apply(list)) {
        var layer = element.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input:nth-child(1)').getAttribute("value").toLowerCase().split(" ")[1];
        // render the layers
//      console.log(layer);
        $("#set-canvases").prepend($("#" + layer).detach());
    }
}


/*---------------------------------PHYSICS--------------------------------------*/

Matter.use('matter-attractors');

// module aliases
var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Runner = Matter.Runner, Render = Matter.Render, Body = Matter.Body;

function create_physics_worlds(layer_name) {

    // create an engine
    var engine = Engine.create();

    var render = Render.create({
        element: document.body,
        engine: engine
    });
    Render.run(render);

    // create demo scene
    var world = engine.world;
    world.gravity.scale = 0;

    var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});
//    World.add(world, ground);

    //Add more boundaries
    Engine.run(engine);
    LAYERS[layer_name]["physics-engine"] = engine;
    return engine;
}

//send a matter engine to restart it
function run_physics(engine) {
    engine.enabled = true;
}

//send a matter engine to stop it
function stop_physics(engine) {
    engine.enabled = false;
}

function addGravity(engine) {
    if (engine.world.gravity.scale > 0) {
//        document.querySelector('#add-gravity > span.text.text-white-50').textContent = "Add gravity" ;
        engine.world.gravity.scale = 0;
    } else {
//        document.querySelector('#add-gravity > span.text.text-white-50').textContent = "Remove gravity" ;
        engine.world.gravity.scale = 0.01;
    }
}

function add_elements_to_world(world, layer) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;

    var elements = LAYERS[layer].layer.children();

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.type === "circle") {

            var x = element.cx();
            var y = element.cy();
            var radius = element.attr("r");

            var matterObject = Bodies.circle(x, y, radius);

            //nodeData.matter = matterObject;
            matterObject.svg = element;
            element.matter = matterObject;


            World.add(world, matterObject);
        } else if (element.type === "path") {
            // Edges
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

//        var color = "#"+ add_new_layer(layer_name);
//        drawGraph(LAYERS[layer_name].layer,g,layer_name);
//        var svg_id = $("#"+layer_name).children("svg").attr("id");
//        SVG.get(svg_id).select("circle").fill(color);
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
function addGraphAsLayer(g, layer_name) {

//    var color = add_new_layer(layer_name);
//    var darkenColor = lightenDarkenColor(color, -10);

    add_new_layer(layer_name);
    var color = '#688bd6';
    var darkenColor = lightenDarkenColor(color, -10);

//    drawGraph(LAYERS[layer_name].layer, g);
    drawGraph(layer_name, g);
    var svg_id = $("#" + layer_name).children("svg").attr("id");
    SVG.get(svg_id).select("circle").attr({fill: color, stroke: darkenColor, 'stroke-width': 2});
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
        var y = getRandomBetween(50, 600);
        var x = getRandomBetween(50, 700);
        //GOTTA CHANGE IF THE GRAPH STRUCTURE CHANGES
        var labelName = nodeData.authorInfo.name;
        // elements: itself and its label
        var circle = drawCircleInLayer(draw, radius, x, y, nodeKey, directed, graphId);
        circle.layerName = layer_name;
        
        var label = drawLabel(draw, nodeKey, circle.cx(), circle.cy() + 25, graphId, labelName);
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
                controlX, controlY, toCenterX, toCenterY, id, graphId);

//        if (directed){
        to.inEdges.push(edgePath);
        from.outEdges.push(edgePath);
//        }else{
//            to.edges.push(edgePath);
//            from.edges.push(edgePath);
//        }

    });
}

function drawCircleInLayer(drawer, radius, cx, cy, id, directed, graphId) {
    var fabricObject = drawer.circle(radius)
            .attr({cx: cx,
                cy: cy,
                id: id,
                graph: graphId
            })
            .move(cx, cy);
    //Add context_menu to the element using the selector, in this case the id


    add_context_menu("#" + id);
    addMouseEvents(fabricObject, directed);
    addMovingEvents(fabricObject);
    addHoveringEvents(fabricObject);
//    return [fabricObject,label];
    return fabricObject;

}

function drawPathInLayer(drawer, fromCenterX, fromCenterY,
        controlX, controlY, toCenterX, toCenterY, id, graphId) {
    var edgePath = drawer.path()
            .M({x: fromCenterX, y: fromCenterY})
            .Q({x: controlX, y: controlY}, {x: toCenterX, y: toCenterY})
            .attr({
                stroke: 'gray',
                fill: 'transparent',
                strokeWidth: 1,
                id: id,
                'pointer-events': 'none'
            }).off();
    edgePath.back();
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



function updateEdgesEnds(nodeGraphics, directed) {
    let x = nodeGraphics.cx();
    let y = nodeGraphics.cy();
    let segment;

//    if (directed){
    nodeGraphics.nodeData.inEdges.forEach(function (inEdge) {
        segment = inEdge.getSegment(1);

        // TMP: to make it straight, we just set the control point at the ending point
        segment.coords[0] = x;
        segment.coords[1] = y;
        segment.coords[2] = x;
        segment.coords[3] = y;
        inEdge.replaceSegment(1, segment);

    });
    nodeGraphics.nodeData.outEdges.forEach(function (outEdge, i) {

        segment = outEdge.getSegment(0);
        segment.coords[0] = x;
        segment.coords[1] = y;
        outEdge.replaceSegment(0, segment);

        // to make it straight, we just set the control point at the starting one
        segment = outEdge.getSegment(1);
        segment.coords[0] = x;
        segment.coords[1] = y;
        outEdge.replaceSegment(1, segment);




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



function addHoveringEvents(nodeGraphics, directed) {
    nodeGraphics.on('mouseenter', function event() {
        
        var layerName = nodeGraphics.layerName;
        
        console.log("layerName:");
        console.log(layerName);
        
        var color = LAYERS[layerName].color;
        
//        var color = '#f4aa42';
//        var color = '#ffba59';
        highlightElement(nodeGraphics, color);
        nodeGraphics.nodeData.inEdges.forEach(function (inEdge) {
            highlightElement(inEdge, color);
        });
        nodeGraphics.nodeData.outEdges.forEach(function (outEdge) {
            highlightElement(outEdge, color);
        });
    });
    nodeGraphics.on('mouseleave', function event() {
        highlightElement(nodeGraphics);
        nodeGraphics.nodeData.inEdges.forEach(function (inEdge) {
            highlightElement(inEdge);
        });
        nodeGraphics.nodeData.outEdges.forEach(function (outEdge) {
            highlightElement(outEdge);
        });
    });
}

function addMovingEvents(nodeGraphics, directed) {
    nodeGraphics.on('dragmove', function event(e) {
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
        updateEdgesEnds(nodeGraphics, directed);
        updateLabelPosition(nodeGraphics);
    });
}

function updateLabelPosition(nodeGraphics) {
    nodeGraphics.nodeData.label.move(nodeGraphics.cx(), nodeGraphics.cy() + 25);
}

function addMouseEvents(object) {
    object.draggable();
    object.on("click", function (d) {
        if (d.shiftKey) {
            if (SELECTION.includes(this)) {
                SELECTION = arrayRemove(SELECTION, this);
            } else {
                SELECTION.push(this);
                console.log("Added")
//                addContextMenuSelection("#"+this.node.id);  
            }
            console.log("SELECTION");
            console.log(SELECTION);
        }
    });
    object.on("dblclick", function (d) {
        if (SELECTION.length < 1) {
            console.log("Nothing is selected");
        } else {
            if (SELECTION.includes(this)) {
                console.log("ADD CONTEXT MENU");
            } else {
                console.log("THIS IS NOT PART OF THE SELECTION")
            }
        }
    });
}

function get_svg_id(layer_name) {
    return $("#" + layer_name).children("svg").attr("id");
}

function getGraphFromSVGElement(svgElement) {
    var graph_name = $("#" + svgElement.node.id).attr("graph");
    return GRAPHS[graph_name];
}
;

function getGraphFromSelector(selector) {
    var graph_name = $(selector).attr("graph");
    return GRAPHS[graph_name];
}
;

function sendElementToLayer(svgElement, layerOrigin, layerDestination) {
    console.log(svgElement);
}
;

function get_spanning_tree(selector, n_levels) {
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

function send_ego_network_to_layer(svgElement, n_levels) {
    console.log(svgElement);
}

function get_parent_layer_name(svgElement) {
    return $(svgElement).parent().parent().attr("id");
}
/*-----------------------------CONTEXT MENU-------------------------------------*/

function add_context_menu(sel) {
    $.contextMenu({
        selector: sel,
        build: function ($trigger, e) {
            var data = get_layers_names(LAYERS);
            // this callback is executed every time the menu is to be shown
            // its results are destroyed every time the menu is hidden
            // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
            return {
                callback: function (key, options) {
                },
                items: {
                    "send": {
                        "name": "Send to...",
                        "items": generate_menu_layers_names(
                                data,
                                function (destination) {
                                    send_element_to_layer(sel, destination);
                                })
                    },
                    "ego": {
                        "name": "Send adjacents to...",
                        "items": generate_menu_layers_names(
                                data,
                                function (destination) {
                                    send_adjacents_to_layer(sel, destination);
                                })
                    },
                    "transform": {
                        "name": "Attract my neighbours",

                        "callback": function () {
                            makeAttractor(this);
                        }},
                    "select": {"name": "Select .."}
                }
            };
        }
    });
}
;

function generate_menu_layers_names(list, callback) {
    var items = {};
    var count = list.length;
    for (var i = 0; i < count; i++) {
        var text = list[i];
        var item = {};
        item["name"] = text;
        item["callback"] = callback;
        items[text] = item;
    }
    return items;
}

function get_layers_names(dict) {
    return Object.keys(dict);
}

function send_element_to_layer(selector, destination) {
    var svg_destination = get_svg_id(destination);
    SVG.get(svg_destination).put(SVG.get(selector).remove());
}

function send_adjacents_to_layer(selector, destination) {
    var spanning_tree = get_spanning_tree(selector, 1);
    var source = spanning_tree[0];
    var targets = spanning_tree[1];
    //send the center
    send_element_to_layer(source, destination);
    //send the target nodes and edges
    for (var i = 0; i < targets.length; i++) {
        // target nodes
        send_element_to_layer(targets[i], destination);
        try {
            send_element_to_layer(source + targets[i], destination);

        } catch (error) {
            try {
                send_element_to_layer(targets[i] + source, destination);
            } catch (error) {
                console.error(error);
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
            }
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
        }
        //edges
        //send_element_to_layer(source+targets[i],destination);
    }

    console.log(spanning_tree);

}



function highlightElement(element, color, timeout) {
    var oldStroke = element.attr('stroke');
    element.attr('stroke', color || element.oldStroke);
    element.oldStroke = oldStroke;
    if (timeout) {
        setTimeout(function () {
            element.attr('stroke', element.oldStroke);
        }, timeout);
    }
}

function highlightElements(ids, edges, color, timeout) {

    ids.forEach(function (id) {
        var element = SVG.get(id);
        if (element.type === "circle") {
            highlightElement(element, color, timeout);
        }
    });

    edges.forEach(function (edge) {
        if (edge) {
            highlightElement(edge, color, timeout);
        }
    });

}

function makeAttractor(svgElement) {
    //get spanning tree correr mundo y anadir propiedades al matter de los svgs diciendo que son atraidos por
//    console.log(svgElement);
//    console.log(getGraphFromSelector("#"+svgElement.attr("id")))

    var svgID = svgElement.attr("id");
    var attractorGraphics = SVG.get(svgElement.attr("id"));

    var spanning_tree = get_spanning_tree("#" + svgID, 1);

    var layer_name = get_parent_layer_name(svgElement);

    var engine = null;

    if (!LAYERS[layer_name]["physics-engine"]) {
        engine = create_physics_worlds(layer_name);
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
/*-----------------------------------MAIN---------------------------------------*/

function main() {
    var bodies = [];
    var Composite = Matter.Composite;

    (function render() {
        for (let layer in LAYERS) {
            //        console.log(LAYERS[layer])
            if (LAYERS[layer]["physics-engine"]) {
                bodies = Composite.allBodies(LAYERS[layer]["physics-engine"].world);

                /*console.log('LAYERS[layer]["physics-engine"].world.gravity.scale');
                 console.log(LAYERS[layer]["physics-engine"].world.gravity.scale);*/

                for (let i = 0; i < bodies.length; i += 1) {

                    let currentBody = bodies[i];
                    let nodeGraphics = currentBody.svg;

                    if (nodeGraphics) {
                        let newX = currentBody.position.x;
                        let newY = currentBody.position.y;
                        nodeGraphics.attr("cx", newX);
                        nodeGraphics.attr("cy", newY);

                        updateEdgesEnds(nodeGraphics);


                        //            fabricObject.setPositionByOrigin({x: newX, y: newY}, 'center', 'center');
                        //            fabricObject.setCoords();
                    }
                }
            }
        }
        window.requestAnimationFrame(render);
    })();

    loadGraph(datafile, "authors2016", false).then(function () {
        addGraphAsLayer(GRAPHS["authors2016"], "colab");
    });

//    loadGraph(datafile2,"authors2015",false).then(function(){
//        console.log(GRAPHS);
//        addGraphAsLayer(GRAPHS["authors2015"],"colab2");
//    });

    $("#new-layer").click(function () {
        add_new_layer("" + (Object.keys(LAYERS).length + 1));
        //    readDataColab(datafile,random_id());
        sort_layers(el.getElementsByTagName("li"));
    });


}

main();
/*---------------------------------GARBAGE--------------------------------------*/
///* FILLING DOWN THE NAME OF THE LAYER */
//
//$("input[id|='p']").click(function () {
//  // body...
//    console.log("clickeando");
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