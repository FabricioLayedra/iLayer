/*--------------------------------CONSTANTS-------------------------------------*/


var datafile = "./data/authors_relations_2016.json";

var LAYERS = {};

var GRAPHS = {};

var el = document.getElementById("layers-table");

var sortable = new Sortable(el,{

  onEnd: function (evt) {
    var list = document.getElementById("layers-table").getElementsByTagName("li");
    sort_layers(list);
}});


/*----------------------------CREATION OF LAYERS--------------------------------*/

function add_new_layer(layer_name){
    var layer = create_layer(layer_name);
    var color = Math.floor(Math.random()*16777215).toString(16);
    $(layer.querySelector(' div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("style","background-color:#"+color+"; height: auto; width: 5px"); 
    $("#layers-table").append(layer);
    sort_layers($("#layers-table"));
    return color;
}

function create_layer(layer){
    var canvas = document.createElement("div");
    var container = document.getElementById("set-canvases");
    canvas.setAttribute("id",layer);
    canvas.setAttribute("style","position: absolute");
    container.appendChild(canvas);
    
    create_svg(layer,1200,800);
    
    var template = document.getElementById('li-element').content.cloneNode(true);
    if (typeof layer === "undefined"){
        var id = random_id();
    }else{
        var id = layer;
    }
    
    change_layer_names(template,id);
    add_events(template);
    return template;
}

function create_svg(layer_name,width,height){
    var draw = SVG(layer_name).size(width,height);
    LAYERS[layer_name] = {"layer":draw,"physics-engine": ""};
}

function change_layer_names(item,id){
    //Change this function is anything changes at the nav-item html template
    $(item.querySelector('div > div:nth-child(1) > div.col-sm-auto.pr-0 > input')).attr("layer",id);
    $(item.querySelector('div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("id","color-"+id);
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("id","p-"+id); 
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("value","Layer " + id); 
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("data-target","#collapse-"+id);
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("aria-controls","collapse-"+id);
    $(item.querySelector('div > div.row.collapse')).attr("id","collapse-"+id);
    $(item.querySelector('div > div.row.collapse > div > div.row > h6:nth-child(2)')).attr("id","opacity-"+id);
    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).attr("id","range-"+id);
    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).attr("id","gravity-handler-"+id);
}

function add_events(item){
    //checkbox opacity
    $(item.querySelector('div > div:nth-child(1) > div.col-sm-auto.pr-0 > input')).change(function(){show_hide_layer(this);});
    //checkbox physics
    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).change(function(){gravity_handler(this);});
    //button
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).click(function(){stop_drag();});
    //range
    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).on("input",function(){console.log("run");opacity_changer(this);});
}

function show_hide_layer(checkbox){
    var layer = "#" + $(checkbox).attr("layer").toLowerCase().split(" ");
    console.log(layer);
    if (checkbox.checked){
        $(layer).css("display","block");
    }else{
        $(layer).css("display","none");
    }
    // else{
    //     // d3.selectAll(layer).style("opacity",0);
    // }
};

function gravity_handler(checkbox){
    var layer = checkbox.id.split("-")[2];

    if (checkbox.checked){
        
        console.log(checkbox.id)
        //Initialize the engine if it is not created
        var engine; 
        if (LAYERS[layer]["physics-engine"].length===0){
            create_physics_worlds(layer);
            engine = LAYERS[layer]["physics-engine"];
            console.log(LAYERS[layer]["physics-engine"]);
            //add elements to physics world
            add_elements_to_world(engine.world,layer);
        }else{
            engine = LAYERS[layer]["physics-engine"];
        }
        //Initialize the engine if it is not created

        console.log("Adding physics...");
    }else{
        if (LAYERS[layer]["physics-engine"].length===0){
            console.log("No engine");
        }else{
            console.log("Stoping engine...");
//            stop_physics(LAYERS[layer]["physics-engine"]);
               LAYERS[layer]["physics-engine"] = "";

        }
        console.log("Removing physics...");
    }   
}

