var datafile = "https://raw.githubusercontent.com/FabricioLayedra/CiverseData/master/authors_relations_2016.json";

var LAYERS = {};

function create_svg(layer_name,width,height){
    var draw = SVG(layer_name).size(width,height);
    LAYERS[layer_name] = {"layer":draw,"physics-engine": ""};
}

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

//send a matter engine to stop it
function stop_physics(engine){
    engine.enabled = false;
}
    
//send a matter engine to restart it
function run_physics(engine){
    engine.enabled = true;
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

function showCoords(event) {
  var x = event.clientX;
  var y = event.clientY;    
  return [x,y];
}

/* USING GRAPHLIB*/

function addMovingEvents(fabricObject, nodeData) {
    fabricObject.on({
        moving: function (options) {
            nodeData.inEdges.forEach(function (inEdge) {
                var center = fabricObject.getPointByOrigin('center', 'center');
                inEdge.path[1][3] = center.x;
                inEdge.path[1][4] = center.y;
            });
            nodeData.outEdges.forEach(function (outEdge) {
                var center = fabricObject.getPointByOrigin('center', 'center');
                outEdge.path[0][1] = center.x;
                outEdge.path[0][2] = center.y;
            });
        }
    });
}

function addMouseEvents(object) {
//    object.draggable();
    
    object.mousedown(function(){
        object.mousedown = true;  
    });
    
    object.touchmove(function(event){  
        console.log("moving");
        if (!object.mousedown)
            return;
        var pointer = showCoords(event);
//        var pointer = canvas.getPointer(options.e);
//        console.log(object.matter);

//        Body.translate(object.matter, {
//            x: (pointer[0] - object.matter.position.x) * 0.25,
//            y: (pointer[1] - object.matter.position.y) * 0.25
//        });
        
    });
    
    object.mouseup(function(){
        object.mousedown = false;
    });
}

function drawGraph(draw,g,layer) {

    var nodeKeys = g.nodes();
    var edges = g.edges();

    // adding to the nodes objects of the graph both the fabric and the matter associated objects
    nodeKeys.forEach(function (nodeKey) {

        var nodeData = g.node(nodeKey);

        nodeData.inEdges = new Array();
        nodeData.outEdges = new Array();

        var radius = 20;
        //HERE WE HAVE TO SET THE POSITION TAKING INTO ACCOUNT A LAYOUT
        var y = getRandomBetween(50, 800);
        var x = getRandomBetween(50, 1000);

        var fabricObject = draw.circle(radius).attr({
        cx: x,
        cy: y,
        //Fill
        fill: 'purple'
        }).move(x,y);
        fabricObject.draggable();

        nodeData.svg = fabricObject;
    });

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
//            stroke: 'white',
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
    LAYERS[layer]["graph"] = g;
}

//Read the JSON file and draw the graph in a layer named after the parameter.
function readDataColab(filename,layer_name){
    $.getJSON(filename).done(function(json){
        // Create a new directed graph
        var g = new graphlib.Graph({directed: false});

        var edges = json.links;
        var nodes = json.nodes;

        nodes.forEach(function (data) {
            // console.log(data);
            g.setNode(data["id"], {authorInfo: {name: data["id"], group:data["group"]}});
        });

        edges.forEach(function (data) {
            g.setEdge(data["source"], data["target"], {colabInfo: {value: data["value"],id: data["id"]}});
        });
        var color = "#"+ add_new_layer(layer_name);
        console.log(LAYERS[layer_name].layer);
        drawGraph(LAYERS[layer_name].layer,g,layer_name);
        var svg_id = $("#"+layer_name).children("svg").attr("id");
        SVG.get(svg_id).select("circle").fill(color);

        


    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
    });
    
}

function sort_layers(list){
    console.log("SORTING...");
    for (var element of Array.prototype.slice.apply(list)){
       var layer = element.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input:nth-child(1)').getAttribute("value").toLowerCase().split(" ")[1];
      // render the layers
//      console.log(layer);
      $("#set-canvases").prepend($("#"+layer).detach());
    }
    
}

function reset_color(color) {

  $(".color-active").css("stroke",color);
  $(".color-active").removeClass("color-active");

  //svg.transition()
      //.duration(500)
      //.call(zoom.transform,d3.zoomIdentity);
}

function random_id() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 5);
};

