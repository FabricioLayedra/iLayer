
/*--------------------------------CONSTANTS-------------------------------------*/
var count = 0;

var nodeRadius = 25; //30
var distLabelGroup = 0;

//selection should be global, whereas visibility should be for a single layer
var selectionFlag = false;
var edgesFlag = false;
var labelsFlag = false;


var selectionCount = 0;
var maxLayersAllowed = 10;

var EDGESHIDDEN = false;
var GLOBALLABELSHIDDEN = false;

var globalToolsOnCanvas = {};



//var datafile = "./data/authors_relations_SC_JD_sample2015_anonymized.json";

//var datafile = "./data/authors_relations_SC_JD_sample2015.json";
//var datafile = "./data/usa_airports.json";

//Map
//var datafile = "./data/canada_airports.json";

//var datafile = "./data/venezuela_airports.json";

//var datafile = "./data/sample15papers2016.json";//47
var datafile = "./data/sample_30_authors_test.json";
//var datafile = "./data/americanAuthorsVIS.json.json";

//Scatter plot
//var datafile = "./data/authors_2015.json.json"; //a lot


//var datafile = "./data/authors_1990.json";
//var datafile = "./data/authors_relations_63nodes_sample2016.json";
//var datafile = "./data/authors_relations_2015.json";
//var datafile = "./data/authors_relations_Sheelagh.json";

//var datafile = "https://raw.githubusercontent.com/FabricioLayedra/CiverseData/master/authors_relations_19nodes_sample2016.json";


var LAYERS = {};

var GRAPHS = {};
var GRAPHTOLOAD = 'authors2016';
var SELECTION = [];

var ACTIVETOOLS = {};   //group for active tools on screen
var ACTIVEATTRIBUTES = {}; //group for active attributes on screen

//ids of edge gradients
var EDGEGRADIENTS = {};

//var COLORS = ["#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD", "#8C564B", "#E3775E", "#7F7F7F", "#BCBD22", "#17BECF"];
var COLORS = ['#c6c8cc']
//var COLORS = ['gray']
//var COLORS = ['#2385ca']
var STARTERLAYOUTS = ['cluster', 'force', 'bar', 'scatter'];
var startingLayout = 2; //-1 for random

var starterScatterAxesAttributes = {x: 'Citations', y: 'Papers'};
var starterBarAxesAttributes = {x: 'Country', y: null};
var forceGraph;


var el = document.getElementById("layers-table");

var active = null;

var activeLayer = null;

var setCanvases = $("#content");

var generalWidth = setCanvases.width();
var generalHeight = $(document).height() - $('#set-tools').outerHeight();

//var generalWidth = window.screen.width;
//var generalHeight = Math.max(window.screen.availHeight - $('#set-tools').outerHeight() - 70, window.innerHeight || 0);
//var generalHeight = window.screen.availHeight - $('#set-tools').outerHeight() - 70;

//var generalHeight = $('#mobile-indicator').innerHeight()-70;
console.log(generalWidth, generalHeight);



var sortable = new Sortable(el, {

    onEnd: function (evt) {
        var list = document.getElementById("layers-table");
        sortLayers(list);
    }});