function stop_drag(){
    console.log(sortable["options"]["disabled"]);
    if (sortable["options"]["disabled"] === true){
        sortable["options"]["disabled"] = false;
    }else{
        sortable["options"]["disabled"] = true;
    }
}

function opacity_changer(range){
//   sortable["options"]["disabled"] = false;
   console.log(sortable["options"]["disabled"]);
    var layer_name = range.id.split("-")[1];
    $("#opacity-"+layer_name).html(range.value);
    //SEARCH FOR SELLECT ALL THE ELEMENTS OF THE LAYERS
    SVG.get(get_svg_id(layer_name)).select("circle").attr("fill-opacity",range.value/100);
    //
    //d3.selectAll("."+layer_name).style("opacity",this.value/100);
    //CHANGE TO NEW LIBRARY
};

function sort_layers(list){
    for (var element of Array.prototype.slice.apply(list)){
       var layer = element.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input:nth-child(1)').getAttribute("value").toLowerCase().split(" ")[1];
      // render the layers
//      console.log(layer);
      $("#set-canvases").prepend($("#"+layer).detach());
    }    
}


/*---------------------------------PHYSICS--------------------------------------*/

function create_physics_worlds(layer_name){
    Matter.use('matter-attractors');

    // module aliases
    var Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies;

    // create an engine
    var engine = Engine.create();


    // create demo scene
    var world = engine.world;

    var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});
    World.add(world, ground);
    //Add more boundaries
    Engine.run(engine);
    LAYERS[layer_name]["physics-engine"] = engine;
}

//send a matter engine to restart it
function run_physics(engine){
    engine.enabled = true;
} 

//send a matter engine to stop it
function stop_physics(engine){
    engine.enabled = false;
}
    
function add_gravity(engine){
    if (engine.world.gravity.scale > 0){   
//        document.querySelector('#add-gravity > span.text.text-white-50').textContent = "Add gravity" ;
        engine.world.gravity.scale = 0;
    } else{
//        document.querySelector('#add-gravity > span.text.text-white-50').textContent = "Remove gravity" ;
        engine.world.gravity.scale = 0.000001;
    }
}

function add_elements_to_world(world,layer){
    var Bodies = Matter.Bodies;
    var World = Matter.World;
    
    var g = LAYERS[layer]["graph"];
    var nodeKeys = g.nodes();
    var edges = g.edges();

    // adding to the nodes objects of the graph both the fabric and the matter associated objects
    nodeKeys.forEach(function (nodeKey) {

        var nodeData = g.node(nodeKey);
        var fabricObject = nodeData.svg;
        var x = fabricObject.cx();     
        var y = fabricObject.cy();
        var radius = fabricObject.attr("r");
        console.log(fabricObject);        
        console.log(x,y,radius);


        var matterObject = Bodies.circle(x, y, radius);
        nodeData.matter = matterObject;
        matterObject.svg = fabricObject;
        fabricObject.matter = matterObject;
        
        World.add(world,matterObject);
        
//        matterObject.layer = "default";
//
//        fabricObject.layer = "default";

        //canvas.add(fabricObject);

//        addMouseEvents(fabricObject);

        //addMovingEvents(fabricObject, nodeData);

    });
//
//    edges.forEach(function (edge) {
//
//        var from = g.node(edge.v);
//        var to = g.node(edge.w);
////        console.log("FROM-TO");
////        console.log(from);
////        console.log(to);
//
//        var fromCenterX = from.svg.cx();
//        var fromCenterY = from.svg.cy();
//
//        var toCenterX = to.svg.cx();
//        var toCenterY = to.svg.cy();
//
//        // creating a QUADRATIC CURVE. See https://www.sitepoint.com/html5-svg-quadratic-curves/ and http://fabricjs.com/quadratic-curve
//        var path = "M" + fromCenterX + "," + fromCenterY + " Q" + (fromCenterX + (toCenterX - fromCenterX) / 2) + "," + (fromCenterY + (toCenterY - fromCenterY) / 2) + " " + toCenterX + "," + toCenterY;
//
//        var edgePath = draw.path(path).attr({
//            stroke: 'black',
//            fill: 'transparent',
//            strokeWidth: 1
////            lockMovementX: true,
////            lockMovementY: true,
////            hasControls: false,
////            hasBorders: false,
////            perPixelTargetFind: true,
////            objectCaching: false
//        });
////        canvas.add(edgePath);
////        edgePath.layer = "default";
//
//        to.inEdges.push(edgePath);
//        from.outEdges.push(edgePath);
//
//    });

}