function create_layer(layer){
    var canvas = document.createElement("div");
    var container = document.getElementById("set-canvases");
    console.log(container);
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
    console.log("ADDING EVENTS");
    //checkbox physics
    $(item.querySelector('div > div.row.collapse  > div:nth-child(2) > div.collapse-item.slidecontainer > div > div.col-4 > input')).change(function(){gravity_handler(this);});
    //button
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).click(function(){stop_drag();});
    //range
    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).on("input",function(){console.log("run");opacity_changer(this);});
}

function add_item(){

    var id = random_id()[0];
    var t = random_id()[1];

    var layer_name = id.slice(1,id.length+1);

    console.log(random_id()[1]);

    var container = document.createElement("div")
    container.setAttribute("class","container");

    var col1 = document.createElement("div");
    col1.setAttribute("class","col-sm-auto pr-0");

    var row = document.createElement("div");
    row.setAttribute("class","row");

    var input = document.createElement("input");
    input.setAttribute("class","form-check-input my-auto");
    input.setAttribute("type","checkbox");
    input.setAttribute("checked","true");
    input.setAttribute("layer",layer_name);
    $(input).change(function(){
        var layer = "." + $(this).attr("layer");
        if (this.checked){
            d3.select(layer).style("opacity",1);
        }else{
            d3.select(layer).style("opacity",0);
        }
    });

    var col2 = document.createElement("div");
    col2.setAttribute("class","col-2-auto mr-1");
    col2.setAttribute("id",layer_name);
    //col2.css("width","5px!important");
    //col2.css("height","5px!important");

    var col3 = document.createElement("div");
    col3.setAttribute("class","col-8 my-auto");

    var p = document.createElement("p");
    p.setAttribute("class","text-white my-auto");
    p.setAttribute("id","p-"+layer_name);
    p.innerHTML = "Layer"+id;



    var col4 = document.createElement("div");
    col4.setAttribute("class","col-2");

    var button = document.createElement("button");
    button.setAttribute("class","btn btn-light-outline stop-drag");
    button.setAttribute("data-toggle","collapse");
    button.setAttribute("data-target","#collapse"+id);
    button.setAttribute('aria-expanded',"false");
    button.setAttribute('aria-controls',"collapse"+id);

    var icon = document.createElement("i");
    icon.setAttribute("class","fas fa-arrow-down");


    button.appendChild(icon);
    col4.appendChild(button);
    col3.appendChild(p);
    col1.appendChild(input);
    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    row.appendChild(col4);

    var div2 = document.createElement("div");
    div2.setAttribute("class","row collapse");
    div2.setAttribute("id","collapse_"+layer_name);

    var child_div_child2 = document.createElement("div");
    child_div_child2.setAttribute("class","bg-white py-2 collapse-inner rounded");

    var row2 = document.createElement("div");
    row2.setAttribute("class","row");

    var h6_1 = document.createElement("h6");
    h6_1.setAttribute("class","collapse-header");
    h6_1.innerHTML = "Opacity";

    var h6_2 = document.createElement("h6");
    h6_2.setAttribute("class","collapse-header");
    h6_2.setAttribute("id","opacity_"+layer_name);
    h6_2.innerHTML = "100";

    var box_child_div_child2 = document.createElement("div");
    box_child_div_child2.setAttribute("class","collapse-item slidecontainer");

    var input_box = document.createElement("input");
    input_box.setAttribute("type","range");
    input_box.setAttribute("class","slider");
    input_box.setAttribute("min","1");
    input_box.setAttribute("max","100");
    input_box.setAttribute("value","100");
    input_box.setAttribute("id","range"+id);

    $(input_box).on("input",function(){
        var layer_name = this.id.split("_")[1];
        $("#opacity_"+layer_name).html(this.value);
        d3.select(layer_name).attr("opacity",this.value/100);
    });

    box_child_div_child2.appendChild(input_box);

    row2.appendChild(h6_1);
    row2.appendChild(h6_2);
    child_div_child2.appendChild(row2);
    // child_div_child2.appendChild(box_child_div_child2);
    child_div_child2.appendChild(box_child_div_child2);
    div2.appendChild(child_div_child2);

    container.appendChild(row);
    container.appendChild(div2);


    var li = document.createElement("li");
    li.setAttribute('class','nav-item');
    li.appendChild(container);

    var ul = document.getElementById("layers-table");
    ul.appendChild(li);

    return [layer_name,d3.interpolateCool(t)];
};

