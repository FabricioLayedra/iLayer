/*---------------------------------PHYSICS--------------------------------------*/

Matter.use('matter-attractors');

// module aliases
var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Runner = Matter.Runner, Render = Matter.Render, Body = Matter.Body, Mouse = Matter.Mouse, MouseConstraint = Matter.MouseConstraint;

var mouse, mouseConstraint;

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

    mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                           stiffness: 0.2,
                           render: {
                               visible: false
                           }
                       }
    })
    render.mouse = mouse;
    World.add(world, mouseConstraint);
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
    console.log('engine disabled')
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

function mousefeatures(){

}

//TIFF: MAY NOT WORK
function removeGravity(engine){
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;
    engine.world.gravity.scale = 0;
}

function addElementsToWorld(world, layer) {

    var elements = LAYERS[layer].layer.children();

    for (var i = 0; i < elements.length; i++) {
        var group = elements[i];
        addElementToWorld(world, group);
    }
}

function addElementToWorld(world, element) {
    var Bodies = Matter.Bodies;
    var World = Matter.World;

    var circle = getElementFromGroup(element, "circle");



    if (!element.matter && circle) {

        console.log("Adding node...");
        var x = element.cx() - element.childDX;
//            console.log(circle.cx());
//            console.log(group.cx()-group.childDX);

        var y = element.cy() - element.childDY;
//            console.log(circle.cy());
//            console.log(group.cy()-group.childDY)
//            LAYERS[layer].layer.circle(5).center(x,y).attr({fill:"red",opacity:0.25});

        var radius = circle.attr("r");
//            var deltaX = group.cx()-circle.cx();
//            var deltaY = group.cy()-circle.cy();

        var matterObject = Bodies.circle(x, y, radius);

        matterObject.svg = element;
        element.matter = matterObject;
        element.initX = x;
        element.initY = y;

        matterObject.frictionAir = 0.05;
        matterObject.restitution = 0.025;

        World.add(world, matterObject);
    } 
    else if (element.type === "rect") {
        //console.log("Adding rect...");


        var opacity = element.attr("opacity");


        if (opacity !== 0) {

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

            var matterObject = Bodies.rectangle(valueX, valueY, width, height, {isStatic: true
            });
            matterObject.density = 1;
            //      
            matterObject.svg = element;
            element.matter = matterObject;
            World.add(world, matterObject);

        }

    } else if (element.type === "text") {

        var bbox = element.node.getBBox();
//        console.log(bbox);        
        var width = bbox.width;
        var height = bbox.height;


        var direction = element.direction;
        let matterX = 0;
        let matterY = 0;
        let matterWidth = 0;
        let matterHeight = 0;

        if (direction === 'horizontal') {
            matterWidth = nodeRadius;
            matterHeight = 5;
            var valueX = bbox.x + (width / 2);

            var valueY = bbox.y;
        } else {
            matterWidth = 5;
            matterHeight = nodeRadius;
            //desfase
            var valueX = bbox.x + (width / 2) + 10;

            var valueY = bbox.y + (height / 2);
        }

        var matterObject = Bodies.rectangle(valueX, valueY, matterWidth, matterHeight, {isStatic: true
        });

        matterObject.svg = element;
        element.matter = matterObject;
        World.add(world, matterObject);

    } else if (element.type === 'line') {

        //console.log("Adding line");

        var opacity = element.attr("opacity");
        /*console.log("Adding text");
        console.log("Opacity: " + opacity);*/
        if (opacity !== 0) {

            var bbox = element.rbox();
            
            console.log(bbox);
            var lineBlock = Bodies.rectangle((generalWidth/2),bbox.y-70+5, generalWidth, 10, {isStatic: true});
            Matter.Body.setStatic(lineBlock,true);
            lineBlock.svg = element;
            element.matter = lineBlock;
            World.add(world, lineBlock);
            
        }
    }
    return matterObject;
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
        console.log(bbox);



        var width = bbox.width;
        var height = bbox.height;

        var direction = element.direction;

        let valueX = bbox.x + (width / 2) - (nodeRadius / 2);

        let valueY = bbox.y;

//        getActiveLayer().layer.rect(nodeRadius, height).move(valueX, valueY);

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

        var matterObject = Bodies.rectangle(bbox.x, bbox.y, matterWidth, matterHeight, {isStatic: true,

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