/*----------------------------GRAPHS' ACTIONS-----------------------------------*/

function showCoords(event) {
  var x = event.clientX;
  var y = event.clientY;    
  return [x,y];
}

//loads the JSON file and creates the graph using graphLib and returns it.
function loadGraph(filename,key){
    $.getJSON(filename).done(function(json){
        // Create a new directed graph
        var g = new graphlib.Graph({directed: false});

        var edges = json.links;
        var nodes = json.nodes;

        nodes.forEach(function (data) {
            // console.log(data);
            g.setNode(format_id(data["id"]), {authorInfo: {name: data["id"], group:data["group"]}});
        });

        edges.forEach(function (data) {
            //Load it data-drivenish (TO DO)
            g.setEdge(format_id(data["source"]), format_id(data["target"]), {colabInfo: {value: data["value"],id: data["id"]}});
        });

//        var color = "#"+ add_new_layer(layer_name);
//        drawGraph(LAYERS[layer_name].layer,g,layer_name);
//        var svg_id = $("#"+layer_name).children("svg").attr("id");
//        SVG.get(svg_id).select("circle").fill(color);
        return g;
    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
        return null;
    });
    
}

//Receives a node or an edge and add it to the elements of the layer
//Type N--> node E --> edge
//Add types as you want
function drawElementInLayer (drawer,element,type){
    
        var nodeData = element;
        if (directed){
            nodeData.inEdges = new Array();
            nodeData.outEdges = new Array();
        }else{
            nodeData.edges = new Array();
        }

        var radius = 20;
        //HERE WE HAVE TO SET THE POSITION TAKING INTO ACCOUNT A LAYOUT
        var y = getRandomBetween(50, 800);
        var x = getRandomBetween(50, 1000);

        var fabricObject = draw.circle(radius).attr({
        cx: x,
        cy: y,
        id: nodeKey,
        //Fill
        fill: 'purple'
        }).move(x,y)
                .click(function(){
                    
                    get_spanning_tree(this,1);
                    

        });
        //Add context_menu to the element using the selector, in this case the id
        add_context_menu("#"+nodeKey);
        fabricObject.draggable();

        nodeData.svg = fabricObject;
    if (type==="N"){
        var radius = 20;
        //HERE WE HAVE TO SET THE POSITION TAKING INTO ACCOUNT A LAYOUT
        var y = getRandomBetween(50, 800);
        var x = getRandomBetween(50, 1000);
        
        var fabricObject = drawer.circle(radius).attr({
            cx: x,
            cy: y,
            id: nodeKey,
            //Fill
            fill: 'purple'
            }).move(x,y)
//            .click(function(){
//
//                        get_spanning_tree(this,1);
//
//
//            })
            
    }
}