function updateSize(e){
    generalWidth = setCanvases.width();
    generalHeight = $(document).height() - $('#set-tools').outerHeight();
    console.log(e)

    var layers = getLayersNames(LAYERS);
    for (var i = 0; i < layers.length; i++) {
        let layer = "#layer-" + layers[i];
        SVG.get(layer).attr({
            width: generalWidth, 
            height: generalHeight
        });
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getColor() {
    if (Object.keys(LAYERS).length < maxLayersAllowed) {
        return COLORS[Object.keys(LAYERS).length];
    } else {
        alert("No more available layers.")
    }
}

function addTrash(){
    entityGroup = getActiveLayer().layer.group();   //creates group for entity
    entityGroup.addClass('canvas-tool');
    entityGroup.id(svgID)
    //.node.id(type + '-' + Object.keys(ACTIVETOOLS).length.toString()) 
    console.log(entityGroup)

    //only add toolEntity if it comes out of the drop zone
    //ghost   

    //creation of actual fa-icon
    toolEntity = getActiveLayer().layer.path(path).move(initX, initY).attr({"tool": true, fill: getActiveLayer().color});
    var relationAspect = toolEntity.width() / toolEntity.height();
    toolEntity.height(50);
    toolEntity.width(50 * relationAspect);

    entityGroup.add(toolEntity);
    entityGroup.add(getActiveLayer().layer
            .text(type)
            .center(toolEntity.cx(), toolEntity.cy() + toolEntity.height() * 0.6)
            //.onclick, add event
            );
}

//this function has a gradient attached to every edge instead
function addGradientsToEdges(sourceNode, targetNode){
    let srcColor = LAYERS[sourceLayerId].color; //get layer of sourceNode
    let tgtColor = LAYERS[targetLayerId].color;

    var srcToTgtGradient = SVG.get('gradientTemplates').gradient('linear', function(stop) {
          stop.at(0, srcColor)
          stop.at(1.0, tgtColor)
        }).id('gradient-'+sourceLayerId + '-' + targetLayerId).from(0,0).to(1,0);

    var targetToSrcGradient = SVG.get('gradientTemplates').gradient('radial', function(stop) {
          stop.at(0, tgtColor)
          stop.at(1, srcColor)
        }).id('gradient-'+targetLayerId + '-' + sourceLayerId);

    //console.log(gradient.id());
    EDGEGRADIENTS[sourceNodeId +'-' + targetNodeId] = {id: 'gradient-' + sourceLayerId + '-' + targetLayerId, sourceGradient: srcColor, targetGradient: tgtColor, sourceStop: 0, targetStop: 100};

    EDGEGRADIENTS[targetLayerId +'-' + sourceLayerId] = {id: 'gradient-' + targetLayerId + '-' + sourceLayerId, sourceGradient: tgtColor, targetGradient: srcColor, sourceStop: 0, targetStop: 100};

}

//should be done on move, see if this is too slow 
function updateGradientToEdges(edge, sourceNode, targetNode){
    let srcColor = LAYERS[sourceNode.layerName].color;
    let tgtColor = LAYERS[targetNode.layerName].color;

    var srcToTgtGradient = SVG.get('gradientTemplates').gradient('linear', function(stop) {
          stop.at(0, srcColor)
          stop.at(1.0, tgtColor)
        }).id('gradient-'+sourceLayerId + '-' + targetLayerId).from(0,0).to(1,0);

    var targetToSrcGradient = SVG.get('gradientTemplates').gradient('radial', function(stop) {
          stop.at(0, tgtColor)
          stop.at(1, srcColor)
        }).id('gradient-'+targetLayerId + '-' + sourceLayerId);

}


//Adds the linear gradients and stores the IDs to a global array
function addEdgeGradients(sourceLayerId, targetLayerId){
    //let l = SVG.get('gradientTemplates');
    //let l = $('gradientTemplates').svg('get');

    //for layer
    //let src = sourceLayerName.split('-')[1];
    //let tgt = targetLayerName.split('-')[1];
    let srcColor = LAYERS[sourceLayerId].color;
    let tgtColor = LAYERS[targetLayerId].color;
    //9C2 = 36 combinations total
    //
    var srcToTgtGradient = SVG.get('gradientTemplates').gradient('linear', function(stop) {
          stop.at(0, srcColor)
          stop.at(1.0, tgtColor)
        }).id('gradient-'+sourceLayerId + '-' + targetLayerId).from(0,0).to(1,0);

    var targetToSrcGradient = SVG.get('gradientTemplates').gradient('radial', function(stop) {
          stop.at(0, tgtColor)
          stop.at(1, srcColor)
        }).id('gradient-'+targetLayerId + '-' + sourceLayerId);

    //console.log(gradient.id());
    EDGEGRADIENTS[sourceLayerId +'-' + targetLayerId] = {id: 'gradient-' + sourceLayerId + '-' + targetLayerId, sourceGradient: srcColor, targetGradient: tgtColor, sourceStop: 0, targetStop: 100};

   EDGEGRADIENTS[targetLayerId +'-' + sourceLayerId] = {id: 'gradient-' + targetLayerId + '-' + sourceLayerId, sourceGradient: tgtColor, targetGradient: srcColor, sourceStop: 0, targetStop: 100};

    /*svg.linearGradient(defs,
        "gradient-" + sourceLayerId + "-" + targetLayerId,
        [[0, srcColor], [1, tgtColor]]
        );

        */
/*
 <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#05a"/>
      <stop offset="100%" stop-color="#0a5"/>
    </linearGradient>
  </defs>
*/
}

function createEdgeGradients(){
    
    //var gradientTemplateArray = SVG('')
    let numberOfLayers = Object.keys(LAYERS).length;

    if ($('#gradientTemplates').length == 0){
        var grad = SVG('gradients').id('gradientTemplates').size(0,0)
    }
    
    if (numberOfLayers < 2){
        return;
    }

    for (let i = 1; i < numberOfLayers; i++){
        addEdgeGradients(i, numberOfLayers);
        //src and target
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
    //is not being called or bound properly
    //canvas.bind('resize', updateSize)
    canvas.addEventListener('onresize', updateSize);
    container.appendChild(canvas);
    var layer = document.getElementById('li-element').content.cloneNode(true);
    if (typeof layerName === "undefined") {
        var id = Object.keys(LAYERS).length;
    } else {
        var id = layerName;
    }
    layer.labelsAreHidden = false;
    layer.edgesAreHidden = false;
    changeLayerNames(layer, id);

    addDroppingZones(layerName);

    //if (LAYERS.members)
    if (Object.keys(LAYERS).length > 1)
        createEdgeGradients();
    console.log(canvas)

    //addEdgeGradients(layerName);

    /*canvas.appendChild(<defs>
            <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#05a"/>
              <stop offset="100%" stop-color="#0a5"/>
            </linearGradient>
          </defs>)*/

    return layer;
}


//and trash zone
function addDroppingZones(layerName) {
    var layer = LAYERS[layerName];
    var drawer = layer.layer;
    var layerHeight = drawer.height();
    let rectAttributes = {stroke: 'none', fill: '#ddd', opacity: 0};
    let lineAttributes = {stroke: 'black', 'stroke-width': 2, fill: '#efefef', opacity: 0, linecap: 'round'};
    let h = 50;//55;
    let w = 65;//70;

    layer.bottom = {
        line: drawer.line(w, 0, drawer.width() - w - 20, 0).move(w, layerHeight - h).attr(lineAttributes),
        rect: drawer.rect(drawer.width() - w, h).move(w, layerHeight - h).attr(rectAttributes),//.addClass('glow-anim'),
        hasAttribute: false
    };
    layer.left = {
        line: drawer.line(0, h, 0, drawer.height() - 40).move(w, 40).attr(lineAttributes),
        rect: drawer.rect(w, layerHeight - h).move(0, 0).attr(rectAttributes),//.addClass('glow-anim'),
        hasAttribute: false
    };

    //trash zone -- double check if correct
    layer.right = {
        line: drawer.line(0, h, 0, drawer.height() - 40).move(drawer.width() - w - 20, 40).attr(lineAttributes),
        rect: drawer.rect(w, "100%").move(drawer.width() - w, 0).attr(rectAttributes),//.addClass('glow-anim'),
        hasAttribute: false
    };

    //resize when it works
    layer.trash = {
        line: drawer.line(0, 0, 0, 0).move(drawer.width() - w - 20, 40).attr(lineAttributes),
        rect: drawer.rect(w + 60, w + 60).move(drawer.width() - w - 60, 0).id('trash-rect').attr(rectAttributes),//.addClass('glow-anim'),
        hasAttribute: false,
        icon: drawer.path("M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z").addClass("trashIcon")
            .attr({
                fill: 'gray',
                opacity: .25
            })
        };

        layer.trash.icon.attr({
            'transform': 'translate(' +  (layer.trash.rect.cx() - 20) + " " + ( w/2) + ") scale(.1)"
        });
        //will overwrite this
        /*layer.trash.icon.attr({
            'transform': 'translate(-' +  layer.trash.icon.cx() + ", " + "-" + layer.trash.icon.cy() + ")"
        });*/

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

}

function addColorsAndBorders(layerName, color) {
    $("#color-" + layerName).attr("style", "background-color: " + color + "; height: auto; width: 5px; background-clip: content-box");
    $("#container-item-" + layerName).attr("style", "background-color: #eee; border:  solid 1.5px " + color);
}

//do this for the global events
function addMenuEvents(){

    $("#selector").on('pointerdown', function (e) {
        //a really garbage hack to see if this was the result of a button press or not
        //true to false --> because of a button press
        if (selectionFlag){
            selectionMode(!selectionFlag, true);
        }
        else{
            selectionMode(!selectionFlag, false);
        }
        //selectionMode(!selectionFlag);
        //console.log(selectionFlag + " selector")
        $(this).toggleClass('active');
    });

    $("#hideEdges").on('pointerdown', function (e) {
        /*if (edgesFlag){
            showHideEdges(!edgesFlag)//, true);
        }

        if (!edgesFlag){
            showHideEdges(!edgesFlag)//, true);
        }
        */


        showHideEdges();

       // e.srcEvent.stopPropogation();

        $(this).toggleClass('active');
    });
    
    $("#hideLabels").on('pointerdown', function () {
        showHideLabels();
       $(this).toggleClass('active');
    });

}





//this is triggered for each layer every time something takes place, which is not helpful in individual cases
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
            selectionFlag = false;
            selectionMode(selectionFlag);
            $("#selector").removeClass('active');
        }
        activateLayer(id);

        //console.log(id)
    });

    // ///SELECTOR -- remove this so it does not keep repeating for each element. selector should be global, same as 

    //COMMENTED BELOW


    // $("#selector").on('pointerdown', function (e) {
    //     /*if(e.type == 'touchend'){
    //         $(this).off('click');
    //     }*/

    //     //selectionFlag = !selectionFlag;
    //     selectionMode(!selectionFlag);
    //     console.log(selectionFlag + " selector")
    //     //console.log("Selection turned to " + selectionFlag + " state");
    //     $(this).toggleClass('active');
    // });

    // ///

   

    // //$("#selector").off('pan');
    // //this is fine because its only triggering 
    // $("#visibility-" + id).on('pointerdown', function () {
    //     //console.log("Touching");
    //     showHideLayer(id);

    // });

    // $("#hideEdges").on('click', function (e) {
    //     selectionCount++;
    //     console.log(selectionCount)
    //     showHideEdges(id);
    //    // e.srcEvent.stopPropogation();

    //     //$(this).toggleClass('active');
    // });
    
    // $("#hideLabels").on('pointerdown', function () {
    //     showHideLabels(id);
    //    //$(this).toggleClass('active');
    // });
}

