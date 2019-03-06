/*** VARIABLES ***/






var canvas2 = new fabric.Canvas('canvas2', );
var circle = new fabric.Circle({
    radius: 20, fill: 'green', left: 100, top: 100
  });
var triangle = new fabric.Triangle({
  width: 20, height: 30, fill: 'blue', left: 50, top: 50
});

canvas2.add(circle, triangle);


var canvas = new fabric.Canvas('canvas', {preserveObjectStacking: true, renderOnAddRemove: false, objectCaching: false});
canvas.renderOnAddRemove = false;
var context = canvas.getContext();


function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

Matter.use('matter-attractors');

// module aliases
var Engine = Matter.Engine,
        Events = Matter.Events,
        Runner = Matter.Runner,
        Render = Matter.Render,
        World = Matter.World,
        Body = Matter.Body,
        Mouse = Matter.Mouse,
        Common = Matter.Common,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();

// create runner
var runner = Runner.create();

// create demo scene
var world = engine.world;
world.gravity.scale = 0;

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
       width:1200,
       height:800,
    wireframeBackground: "white",
    enabled: false
      }
});

Runner.run(runner, engine);
Render.run(render);

var fabricAttractor1 = new fabric.Circle({
    radius: 50,
    originX: 'center',
    originY: 'center',
    top: 300,
    left: 80,
    fill: 'red'
});
canvas.add(fabricAttractor1);

function addMouseEvents(object) {
    object.on({
        mousedown: function (options) {
            object.mousedown = true;
        },
        mousemove: function (options) {
            if (!object.mousedown)
                return;
            var pointer = canvas.getPointer(options.e);
            Body.translate(object.matter, {
                x: (pointer.x - object.matter.position.x) * 0.25,
                y: (pointer.y - object.matter.position.y) * 0.25
            });
        },
        mouseup: function (options) {
            object.mousedown = false;
        }
    });
}

// create a body with an attractor
var attractor1 = Bodies.circle(
        80,
        300,
        50,
        {
            isStatic: true,
            // example of an attractor function that 
            // returns a force vector that applies to bodyB
            plugin: {
                attractors: [
                    function (bodyA, bodyB) {
                        var x = 0, y = 0;
                        if (bodyB.attractedTo && bodyB.attractedTo.includes(bodyA)) {
                            x = (bodyA.position.x - bodyB.position.x) * 1e-5;
                            y = (bodyA.position.y - bodyB.position.y) * 1e-5;
                        }
                        return {x: x, y: y};
                    }
                ]
            }
        });
attractor1.fabric = fabricAttractor1;
fabricAttractor1.matter = attractor1;
World.add(world, attractor1);

var fabricAttractor2 = new fabric.Circle({
    radius: 50,
    originX: 'center',
    originY: 'center',
    top: 300,
    left: 800,
    fill: 'green'
});

canvas.add(fabricAttractor2);

// create a body with an attractor
var attractor2 = Bodies.circle(
        800,
        300,
        50,
        {
            isStatic: true,
            // example of an attractor function that 
            // returns a force vector that applies to bodyB
            plugin: {
                attractors: [
                    function (bodyA, bodyB) {
                        var x = 0, y = 0;
                        if (bodyB.attractedTo && bodyB.attractedTo.includes(bodyA)) {
                            x = (bodyA.position.x - bodyB.position.x) * 1e-5;
                            y = (bodyA.position.y - bodyB.position.y) * 1e-5;
                        }
                        return {x: x, y: y};
                    }
                ]
            }
        });
attractor2.fabric = fabricAttractor2;
fabricAttractor2.matter = attractor2;
World.add(world, attractor2);

addMouseEvents(fabricAttractor1);
addMouseEvents(fabricAttractor2);

var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

for (var i = 0; i < 20; i++) {

    var radius = getRandomBetween(10, 50);
    var y = getRandomBetween(0, 200);
    var x = getRandomBetween(200, 600);
    var color;

    var body = Bodies.circle(x, y, radius);
    body.attractedTo = new Array();
    if (i < 10) {
        color = 'blue';
        body.attractedTo.push(attractor1);
    } else {
        body.attractedTo.push(attractor2);
        color = 'pink';
    }

    if (i === 3) {
        color = 'orange';
        body.attractedTo.push(attractor2);
    }
    if (i === 13) {
        body.attractedTo.push(attractor1);
        color = 'orange';
    }

    World.add(world, body);

    var circle = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        radius: radius,
        top: y,
        left: x,
        fill: color,
//                    opacity: 0.25,
    });

    body.fabric = circle;
    circle.matter = body;

    canvas.add(circle);

}

// add all of the bodies to the world
World.add(world, ground);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

var drawVertices = false;