function drawGraph(draw,g,layer) {
    var directed = g.directed;
    var nodeKeys = g.nodes();
    var edges = g.edges();
    
    // adding to the nodes objects of the graph both the fabric and the matter associated objects
    nodeKeys.forEach(function (nodeKey) {
        
        var nodeData = g.node(nodeKey);
        if (directed){
            nodeData.inEdges = new Array();
            nodeData.outEdges = new Array();
        }else{
            nodeData.edges = new Array();
        }

        var radius = 20;
        //HERE WE HAVE TO SET THE POSITION TAKING INTO ACCOUNT A LAYOUT
        var y = getRandomBetween(50, 800);
        var x = getRandomBetween(50, 1000);

        var fabricObject = draw.circle(radius).attr({
        cx: x,
        cy: y,
        id: nodeKey,
        //Fill
        fill: 'purple'
        }).move(x,y)
                .click(function(){
                    
                    get_spanning_tree(this,1);
                    

        });
        //Add context_menu to the element using the selector, in this case the id
        add_context_menu("#"+nodeKey);
        fabricObject.draggable();

        nodeData.svg = fabricObject;
    });
    
    edges.forEach(function (edge) {

        var from = g.node(edge.v);
        var to = g.node(edge.w);

        var fromCenterX = from.svg.cx();
        var fromCenterY = from.svg.cy();

        var toCenterX = to.svg.cx();
        var toCenterY = to.svg.cy();

        // creating a QUADRATIC CURVE. See https://www.sitepoint.com/html5-svg-quadratic-curves/ and http://fabricjs.com/quadratic-curve
        var path = "M" + fromCenterX + "," + fromCenterY + " Q" + (fromCenterX + (toCenterX - fromCenterX) / 2) + "," + (fromCenterY + (toCenterY - fromCenterY) / 2) + " " + toCenterX + "," + toCenterY;

        var edgePath = draw.path(path).attr({
            stroke: 'gray',
            fill: 'transparent',
            strokeWidth: 1
//            lockMovementX: true,
//            lockMovementY: true,
//            hasControls: false,
//            hasBorders: false,
//            perPixelTargetFind: true,
//            objectCaching: false
        });
//        canvas.add(edgePath);
//        edgePath.layer = "default";
        if (directed){
            to.inEdges.push(edgePath);
            from.outEdges.push(edgePath);
        }else{
            to.edges.push(edgePath);
            from.edges.push(edgePath);
        }

    });
    LAYERS[layer]["graph"] = g;
}

// Adds a graph as a layer in the graph 
function addGraphAsLayer(g, layer_name){
    
}

//loads the JSON file and draws the graph in a layer named after the parameter.
function readDataColab(filename,layer_name){
    $.getJSON(filename).done(function(json){
        // Create a new directed graph
        var g = new graphlib.Graph({directed: false});

        var edges = json.links;
        var nodes = json.nodes;

        nodes.forEach(function (data) {
            // console.log(data);
            
            g.setNode(format_id(data["id"]), {authorInfo: {name: data["id"], group:data["group"]}});
        });

        edges.forEach(function (data) {
            g.setEdge(format_id(data["source"]), format_id(data["target"]), {colabInfo: {value: data["value"],id: data["id"]}});
        });
        var color = "#"+ add_new_layer(layer_name);
        drawGraph(LAYERS[layer_name].layer,g,layer_name);
        var svg_id = $("#"+layer_name).children("svg").attr("id");
        SVG.get(svg_id).select("circle").fill(color);

        


    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
    });
    
}

function get_svg_id(layer_name){
    return $("#"+layer_name).children("svg").attr("id");
}

function getGraphFromSVGElement(svgElement){
   var layer_name = $(svgElement.parent().parent()).attr("id");
   var graph = LAYERS[layer_name]["graph"];
   return graph;
};

function sendNodeToLayer(svgElement,layerOrigin,layerDestination){
   var layer_name = $(svgElement.parent().parent()).attr("id");
   var graph = LAYERS[layer]["graph"];
   
   return graph;
};