function activateLayer(layerName) {
//    console.logitem);
    if (active) {
        $(active).css("background-color", "#eee");
    }
    active = $("#container-item-" + layerName);
    activeLayer = LAYERS[layerName];
    //edgesHidden = false;

    //reset all flags to false


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
        $(layer).css("display", "none");
    } else {
    }

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
            console.log("Element already in the world!")
        } else {
            addElementToWorld(world, group);
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



/*----------------------------GRAPHS' ACTIONS-----------------------------------*/

function showCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    return [x, y];
}

//loads the JSON file and creates the graph using graphLib and adds it to GRAPHS
function loadGraph(filename, key, directed) {
    console.log(filename)
    return $.getJSON(filename).done(function (json) {
        // Creates a new directed graph
        var g = new graphlib.Graph({directed: directed});
        g._label = key;
        var edges = json.links;
        var nodes = json.nodes;

        var notIncluded = [];
        nodes.forEach(function (data) {
            var keys = Object.keys(data);
            dataInfo = {};

            dataInfo["name"] = data["id"];
            for (var index in keys) {
                dataInfo[keys[index]] = data[keys[index]];
            }
//            console.log(dataInfo);
            if(data["lon"]==="" || data["lat"]===""){
                notIncluded.push(format_id(data["id"]));
            }else{
                g.setNode(format_id(data["id"]), {authorInfo: dataInfo});
            }
        });

        edges.forEach(function (data) {
            //Load it data-drivenish (TO DO)
            if (!(notIncluded.includes(format_id(data["source"]))|| notIncluded.includes(format_id(data["target"])))){
                g.setEdge(format_id(data["source"]), format_id(data["target"]), {colabInfo: { id: data["id"]}});
            }
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
    var darkenColor = lightenDarkenColor(color, -10);

//    drawGraph(LAYERS[layer_name].layer, g);

    drawGraph(layerName, g);





//    var svg_id = $("#" + layerName).children("svg").attr("id");
    var svg_id = "layer-" + layerName;

//    console.log(svg_id);
    SVG.get(svg_id).select("circle").attr({fill: color, stroke: darkenColor, 'stroke-width': 2});

}

function drawGraph(layer_name, g) {
    var draw = LAYERS[layer_name].layer;
    var color = LAYERS[layer_name].color;

    var graphId = g._label;
    var directed = g.directed;
    var nodeKeys = g.nodes();
    var edges = g.edges();
    var dataKeys = null;

    let x, y = null;
    let a, r = null;

    let counter = 0;  //counter
    let c = nodeRadius + 8;  //spread 4

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

        //if (STARTERLAYOUTS[startingLayout] === 'cluster'){
            a = counter * 137.5;
            r = c * Math.sqrt(counter);

            x = r * Math.cos(a) + (generalWidth)/2;
            y = r * Math.sin(a) + (generalHeight + 70 - 100)/2; 

            //quick hack for spacing issues
            if (counter == 0){
                y += 10;
            }
            if (counter == 1){
                x += 20;
            }
            
            counter++;
        /*}

        else { //force  
            x = getRandomBetween(nodeRadius + 100, generalWidth-100);
            y = getRandomBetween(nodeRadius, generalHeight-120);
        }*/
        
        //console.log(nodeRadius)

        //GOTTA CHANGE IF THE GRAPH STRUCTURE CHANGES
        var labelName = nodeData.authorInfo.name;

        //CREATION OF THE GROUP
        var group = draw.group().attr({id: "group-" + nodeKey, class: "node current"});
        group.layerName = layer_name;
        group.firstTime = true;

        // creation of the elements
        var circle = drawCircleInLayer(draw, radius, x, y, nodeKey, directed, graphId, color);
        

        nodeData.spawnX = circle.cx();
        nodeData.spawnY = circle.cy();
        
        //stored in GRAPHS.authors2016
        //nodeData.spawnX = x;
        //nodeData.spawnY = y;

        var label = drawLabel(draw, nodeKey, circle.cx(), circle.cy() + (radius / 2), graphId, labelName).attr({class:"node-label"});
        var r = circle.attr('r') + circle.attr('stroke-width') / 2;
//        var ear = drawEarInCircle(draw, r, circle.cx(), circle.cy(), LAYERS[layer_name]["color"]);

        //addition of the elements
//        group.add(ear);
        group.add(circle);
        group.add(label);
        group.nodeData = nodeData;

        //set the distance between the group and the circle
        group.childDX = group.cx() - getElementFromGroup(group, 'circle').cx();
        group.childDY = group.cy() - getElementFromGroup(group, 'circle').cy();

        //set the distance between the group and its label
        group.textDX = group.cx() - getElementFromGroup(group, 'text').cx();
        group.textDY = group.cy() - getElementFromGroup(group, 'text').cy();

        group.spawnX = group.cx();
        group.spawnY = group.cy();

        distLabelGroup = radius / 2;

        //addition of highlights and events
        createHighlight(group);
        addTouchEvents(group);
        addSelectionEvents(group);
        addTooltipEvents(group);

        //circular references
        nodeData.svg = circle;
        nodeData.label = label;
        circle.nodeData = nodeData;

        dataKeys = Object.keys(nodeData.authorInfo);
        //console.log(nodeData)
        //removing the keys I do not want
//        dataKeys = arrayRemove(dataKeys, 'id');
        dataKeys = arrayRemove(dataKeys, 'group');
        dataKeys = arrayRemove(dataKeys, 'name');
        dataKeys = arrayRemove(dataKeys, 'Name');
        dataKeys = arrayRemove(dataKeys, 'Number of Papers');
        dataKeys = arrayRemove(dataKeys, 'Papers Published');
        dataKeys = arrayRemove(dataKeys, 'Affiliations');
        dataKeys = arrayRemove(dataKeys, 'id');

        
//        dataKeys = arrayRemove(dataKeys, 'number of papers');

    });
    
    console.log(dataKeys);
    
    LAYERS[layer_name].attributes = dataKeys;
//    console.log("DICTIONARY");
    LAYERS[layer_name].data = getValuesByAttributeDict(SVG.select('g.node').members, dataKeys);



    edges.forEach(function (edge) {

        var from = g.node(edge.v);
        var to = g.node(edge.w);
        
//        console.log(from);
//        console.log(to);

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

        var group = draw.group().attr({id: "path-" + id, class: 'edge', opacity: '.8'});
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

    addAttributesAsTools(dataKeys);
    
    let n = datafile.split('/');
    n = n[n.length - 1];

    $('#file').text(n);
    toggleAttributesButtons(dataKeys);


    if (STARTERLAYOUTS[startingLayout] === 'force'){
        //forceLayout(g, pxs, pys);
        altForceLayout(g);//, pxs, pys);
    }
    
    //forceLayout(g, pxs, pys)
}

function toggleAttributesView(){
    

    /*for (var index in attributesSet) {
        let attribute = attributesSet[index];
        var bar = document.getElementById('set-tools');
        var attrTool = document.getElementById('tool-element').content.cloneNode(true);

        $(attrTool.querySelector("button")).html(attribute);
        $(attrTool.querySelector("button")).attr("id", attribute);
        $(attrTool.querySelector("button")).addClass("attributeTool");

        $("#search-bar-container").before(attrTool);
        // true because everything is discrete now
        addAttributesDraggingEvents($("#" + attribute)[0], attribute, true);

    }*/

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
                id: id,
                class: 'edge'
            }).off();
//    edgePath.layerName = layerName;
   // edgePath.class('edge');
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


    var x = !coordX ? nodeGraphics.rbox().cx /*-$("#accordionSidebar").width()*/ : coordX;
    var y = !coordY ? nodeGraphics.rbox().cy - 70 : coordY;
    var segment;

//    if (directed){
    nodeGraphics.nodeData.inEdges.forEach(function (inEdge) {
//        console.log("INEDGES");
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
        //outEdge.node.id = AliceThudtDominikusBaur
//        break;
        //update gradient here


    });
    nodeGraphics.nodeData.outEdges.forEach(function (outEdge, i) {

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

    //console.log(x);

    //also update gradient while colouring so it is between the x and y



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
    nodeGraphics.parent().on('dragmove', function event(e){

        let bodyMatter = nodeGraphics.matter;
        if (bodyMatter) {
            let event = e.detail.event;
            var x = event.offsetX;
            var y = event.offsetY;
            Body.translate(nodeGraphics.matter, {
                x: (x - bodyMatter.position.x) * 0.25,
                y: (y - bodyMatter.position.y) * 0.25
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

function sendEdgesToLayer(source, nodesNames, inEdges, outEdges, destination) {
    var edges = inEdges.concat(outEdges);
    var layerName = destination.split("-")[1];
    var edgeArray = getActiveLayer().layer.select('g.edge').members;
    var existingNodesInTarget = SVG.get(destination).select('g.node').members;
    var existingNodeInTargetNames = getNodesNames(existingNodesInTarget);


    //if edge or target is not in layer 1, send to target layer
    for (var index in edges) {

        SVG.get(edges[index].node.id).attr({"stroke": 'url(#gradient-' + getActiveLayer().layer.id().split('-')[1] + '-' + layerName, "opacity": ".8"})
        if (nodesNames.includes(edges[index].node.id.replace(source.node.id, "")) || existingNodeInTargetNames.includes(edges[index].node.id.replace(source.node.id, ""))) {
           /* console.log(edges[index].node);
            console.log(SVG.get(edges[index].node))*/
            
            //output = initiializer with node: g#path-...
            let edgeToPlace = edgeArray.find(function(e){
                return e.node.id === 'path-' + edges[index].node.id})
            SVG.get(edges[index].node.id).attr({"stroke": LAYERS[layerName].color, "opacity": ".8"});
            //properly sends the edge group for edges between two nodes in the same layer, and removes it from the original
            if (edgeToPlace !== undefined){
                SVG.get(destination).put(edgeToPlace.remove());
            }
        }
        else{
            //put in gradient?
            console.log(edges[index].node.id)
        }

        //do some detection to figure out where source node and destination node are, layerwise
        

        //check with target layer as well
        /*if (nodesNames.include(edges[index].node.id.replace(source.node.))){


        }*/

    }

    /*
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
    */
    
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
    var nodes = getActiveLayer().layer.select('g.node').members;
    var edges = getActiveLayer().layer.select('g.edge').members;

//    console.log(nodes);

    for (var i = 0; i < nodes.length; i++) {
        let object = nodes[i];//type initializer
//        console.log(SELECTION.includes(nodes[i]));
        if (SELECTION.includes(nodes[i])) {
            let svgDestination = getSvgId(layerName);
            //places entire group id for the node
            object = SVG.get(svgDestination).put(object.remove());
            //            getElementFromGroup(object,'circle').highlight = null;
            var circle = getElementFromGroup(object, 'circle');


            circle.highlight.attr({stroke: LAYERS[layerName].color});



            dataKeys = Object.keys(circle.nodeData.authorInfo);
            //removing the keys I do not want
            dataKeys = arrayRemove(dataKeys, 'id');
            dataKeys = arrayRemove(dataKeys, 'group');
            dataKeys = arrayRemove(dataKeys, 'name');
            dataKeys = arrayRemove(dataKeys, 'number of papers')
            //console.log(dataKeys);
            LAYERS[layerName].attributes = dataKeys;
//            addAttributesAsTools(dataKeys);
            circle.fill(LAYERS[layerName].color);
            var s = circle.nodeData;
            // console.log("inEdges/outEdges ")
            // console.log(circle.nodeData.inEdges);
            // console.log(circle.nodeData.outEdges);

            //do this because even though its more tedious in most cases, it will cover cases where a node is added to a destination layer
            sendEdgesToLayer(circle, names, circle.nodeData.inEdges, circle.nodeData.outEdges, svgDestination);
            //sendEdgesToLayer(circle, names, circle.nodeData.inEdges, svgDestination);
//            isNeighbour(circle,names,circle.nodeData.outEdges);
        

            //path is coloured

            //this is only for the ringed circle around selected items
            getElementFromGroup(object, 'path').remove();

            getElementFromGroup(object, 'path').attr({fill: LAYERS[layerName].color, "stroke-fill": LAYERS[layerName].color});
            //getElementFromGroup(object, 'path').attr({"fill": "green", "stroke-fill": "green"});
            object.layerName = layerName;

        }

        object.off("pointerdown");
        addTouchEvents(object);
        addSelectionEvents(object);


        //addSelectorEvents

    }
    LAYERS[getSvgId(layerName).split("-")[1]].data = getValuesByAttributeDict(SELECTION, dataKeys);
    console.log(LAYERS[getSvgId(layerName).split("-")[1]].data);
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

    console.log(object)
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
    console.log(spanning_tree);
    //send the center
    sendElementToLayer(source, destination);
    //send the target nodes and edges
    for (var i = 0; i < targets.length; i++) {
        // target nodes
        sendElementToLayer(targets[i], destination);
        console.log(source);
        console.log(targets[i]);
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


function altForceLayout(g, c) {

    var pxs = {};
    var pys = {};
    // make a new graph

    var edges = g.edges();
    var nodes = g.nodes();  //names only
    var data = {"nodes": [], "edges": []};

    var constraints;

    if (c != undefined){
        ;
    }
    else{
        constraints = {
            repulsion: 1500,
            stiffness: 800,
            friction: .5,
            gravity: true,
            fps: 65,
            dt: .02,
            precision: .6
        }    
    }

    

    forceGraph = arbor.ParticleSystem(constraints);
    forceGraph.parameters({gravity: true})
    var particleSys;
    var grip = g; 

    for (var i = 0; i < nodes.length; i++) {
        data["nodes"].push(nodes[i]);
        forceGraph.addNode(nodes[i])
    }
    for (var i = 0; i < edges.length; i++) {
        data["edges"].push([edges[i].v, edges[i].w]);
        forceGraph.addEdge(edges[i].v, edges[i].w)
    }

    var myRenderer = {
        init: function(sys){//, g){
            particleSys = sys;
            particleSys.screenSize(generalWidth, generalHeight);

            particleSys.screenPadding(100);
            particleSys.screenStep(.95);
            //myRenderer.initMouseHandling();

            /*for (var i = 0; i < nodes.length; i++) {
                data["nodes"].push(nodes[i]);
                particleSys.addNode(nodes[i])
            }
            for (var i = 0; i < edges.length; i++) {
                data["edges"].push([edges[i].v, edges[i].w]);
                particleSys.addEdge(edges[i].v, edges[i].w)
                //graph.
            }*/
            //particles = sys;

            
            //graph.loadJSON(data);
        },
        redraw: function(){//node, p){

            //called when redrawing
            

            particleSys.eachNode(function(node, p){
                //node 
                var svg_nodes = getActiveLayer().layer.select('g.node').members;

                //console.log(grip);
                var nodeGraphics = grip.node(node.name).svg;
                //console.log(p);

                /*let tx = p.x < 0 ? 0 : p.x;
                tx = p.x > generalWidth ? generalWidth : p.x;
                let ty = p.y < 0 ? 0 : p.y;
                ty = p.y > generalHeight ? generalHeight : p.y;*/
                console.log(p.x + " " + p.y)

                nodeGraphics.parent().translate( p.x - nodeGraphics.cx(), p.y - nodeGraphics.cy());
                updateEdgesEnds(nodeGraphics, g.directed);

            });



            /*particleSystem.eachEdge(function(edge, p1, p2){
                
            });*/

            /*let tx = p.x > 0 ? p.x + nodeRadius/2 : p.x - nodeRadius/2;
            let ty = p.y > 0 ? p.y + nodeRadius/2 : p.y - nodeRadius/2;*/

            /*pxs[node.id] = nodeGraphics.cx() + p.x + nodeRadius;
            pys[node.id] = nodeGraphics.cy() + p.y + nodeRadius;
            console.log(p)*/

          /*pxs = {};
            pys = {};*/

        }

        //return init()
    }

    //return myRenderer;

    forceGraph.renderer = myRenderer;


    setTimeout(
        function () {
            console.log("STOP");
            
            forceGraph.stop();
            //document.getElementById("loading").style.display = "none";
            //scaleLayout(g, pxs, pys);
            
        }, 5000);
    //graph.renderer.init()

    /*graph.renderer = renderer;*/
                
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
    var nodes = g.nodes();  //names only
    var data = {"nodes": [], "edges": []};

    // make some nodes

    for (var i = 0; i < nodes.length; i++) {
        data["nodes"].push(nodes[i]);

    }
    for (var i = 0; i < edges.length; i++) {
        data["edges"].push([edges[i].v, edges[i].w]);
    }
    console.log(nodes);
    console.log(edges);
    
    graph.loadJSON(data);

    var layout = new Springy.Layout.ForceDirected(graph, 400.0, 600.0, 0.4);

    renderer = new Springy.Renderer(layout,
            function clear() {
            },
            function drawEdge(edge, p1, p2) {
            },
            function drawNode(node, p) {
                    //console.log(node.id,p.x,p.y);
                // calculate bounding box of graph layout.. with ease-in
	/*var currentBB = layout.getBoundingBox();
	var targetBB = {bottomleft: new Springy.Vector(-2, -2), topright: new Springy.Vector(2, 2)};
	var toScreen = function(p) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * 1200;
		var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * 800;
		return new Springy.Vector(sx, sy);
	};
        var s = toScreen(p);
		var contentWidth = 5;
			var contentHeight = 5;
			var boxWidth = contentWidth + 6;
			var boxHeight = contentHeight + 6;*/

                var svg_nodes = getActiveLayer().layer.select('g.node').members
                var nodeGraphics = g.node(node.id).svg;
                console.log(node);



                //console.log(nodeGraphics.parent().node)
 
                let tx = p.x > 0 ? p.x + nodeRadius/2 : p.x - nodeRadius/2;
                let ty = p.y > 0 ? p.y + nodeRadius/2 : p.y - nodeRadius/2;

                pxs[node.id] = nodeGraphics.cx() + p.x + nodeRadius;
                pys[node.id] = nodeGraphics.cy() + p.y + nodeRadius;
                /*pxs[node.id] = nodeGraphics.cx() + tx;
                pys[node.id] = nodeGraphics.cy() + ty;*/
                //console.log(tx + " " + ty)


                
                nodeGraphics.parent().translate(p.x, p.y);
                //nodeGraphics.parent().translate(pxs[node.id] - nodeGraphics.cx(), pys[node.id] - nodeGraphics.cy());


                /*Body.translate(nodeGraphics.matter, {
                    x: pxs[node.id],
                    y: pys[node.id]
                })*/

                updateEdgesEnds(nodeGraphics, g.directed)
                //nodeGraphics.on("stop",function(){console.log("PARO")});
              // updateEdgesEnds(nodeGraphics,false);
        //updateLabelPosition(nodeGraphics);


        //.cx(g.node(node.id).svg.cx()+p.x),g.node(node.id).svg.cy(g.node(node.id).svg.cy()+p.y);
        //g.node(node.id).svg.dmove(s.x, s.y);

    //g.node(node.id).svg.transform({"x":p.x,"y":p.y});
    //        console.log(layout.getBoundingBox());
            }
    );

    renderer.start();


//    renderer.onRenderStop = function(d){
//        console.log("paro");
//    };

    /*setTimeout(
            function () {
                console.log("STOP");
                
                renderer.stop();
                //document.getElementById("loading").style.display = "none";
                //scaleLayout(g, pxs, pys);
                
            }, 2000);
*/
    //save pxs and pxy of originals

    pxs = {};
    pys = {};
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

        //console.log(newX);
        updateEdgesEnds(nodeGraphics, false);
        updateLabelPosition(nodeGraphics);
    }

}



/*function forceLayout2(g){
   var graph = createGraph();
   var edges = g.edges();
   var nodes = g.nodes();
   var data = {"nodes":[],"edges":[]};

   // make some nodes
//    
//    for (var i = 0; i< nodes.length; i++){
//        data["nodes"].push(nodes[i]);
//
//    }
   for (var i = 0; i< edges.length; i++){
       graph.addLink(edges[i].v,edges[i].w);
   }
   console.log(graph.forcelayout());
}*/

/*-----------------------------------MAIN---------------------------------------*/

function main() {
    var bodies = [];
    var Composite = Matter.Composite;

    function render() {
        for (var layer in LAYERS) {
            //        console.log(LAYERS[layer])
            if (LAYERS[layer]["physics-engine"]) {
//                console.log(bodies);
                bodies = Composite.allBodies(LAYERS[layer]["physics-engine"].world);

                /*console.log('LAYERS[layer]["physics-engine"].world.gravity.scale');
                 console.log(LAYERS[layer]["physics-engine"].world.gravity.scale);*/

                for (var i = 0; i < bodies.length; i += 1) {

                    var currentBody = bodies[i];

                    var nodeGraphics = currentBody.svg;
                    //console.log(nodeGraphics)
                    if (nodeGraphics) {

                        if (!!getElementFromGroup(nodeGraphics, 'circle')) {
//                     console.log(currentBody.svg);

                            let newX = currentBody.position.x;
                            let newY = currentBody.position.y;

                            //console.log(newX + " " + newY);
//                        nodeGraphics.cx(newX-nodeGraphics.initX);
//                        nodeGraphics.cy(newY-nodeGraphics.initY);
//                        nodeGraphics.center(,newY-nodeGraphics.initY);

                            nodeGraphics.dmove(newX - nodeGraphics.initX, newY - nodeGraphics.initY);
                            nodeGraphics.initX = nodeGraphics.cx() - nodeGraphics.childDX;
                            nodeGraphics.initY = nodeGraphics.cy() - nodeGraphics.childDY;
                            //console.log(newX);
                            //console.log(nodeGraphics.initX);


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
        console.log(type);
        if (type != 'database'){
            addToolEvents(tools[i], type);
            globalToolsOnCanvas.type = false;
        }
    }
    addMenuEvents();
    //addEvents();
    //addNonToolEvents();






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
        $("#hideEdges").toggleClass('active');
        getActiveLayer().layer.select('g.edge').attr({"opacity":0});
        EDGESHIDDEN = true;

       if (STARTERLAYOUTS[startingLayout] === 'bar'){

            defaultBarChart(starterBarAxesAttributes, 'horizontal');
        }   

        else if (STARTERLAYOUTS[startingLayout] === 'scatter'){
            defaultScatterplot(starterScatterAxesAttributes);
        }
        
        
        //showHideEdges();


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

$(document).ready(function(){
    main(); 
});

/*
$(function () {
    $(this).bind("contextmenu", function (e) {
        e.preventDefault();
    });
});
*/

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



        if (object.node.id.includes("group")) {
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
//            console.log("object:" + object.node.id);
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
        add.gaussianBlur(3)
//                .componentTransfer({
//                    rgb: {type: 'discrete', tableValues: [0, 2, 0.4, 0.6, 0.8, 1]}
//                });
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

//tick counter

function addAttributeValues(attributeName, droppingZone, x, y, space, drawer, direction, proxy,line) {

    let values = getAttributeValues(attributeName);
//    let values = {min: -102, max: 785};
    
    let activeLayer = getActiveLayer();
    let isCategorical = $.isArray(values);
    droppingZone.valueLabels = new Array();

    let group = drawer.group().addClass('ticks-' + attributeName);
    group.addClass(direction);

    let finalX = null;
    let finalY = null;

    let labelAttributes = {
        fill: activeLayer.color,
        "text-anchor": direction === "horizontal" ? "middle" : "end",
        "alignment-baseline": "hanging",
        "dominant-baseline": "middle",
        "font-size": "14px",
        class: 'toolable',
        attrType: attributeName,
        attrDiscrete: getActiveLayer().data[attributeName].discrete
    };
    
    space -= nodeRadius * 2;

    if (isCategorical) {

        if (direction === "horizontal") {
            let d = 50;
            space -= (d * 2);
            x += d;
        } else {
            values.reverse();
            space -= 50;
        }

        let gap = space / (values.length - 1);

        values.forEach(function (value, index) {

//            let parts = direction === "horizontal" ? value.match(/.{1,11}/g) : value.match(/.{1,13}/g);
            let parts = direction === "horizontal" ? value.match(/.{1,11}/g) : value.match(/.{1,9}/g);
            if (direction === "horizontal") {
                finalX = x + (gap * index);
                finalY = y;
            } else {
                finalX = x - 15;
                finalY = y + (gap * index) + nodeRadius;
            }
            
            let label = null;

            
            if (proxy.isAxis){
                label = group.text(value);//drawer.text(value);
            }else{
                label =  group.text(function (add) {//drawer.text(function (add) {
                parts.forEach(function (part) {
                    if (direction === "vertical") {
                        add.tspan(part).dy(15).attr('x', finalX + 47);
                    } else {
                        add.tspan(part).dy(15).attr('x', finalX);
                    }
                });
            });
            }

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
        let minLabel = group.text('' + values.min).attr(labelAttributes);
        proxy.values = values;
        if (direction === "horizontal") {
            x += nodeRadius;
            minLabel.move(x, y + 10);
        } else {
            minLabel.move(line.x() - 15, activeLayer.bottom.line.y() - minLabel.rbox().h / 2 - nodeRadius);
        }

        let majorTicksAttributes = {stroke: 'black', 'stroke-width': 1.5};
        let minorTicksAttributes = {stroke: 'grey', 'stroke-width': 1};
        let shiftMax = 0;
        let maxLabel = group.text('' + values.max).attr(labelAttributes);
        if (direction === "horizontal") {
            finalX = x + space + shiftMax;
            finalY = y + 10;
            minTick = group.line(x, y - 2, x, y + 10).attr(majorTicksAttributes);
            proxy.values.minPos = x,
            maxTick = group.line(finalX, y - 2, finalX, y + 10).attr(majorTicksAttributes);
            proxy.values.maxPos = finalX;
        } else {
            finalX = line.x() - 15, y + 10;
            finalY = activeLayer.left.line.y() + nodeRadius;
            minTick = group.line(line.x(), minLabel.cy(), line.x() - 10, minLabel.cy()).attr(majorTicksAttributes);
            proxy.values.minPos = minLabel.cy();
        }
        maxLabel.move(finalX, finalY);

        // this has to be done after the maxLabel has been moved
        if (direction === "vertical") {
            maxTick = group.line(line.x(), maxLabel.cy(), line.x() - 10, maxLabel.cy()).attr(majorTicksAttributes);
            proxy.values.maxPos = maxLabel.cy();
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
                let majorLabel = group.text('' + interpolation).attr(labelAttributes);

                if (direction === "horizontal") {
                    majorTick = group.line(pos, activeLayer.bottom.line.y(), pos, activeLayer.bottom.line.y() + 10).attr(majorTicksAttributes);
                    majorLabel.move(pos, y + 10);
                } else {
                    majorTick = group.line(line.x(), pos, line.x() - 10, pos).attr(majorTicksAttributes);
                    majorLabel.move(line.x() - 15, pos - majorLabel.rbox().h / 2);
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
                        minorTick = group.line(i, activeLayer.bottom.line.y(), i, activeLayer.bottom.line.y() + 7).attr(minorTicksAttributes);
                    } else {
                        minorTick = group.line(line.x(), i, line.x() - 7, i).attr(minorTicksAttributes);
                    }
                    droppingZone.valueLabels.push(minorTick);
                }
            }






        }

    }


}

function removeAttributeValues(attributeName, direction){
    $('.ticks-' + attributeName + "." + direction).remove();
}

function addAttributesAsTools(attributesSet) {

    for (var index in attributesSet) {
        let attribute = attributesSet[index];
        var bar = document.getElementById('set-tools');
        var attrTool = document.getElementById('tool-element').content.cloneNode(true);

        $(attrTool.querySelector("button")).html(attribute);
        $(attrTool.querySelector("button")).attr({"id": attribute});
        $(attrTool.querySelector("button")).addClass("attributeTool");
        $(attrTool.querySelector('button')).attr({'display': 'none'});


        //$('#attributes-container').append(attrTool);
        $("#search-bar-container").before(attrTool);
        // true because everything is discrete now
        addAttributesDraggingEvents($("#" + attribute)[0], attribute, true);
        console.log($('#' + attribute.toString()));

        //drawLineFromDatabase($('#' + attribute.toString()));

    }

}

function drawLineFromDatabase(attributeButton, i){
    let initialPos = attributeButton.position();
    let top = initialPos.top;
    let left = initialPos.left;
    let w = attributeButton.outerWidth();
    let h = attributeButton.outerHeight();
    let attribute_coordinates = {x: left + w/2, y: top + h/2}; //absolute coords -- centerpoint 
    
    let db_button = $('#database')
    let db_initialPos = db_button.position();
    let db_top = db_initialPos.top;
    let db_left = db_initialPos.left;
    let db_w = db_button.outerWidth();
    let db_h = db_button.outerHeight();
    let db_coordinates = {x: db_left + db_w/2, y: db_top + db_h/2}; //absolute coordinates of the center

    console.log(attribute_coordinates);
    console.log('sl')
    console.log(db_coordinates);
    let d = document.createElement('div');

    //dirty if statement hack to not have liens drawn on the left for some reason
    if (attribute_coordinates.x > db_coordinates.x){
        $(d).addClass('database_line');
        $(d).attr({id: i});
        $(d).css({
            position: 'absolute',
            height: '20px',
            width: attribute_coordinates.x - db_coordinates.x,
            top: '5px',
            //top: db_coordinates.y - 20,
            left: db_left + db_w/2,

            fill: 'transparent'
        });

        $('#database').after(d);
    }

    /*rect = drawer.rect(Math.min(label.rbox().w + 10, 82), 30).attr({
        fill: '#d8d9df',
        rx: 5,
        ry: 5,
        stroke: "#858796",
        class: 'toolable proxy',
        value: attributeName,
        isDiscrete: isDiscrete
    }).center(startingPoint.x, startingPoint.y);

*/

    //distance between this and button

    //$('#set-tools').append()
    //draw in set tools
    //drawer.line(w, 0, drawer.width() - w - 20, 0).move(w, layerHeight - h).attr(lineAttributes)

    //calculate line
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
function getValuesByAttributeDict(elements, keySet) {
    var uniqueAttrValues = {};
    for (var index in keySet) {
        var key = keySet[index];
        uniqueAttrValues[key] = {"discrete":true,values:{}};

        for (var elIndex in elements) {
            var data = getElementFromGroup(elements[elIndex], 'circle').nodeData.authorInfo;
            if (Object.keys(data).includes(key)) {

                if (Object.keys(uniqueAttrValues[key].values).includes(data[key].toString())) {
//                    console.log(uniqueAttrValues[text][data[text]]);

                    uniqueAttrValues[key].values[data[key]].push(elements[elIndex]);
//                    uniqueAttrValues[text.toString()].push("prueba");

                } else {
                    uniqueAttrValues[key].values[data[key]] = [elements[elIndex]];
//                    uniqueAttrValues[text][data[text]] = [elements[elIndex]];  
                }
            }
        }
        
        uniqueAttrValues[key].discrete = !isNumericArray(Object.keys(uniqueAttrValues[key].values));
    }
    return uniqueAttrValues;
}


function getAttributeValues(attributeName) {

//    var nodes = getActiveLayer().layer.select('g.node').members;
//    var activeLayerAtributesLabels = getActiveLayer().attributes;
//    console.log(attributeName);
//    console.log(getValuesByAttributeDict(nodes, activeLayerAtributesLabels)[attributeName]);

    var attributeValues = Object.keys(getActiveLayer().data[attributeName].values);

    if (isNumericArray(attributeValues)) {
        var min = Math.min.apply(null, attributeValues);
        var max = Math.max.apply(null, attributeValues);
        return {min: min, max: max, isDiscrete:false};

    } else {
        return attributeValues;
    }
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

        var label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex] + width / 2, y + height / 2 - 5, GRAPHTOLOAD, aff).attr({fill: "white"});
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

            label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex] + width / 2, fixedAxis + height / 2 - 5, GRAPHTOLOAD, aff).attr({fill: "white"});

            addAttractorToWorld(world, attractorGraphics);


            //    addElementsToWorld(world,'1');

            var attractor = attractorGraphics.matter;
            var aff = Object.keys(attractees)[attractIndex];

//            var label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex]+width/2,y+height/2-5, GRAPHTOLOAD, aff).attr({fill:"white"});
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
            label = drawLabel(getActiveLayer().layer, aff, fixedAxis + height / 2 - 5, positions[attractIndex] + width / 2, GRAPHTOLOAD, aff).attr({fill: "white"}).transform({rotation: 270});
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

/*function setWalls(distance, chosen, orientation) {

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
            addDragEvents(new Hammer(wall1.node), wall1, wall1, 'wall');
            addAttractorToWorld(world, wall1);
        });
//            
        let wall2 = getActiveLayer().layer.rect(5, 0).move(position + width / 2 + nodeRadius / 2 + 5, fixedAxis - generalHeight).fill(getActiveLayer().color).back();
        wall2.animate(time).height(generalHeight).after(function () {
            addDragEvents(new Hammer(wall2.node), wall2, wall2, 'wall');
            addAttractorToWorld(world, wall2);
        });
    }
}*/

var crossedPoint = false;

function buildWall(graphicObject, width, height, originPosition, mode, insideSpace, orientation, isProxy) {
    var world = getPhysicsEngine(getActiveLayerName()).world;
    var direction = graphicObject.direction;
    entityGroup = getActiveLayer().layer.group().addClass('wall-' + direction);
//    console.log(direction);
    //console.log(graphicObject)


    if (mode === 'both') {
        if (!graphicObject.walls) {
            if (direction === "horizontal") {
//                console.log("drawing horizontal");
                
                let originXleft = originPosition[0] - nodeRadius/1.5;
                let originXright = originPosition[0] + nodeRadius/1.5 - width;

                if (originXright - originXleft > 28){
                    originXright = originPosition[0] + nodeRadius/2.25 - width;
                }
                let originY = originPosition[1];

                if (isProxy){
                    originXleft = originPosition[0] - graphicObject.width()/2;
                    originXright = originPosition[0] + graphicObject.width()/2;
                }
                
                let wall1 = entityGroup.rect(width, height).move(originXleft, originY).fill('gray').attr({'stroke': 'transparent', 'stroke-width': 20}).back();
                wall1.position = "left"
                wall1.direction = direction;
                wall1.wall = true;
                wall1.previousIncrement = 0;
                wall1.addClass('wall-1');

                if (isProxy){
                    wall1.addClass('proxy');
                    wall1.attr({'stroke': 'black', 'stroke-width': 1.5})
                }
                addAttractorToWorld(world, wall1);
                addDragEvents(new Hammer(wall1.node), wall1, wall1, 'wall', isProxy, graphicObject);

                let wall2 = entityGroup.rect(width, height).move(originXright, originY).fill('gray').attr({'stroke': 'transparent', 'stroke-width': 20}).back();              
                wall2.position = "right"
                wall2.direction = direction;
                wall2.wall = true;
                wall2.previousIncrement = 0;
                wall1.y(wall1.y()-height);
                wall2.y(wall2.y()-height);
                wall2.addClass('wall-2');

                if (isProxy){
                    wall2.addClass('proxy');
                    wall2.attr({'stroke': 'black', 'stroke-width': 1.5})
                }
                addAttractorToWorld(world, wall2);
                addDragEvents(new Hammer(wall2.node), wall2, wall2, 'wall', isProxy, graphicObject);
                graphicObject.walls = [wall1, wall2];
                
            } 
            else if (direction === 'vertical') {

                let originYtop = originPosition[1] - nodeRadius/1.5;
                let originYbottom = originPosition[1] + nodeRadius/1.5 - height;
                let originX = originPosition[0];

                if (isProxy){
                    originYtop = originPosition[1] - graphicObject.height()/2;
                    originYbottom = originPosition[1] + graphicObject.height()/2;
                }

                let wall1 = entityGroup.rect(width, height).move(originX, originYtop).fill('gray').attr({'stroke': 'transparent', 'stroke-width': 20}).back();
                wall1.direction = direction;
                wall1.position = "top"
                wall1.wall = true;
                wall1.previousIncrement = 0;
                wall1.addClass('wall-1');

                if (isProxy){
                    wall1.addClass('proxy');
                    wall1.attr({'stroke': 'black', 'stroke-width': 1.5})
                }
                addAttractorToWorld(world, wall1);
                addDragEvents(new Hammer(wall1.node), wall1, wall1, 'wall', isProxy, graphicObject);


                let wall2 = entityGroup.rect(width, height).move(originX, originYbottom).addClass('wall-2').fill('gray').attr({'stroke': 'transparent', 'stroke-width': 20}).back();            
                wall2.position = "bottom";
                wall2.direction = direction;
                wall2.wall = true;
                wall2.previousIncrement = 0;
                wall2.addClass('wall-2');

                if (isProxy){
                    wall2.addClass('proxy');
                    wall2.attr({'stroke': 'black', 'stroke-width': 1.5})
                }
                addAttractorToWorld(world, wall2);
                addDragEvents(new Hammer(wall2.node), wall2, wall2, 'wall', isProxy, graphicObject);

                graphicObject.walls = [wall1, wall2];
            }

        } 
        else {
            if (direction === "horizontal") {
                
                /*console.log("HEIGHT");
                console.log(graphicObject.walls[0].height());*/
                
                if (orientation==="up"){
                    var increment = height-graphicObject.walls[0].previousIncrement;
                    graphicObject.walls[0].previousIncrement = height;

                    if (graphicObject.walls[0].height() + increment < generalHeight - 20){
                        height = graphicObject.walls[0].height() + increment;
                    }
                    
                    //height = graphicObject.walls[0].height() + increment;

                }
                else{
                    var increment = graphicObject.walls[0].previousIncrement-height;
                    graphicObject.walls[0].previousIncrement = height;

                    if (graphicObject.walls[0].height() - increment >= 0){
                        height = graphicObject.walls[0].height() - increment;
                    }
                   
                    //height = graphicObject.walls[0].height() - increment;
                }
                
                
                var scale = height / graphicObject.walls[0].height();


                var step = height - graphicObject.walls[0].height();
                var wall1 = graphicObject.walls[0];
                var wall2 = graphicObject.walls[1];

                wall1.height(height);
                wall2.height(height);

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



                Matter.Body.scale(wall1.matter, 1, scale);
                Matter.Body.scale(wall2.matter, 1, scale);
                //            
                Matter.Body.setPosition(wall1.matter, {x: wall1.cx(), y: wall1.cy()});

                Matter.Body.setPosition(wall2.matter, {x: wall2.cx(), y: wall2.cy()});
            } 
            else if (direction === "vertical") {
//                console.log("BUILDING WALL");
//                console.log(width);
//                console.log(graphicObject.walls[0].width()!=width);
//                if (graphicObject.walls[0].width()>width){
                    
                    if (orientation==="right"){
                        var increment = width-graphicObject.walls[0].previousIncrement;
                        graphicObject.walls[0].previousIncrement = width;
                        width = graphicObject.walls[0].width() + increment;
                    }else{
                        var increment = graphicObject.walls[0].previousIncrement-width;
                        graphicObject.walls[0].previousIncrement = width;
                        width = graphicObject.walls[0].width() - increment;
                    }

                var scale = width / graphicObject.walls[0].width();


                var wall1 = graphicObject.walls[0];
                var wall2 = graphicObject.walls[1];


                wall1.width(width);
//                console.log("height: "+height);
//                console.log("step: "+step);
//                if(step<0&&height===0){
//                    graphicObject.crossedPoint = !graphicObject.crossedPoint ;
//                }
//                
//                if (!graphicObject.crossedPoint){
//                    wall1.y(wall1.y()-step);
//                    wall2.y(wall2.y()-step);
//                }

                //            

                wall2.width(width);




                Matter.Body.scale(wall1.matter, scale, 1);
                Matter.Body.scale(wall2.matter, scale, 1);

                Matter.Body.setPosition(wall1.matter, {x: wall1.cx(), y: wall1.cy()});

                Matter.Body.setPosition(wall2.matter, {x: wall2.cx(), y: wall2.cy()});

                wall1.matter.bounds.max.x = wall1.matter.bounds.max.x + 5;
            }
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
            label = drawLabel(getActiveLayer().layer, aff, positions[attractIndex] + width / 2, fixedAxis + height / 2 - 5, GRAPHTOLOAD, aff).attr({fill: "white"});
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
            label = drawLabel(getActiveLayer().layer, aff, fixedAxis + height / 2 - 5, positions[attractIndex] + width / 2, GRAPHTOLOAD, aff).attr({fill: "white"}).transform({rotation: 270});
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

function highlightNodesByAttributeValue(attributeValue, attributeName, show) {

    var groups = getActiveLayer().data[attributeName].values[attributeValue];
    for (var index in groups) {
        let circle = getElementFromGroupByPropertyValue(groups[index],'type','circle');
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

function initializeWalls(attributeGraphics,wallSize,insideSpace,direction,orientation,axis){
    
    if (orientation === "horizontal") {

            var y = axis.line.cy();
//            console.log("changing");
//            console.log(y);

            if ($(attributeGraphics.node).hasClass('proxy')) {
                attributeGraphics.axis = axis;

//                the proxy thing
//                change line 797 after demo 
                var xProxy = attributeGraphics.rbox().cx;// - $("#accordionSidebar").width();
                buildWall(attributeGraphics, wallSize, 5, [xProxy, y], 'both', insideSpace, direction, true);

                for (var index in axis.valueLabels) {

                    var x = axis.valueLabels[index].cx();

                    //BOLD THE TEXT
//                    boldText(axis.valueLabels[index]);

                    buildWall(axis.valueLabels[index], wallSize, 5, [x, y], 'both', insideSpace, direction);
                }
            } else {
                buildWall(attributeGraphics, wallSize, 5, [attributeGraphics.cx(), y], 'both', insideSpace, direction);
            }
        } else if (orientation === "vertical") {
            let x = axis.line.cx();
            var yProxy = attributeGraphics.rbox().cy - 70;
            buildWall(attributeGraphics, 5, wallSize, [x, yProxy], 'both', insideSpace, direction, true);

            if ($(attributeGraphics.node).hasClass('proxy')) {
                attributeGraphics.axis = axis;

                //the proxy thing
                for (var index in axis.valueLabels) {
                    var y = axis.valueLabels[index].cy();
                    //BOLD THE TEXT
//                    boldText(axis.valueLabels[index]);
                    buildWall(axis.valueLabels[index], 5, wallSize, [x, y], 'both', insideSpace, direction);
                }
            } else {
                buildWall(attributeGraphics, 5, wallSize, [x, attributeGraphics.cy()], 'both', insideSpace, direction);
            }
        }
    }