(function render() {

    var bodies = Composite.allBodies(engine.world);

    window.requestAnimationFrame(render);

    if (drawVertices) {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
    }

    for (var i = 0; i < bodies.length; i += 1) {

        var currentBody = bodies[i];
        var fabricObject = currentBody.fabric;

        if (fabricObject) {
            var newX = currentBody.position.x;
            var newY = currentBody.position.y;
            fabricObject.setPositionByOrigin({x: newX, y: newY}, 'center', 'center');
            fabricObject.setCoords();
        }

        if (drawVertices) {
            var vertices = currentBody.vertices;
            context.moveTo(vertices[0].x, vertices[0].y);
            for (var j = 1; j < vertices.length; j += 1) {
                context.lineTo(vertices[j].x, vertices[j].y);
            }
            context.lineTo(vertices[0].x, vertices[0].y);
        }

    }

    if (drawVertices) {
        context.lineWidth = 1;
        context.strokeStyle = '#999';
        context.stroke();
    }

    canvas.requestRenderAll();

})();





///* USING GRAPHLIB*/
//
//function addMovingEvents(fabricObject, nodeData) {
//    fabricObject.on({
//        moving: function (options) {
//            nodeData.inEdges.forEach(function (inEdge) {
//                var center = fabricObject.getPointByOrigin('center', 'center');
//                inEdge.path[1][3] = center.x;
//                inEdge.path[1][4] = center.y;
//            });
//            nodeData.outEdges.forEach(function (outEdge) {
//                var center = fabricObject.getPointByOrigin('center', 'center');
//                outEdge.path[0][1] = center.x;
//                outEdge.path[0][2] = center.y;
//            });
//        }
//    });
//}
//
//
//
//
//
//
//
//
//function drawGraph(g) {
//
//    var nodeKeys = g.nodes();
//    var edges = g.edges();
//
//    // adding to the nodes objects of the graph both the fabric and the matter associated objects
//    nodeKeys.forEach(function (nodeKey) {
//
//        var nodeData = g.node(nodeKey);
//
//        // console.log("nodeData");
//        // console.log(nodeData);
//
//        nodeData.inEdges = new Array();
//        nodeData.outEdges = new Array();
//
//        var radius = 20;
//        var y = getRandomBetween(50, 800);
//        var x = getRandomBetween(50, 1000);
//
//        var matterObject = Bodies.circle(x, y, radius);
//        
//        // NOTE THAT I AM NOT ADDING THE ELEMENTS OF THIS GRAPH TO THE PHYSICS WORLD IN THIS EXAMPLE
////                    World.add(world, matterObject);
//
//        var fabricObject = new fabric.Circle({
//            originX: 'center',
//            originY: 'center',
//            radius: radius,
//            top: y,
//            left: x,
//            fill: 'aqua',
//            hasControls: false,
//            hasBorders: false
//        });
//        addMouseEvents(fabricObject);
//
//        nodeData.matter = matterObject;
//        nodeData.fabric = fabricObject;
//
//        matterObject.fabric = fabricObject;
//        fabricObject.matter = matterObject;
//
//        canvas.add(fabricObject);
//
//        addMouseEvents(fabricObject);
//
//        addMovingEvents(fabricObject, nodeData);
//
//    });
//
//    edges.forEach(function (edge) {
//
//        var from = g.node(edge.v);
//        var to = g.node(edge.w);
//
//        var fromCenter = from.fabric.getPointByOrigin('center', 'center');
//        var toCenter = to.fabric.getPointByOrigin('center', 'center');
//
//        // creating a QUADRATIC CURVE. See https://www.sitepoint.com/html5-svg-quadratic-curves/ and http://fabricjs.com/quadratic-curve
//        var path = "M" + fromCenter.x + "," + fromCenter.y + " Q" + (fromCenter.x + (toCenter.x - fromCenter.x) / 2) + "," + (fromCenter.y + (toCenter.y - fromCenter.y) / 2) + " " + toCenter.x + "," + toCenter.y;
//
//        var edgePath = new fabric.Path(path, {
//            stroke: 'black',
//            fill: 'transparent',
//            strokeWidth: 1,
//            lockMovementX: true,
//            lockMovementY: true,
//            hasControls: false,
//            hasBorders: false,
//            perPixelTargetFind: true,
//            objectCaching: false
//        });
//        canvas.add(edgePath);
//
//        to.inEdges.push(edgePath);
//        from.outEdges.push(edgePath);
//
//    });
//
//}
//
//function readDataColab(filename){
//    $.getJSON(filename).done(function(json){
//        // Create a new directed graph
//        var g = new graphlib.Graph({directed: false});
//
//        var edges = json.links;
//        var nodes = json.nodes;
//
//        nodes.forEach(function (data) {
//            // console.log(data);
//            g.setNode(data["id"], {authorInfo: {name: data["id"], group:data["group"]}});
//        });
//
//        edges.forEach(function (data) {
//            g.setEdge(data["source"], data["target"], {colabInfo: {value: data["value"],id: data["id"]}});
//        });
//        drawGraph(g);
//
//    }).fail(function( jqxhr, textStatus, error ) {
//        var err = textStatus + ", " + error;
//        console.log( "Request Failed: " + err );
//    });
//    
//}
//readDataColab(datafile);