function get_spanning_tree(svgElement,n_levels){
    var graph = getGraphFromSVGElement(svgElement);
    var edges = graph.edges();
//    var limit;
//    if (graph.directed){
//        limit = source.inEdges.length + source.outEdges.length;
//    }else{
//        limit = source.edges.length;
//    }
//    console.log(limit);
    var count = 0;
    edges.forEach(function (edge){
        if (graph.directed){
//            if (edge.v === svgElement.attr("id")){
//                console.log("YEIH!")
//            }
        }else{
            var neighbour;
            if (edge.v === svgElement.attr("id")){
                neighbour = edge.w;
                count++;

            }else if(edge.w === svgElement.attr("id")){
                neighbour = edge.v;
                count++;
            }
        }
//        console.log(count);
//        console.log(limit);
//
//        if (count>=limit){
//            return;
//        }
    });
//    svgElement.attr("id");
//    if (n_levels === 1){
//        
//        for (var i = 0 ; i < node.inEdges.length; i++){
////            node.clone().putIn(svgElement.parent());
////            node.remove();
//            console.log(node.inEdges[i].v);
////            console.log(node.inEdges[i].clone());
//
//            /* REMOVE AND ADD TO OTHER LAYER*/
////            var collected = node.inEdges[i].remove();
////            
////            svgElement.parent().put(collected);
//        }
//    }else{
//        //recursive
//    }
    
    
}


/*-----------------------------CONTEXT MENU-------------------------------------*/

function add_context_menu(sel){
    $.contextMenu({
        selector: sel,         
        build: function($trigger, e) {
            var data = get_layers_names(LAYERS);
            // this callback is executed every time the menu is to be shown
            // its results are destroyed every time the menu is hidden
            // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
            return {
                callback: function(key, options) {
                },
                items: {
                    "send":{
                        "name":"Send to...",
                        "items":generate_menu_layers_names(
                                    data,
                                    function(){
                                        send_element_to_layer(sel);
                                    })
                    },
                    "ego":{
                        "name":"Send adjacents to...",
                        "items":generate_menu_layers_names(
                                    data,
                                    function(){
                                        send_adjacents_to_layer(sel);
                                    })
                    },
                    "select":{"name":"Select .."}
                }    
            };
        }
    });
};

function generate_menu_layers_names(list,callback){
    var items = {};
    var count = list.length;

    for(var i = 0; i < count; i++) {
        var text = list[i];
       var item = {};
       item["name"] =  text;
       item["callback"] = callback;
       items[text] = item;
       
    }
    return items;
}

function get_layers_names(dict){
    return Object.keys(dict);
}

function send_element_to_layer(selector){
    console.log($(selector));
}

function send_adjacents_to_layer(){
    
}


/*-----------------------------------MAIN---------------------------------------*/

function main(){
    var bodies = [];
    var Composite = Matter.Composite;

    (function render() {
        for (let layer in LAYERS){
    //        console.log(LAYERS[layer])
            if (LAYERS[layer]["physics-engine"].world){
                bodies = Composite.allBodies(LAYERS[layer]["physics-engine"].world);
                for (let i = 0; i < bodies.length; i += 1) {

                    let currentBody = bodies[i];
                    let fabricObject = currentBody.svg;


                    if (fabricObject) {
                        let newX = currentBody.position.x;
                        let newY = currentBody.position.y;
                        fabricObject.attr("cx",newX);
                        fabricObject.attr("cy",newY);

            //            fabricObject.setPositionByOrigin({x: newX, y: newY}, 'center', 'center');
            //            fabricObject.setCoords();
                    }
                }
            }
        }


        window.requestAnimationFrame(render);

    //
    //    
    //    
    //
    ////    if (drawVertices) {
    ////        context.fillStyle = '#fff';
    ////        context.fillRect(0, 0, canvas.width, canvas.height);
    ////        context.beginPath();
    ////    }
    //

    //
    //    if (drawVertices) {
    //        context.lineWidth = 1;
    //        context.strokeStyle = '#999';
    //        context.stroke();
    //    }

    })();



    readDataColab(datafile,"collaborations");
    
    $("#new-layer").click(function(){
        add_new_layer(random_id());
    //    readDataColab(datafile,random_id());
        sort_layers(el);
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