function add_world(layer_name){
    console.log(layer_name);
}

function add_new_layer(layer_name){
    var layer = create_layer(layer_name);
    var color = Math.floor(Math.random()*16777215).toString(16);
    $(layer.querySelector(' div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("style","background-color:#"+color+"; height: auto; width: 5px"); 
    $("#layers-table").append(layer);
    sort_layers(el);
//            .select("circle").attr("fill",color));
    return color;
}

$("#new-layer").click(function(){
//    add_new_layer(random_id());
    readDataColab(datafile,random_id());
    sort_layers(el);
});

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

function get_svg_id(layer_name){
    return $("#"+layer_name).children("svg").attr("id");
}

$("p[id|='p']").click(function () {
  // body...
    console.log("clickeando");
    console.log("cambia color");


    let value = $(this).attr("id").split("-")[1];

    d3.selectAll("."+value).attr()
    // //$("."+value).css("box-shadow","10px 10px 5px red");
    // //$("."+value).css("stroke","10px 10px 5px red");
    // if (active_color=== value){
    //     //console.log("COLOR");
    //     //console.log(active_color);
    //     $("."+value).css("box-shadow","10px 10px 5px red");
    // }
    // console.log(this);
    // //   var value = evt.item.childNodes[1].innerText.trimRight().trimLeft().toLowerCase();

    // // console.log(value);
    // // reset_color(active_color);
    // active_color = $(this).attr("id").split("-")[1];
    // let color = "red";
    // console.log("COLOR");
    // console.log(active_color);
    // console.log(color);
    // if (color === active_color){
        

    //     console.log("IGUAL");
    // }
    
});

/* FILLING DOWN THE NAME OF THE LAYER */

$("input[id|='p']").click(function () {
  // body...
    console.log("clickeando");
    console.log("cambia color");

    let value = $(this).attr("id").split("-")[1];
    let color = $("#color-"+value).css("background-color");
    if (d3.selectAll("."+value).attr("filter") != null){
        d3.selectAll("."+value).attr("filter",null);
    }else{
        d3.selectAll("."+value).attr("filter",function(d){return getFilter(color,value);});

    }
});

$("input[id|='p']").dblclick(function () {
  // body...
    console.log("Doble_Clickeando");
    // console.log();
    $(this).attr("previous-layer-name",$(this).val().toLowerCase());
    $(this).attr("readonly",false);
    // console.log(this);

});

$("input[id|='p']").on('keypress',function(e) {
    $(this).attr("readonly",true);
    d3.select("."+$(this).attr("previous-layer-name")).attr("class",className);
});

var el = document.getElementById("layers-table");

var sortable = new Sortable(el,{

  onEnd: function (evt) {
    //get the actual order
    // run a for loop to render things
    var list = document.getElementById("layers-table").getElementsByTagName("li");
    sort_layers(list);
}});
    
readDataColab(datafile,"graph");


