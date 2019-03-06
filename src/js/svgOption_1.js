/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



var draw = SVG('canvas-layer2').size(1200,800);


function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

Matter.use('matter-attractors');

// module aliases
var Engine = Matter.Engine,
        Events = Matter.Events,
        Render = Matter.Render,
        World = Matter.World,
        Body = Matter.Body,
        Mouse = Matter.Mouse,
        Common = Matter.Common,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Svg = Matter.Svg,
        MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();


// create demo scene
var world = engine.world;
world.gravity.scale = 0.001;


(function render() {

    bodies = Composite.allBodies(engine.world);

    
    window.requestAnimationFrame(render);

//    if (drawVertices) {
//        context.fillStyle = '#fff';
//        context.fillRect(0, 0, canvas.width, canvas.height);
//        context.beginPath();
//    }

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
//
//    if (drawVertices) {
//        context.lineWidth = 1;
//        context.strokeStyle = '#999';
//        context.stroke();
//    }

})();


function drawGraph(g) {

    var nodeKeys = g.nodes();
    var edges = g.edges();

    // adding to the nodes objects of the graph both the fabric and the matter associated objects
    nodeKeys.forEach(function (nodeKey) {

        var nodeData = g.node(nodeKey);

        // console.log("nodeData");
        // console.log(nodeData);

        nodeData.inEdges = new Array();
        nodeData.outEdges = new Array();

        var radius = 20;
        var y = getRandomBetween(50, 800);
        var x = getRandomBetween(50, 1000);

        var matterObject = Bodies.circle(x, y, radius);
        
        // NOTE THAT I AM NOT ADDING THE ELEMENTS OF THIS GRAPH TO THE PHYSICS WORLD IN THIS EXAMPLE
//                    World.add(world, matterObject);

        var fabricObject = draw.circle(radius).attr({
        cx: x,
        cy: y,
        fill: 'purple'
        }).move(x,y);
        //addMouseEvents(fabricObject);

        nodeData.matter = matterObject;
        nodeData.svg = fabricObject;

        matterObject.svg = fabricObject;
        fabricObject.matter = matterObject;

        //canvas.add(fabricObject);

        //addMouseEvents(fabricObject);

        //addMovingEvents(fabricObject, nodeData);

    });

    edges.forEach(function (edge) {

        var from = g.node(edge.v);
        var to = g.node(edge.w);

        var fromCenterX = from.svg.x();
        var fromCenterY = from.svg.getPointByOrigin('center', 'center');

        var toCenter = to.fabric.getPointByOrigin('center', 'center');

        // creating a QUADRATIC CURVE. See https://www.sitepoint.com/html5-svg-quadratic-curves/ and http://fabricjs.com/quadratic-curve
        var path = "M" + fromCenter.x + "," + fromCenter.y + " Q" + (fromCenter.x + (toCenter.x - fromCenter.x) / 2) + "," + (fromCenter.y + (toCenter.y - fromCenter.y) / 2) + " " + toCenter.x + "," + toCenter.y;

        var edgePath = draw.path(path).attr({
            stroke: 'black',
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

        to.inEdges.push(edgePath);
        from.outEdges.push(edgePath);

    });

}

function readDataColab(filename){
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
        drawGraph(g);

    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
    });
    
}
readDataColab(datafile);
//var rect = draw.rect(200, 100).attr({ fill: '#f06' });
//
//var draw2 = SVG('canvas-layer1').size(400, 700);
//var rect3 = draw2.rect(400, 300).attr({ fill: 'aqua' });

