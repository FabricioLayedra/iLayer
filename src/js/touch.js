/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var clonationMode = false;
//var trashMode = false;

function beginSliding(e) {
    this.node.allowed = true;
    this.node.dx = event.pageX - this.cx();
    this.node.dy = event.pageY - this.cy();

    this.node.setPointerCapture(e.pointerId);
}

function stopSliding(e) {
    this.node.allowed = null;
//  console.log(this.cx(),this.cy());
//  window.draw.circle(5).center(this.cx()-this.node.childDX,this.cy()-this.node.childDY);
    this.node.releasePointerCapture(e.pointerId);
}

function slide(event) {
    if (this.node.allowed) {
        let x = event.pageX - this.cx() - this.node.dx;
        let y = event.pageY - this.cy() - this.node.dy;
        this.dmove(x, y);
        updateEdgesEnds(getElementFromGroup(this, 'circle'), this.cx() - this.childDX, this.cy() - this.childDY);
        this.node.initX = this.cx() - this.childDX;
        this.node.initY = this.cy() - this.childDY;

        if (this.matter) {
            this.matter.position.x = this.node.initX;
            this.matter.position.y = this.node.initY;
//              Matter.Body.setPosition(this.matter,(this.node.initX,this.node.initY));
//            this.matter.position.x +=5;
//            console.log(this.matter.position.x);
//            this.matter.position.y += 5;
        }



    }
}

function highlight(event, node, show) {
    event.preventDefault();
    var child = getElementFromGroup(node, 'circle');
    if (show) {
        showHighlight(child);
    } else {
        hideHighlight(child);
    }
}

function showHighlight(child) {
    child.highlight.show();

    child.nodeData.inEdges.forEach(function (inEdge) {
        inEdge.highlight.show();
    });

    child.nodeData.outEdges.forEach(function (outEdge) {
        outEdge.highlight.show();
    });
}

function hideHighlight(child) {
    child.highlight.hide();

    child.nodeData.inEdges.forEach(function (inEdge) {
        inEdge.highlight.hide();
    });

    child.nodeData.outEdges.forEach(function (outEdge) {
        outEdge.highlight.hide();
    });
}

function addTouchEvents(nodeParent) {
    nodeParent.on('pointerdown', function (e) {
        highlight(e, nodeParent, true)
    });
    nodeParent.on('pointerdown', beginSliding);
    nodeParent.on('pointermove', slide);
    nodeParent.on('pointerup', stopSliding);
    nodeParent.on('pointerup', function (e) {
        highlight(e, nodeParent, false)
    });
//    nodeParent.on('pointerenter',function(){console.log("Data enter")});
//    nodeParent.on('pointerleave',function(){console.log("Data leave")});

}

function removeTouchEvents(nodeParent) {
//      var layerName = nodeParent.parent().node.id.split("layer-")[1];
//    nodeParent.off('pointerdown');    
    nodeParent.off('pointerdown');
    nodeParent.off('pointermove');
    nodeParent.off('pointerup');
//    nodeParent.off('pointerup');
}

// the idea here is that we will have different modes and depending on the mode we are, the same gesture will do different things
// modes are often set by the user or even the layer itself

function addLayerEvents(layer, drawer) {
    let mc = new Hammer(layer);

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    mc.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});

    let startingPoint = null;
    let currentPoint = null;
    let segment = null;
    let segment2 = null;
    let line = null;
    let rect = null;
    let intersection = null;
    let touchCanvas = true;

    mc.on("panstart", function (ev) {

        startingPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
        rect = layer.createSVGRect();
        rect.x = startingPoint.x;
        rect.y = startingPoint.y;
        touchCanvas = isFreePoint(layer, startingPoint.x, startingPoint.y);



        if (touchCanvas) {
            line = drawer.line(startingPoint.x, startingPoint.y, startingPoint.x, startingPoint.y)
                    .stroke({color: '#f06', width: 1, linecap: 'round'})
                    .attr({'stroke-dasharray': [8, 3], stroke: 'red'});
        }

//        line = drawer.path()
//                .M(startingPoint)
//                .L(startingPoint)
//                .attr({stroke: 'red', fill: 'transparent', strokeWidth: 1, 'stroke-dasharray': [8, 3]});



    });

    mc.on("panmove", function (ev) {

        currentPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};

        /*segment = line.getSegment(1);
         segment.coords[0] = currentPoint.x;
         segment.coords[1] = currentPoint.y;
         line.replaceSegment(1, segment);*/
        if (touchCanvas) {
            line.attr("x2", currentPoint.x);
            line.attr("y2", currentPoint.y);
            line.stroke({color: '#f06000', width: 1, linecap: 'round'});

            rect.x = Math.min(startingPoint.x, currentPoint.x);
            rect.y = Math.min(startingPoint.y, currentPoint.y);
            rect.width = Math.abs(currentPoint.x - startingPoint.x);
            rect.height = Math.abs(currentPoint.y - startingPoint.y);
            //        drawer.rect(rect.width,rect.height).move(rect.x,rect.y);
            let list = layer.getIntersectionList(rect, null);
            //        console.log(layer);
            //        console.log(list);

            list.forEach(function (element) {
                let edge = SVG.get(element.id);
                //            console.log(edge);
                if (edge.type === "path") {
                    //                console.log(edge);
                    //                console.log(line);
                    intersection = line.intersectsPath(edge);
                    if (intersection.length) {
                        //                    console.log("intersections:");
                        segment2 = edge.getSegment(1);
                        segment2.coords[0] = currentPoint.x;
                        segment2.coords[1] = currentPoint.y;
                        edge.replaceSegment(1, segment2);
                        edge.highlight.replaceSegment(1, segment2);
                        edge.highlight.show();
                    }
                } else if (edge.type === "circle") {
                    console.log(edge);
                    let direction = line.attr("x2") - line.attr("x1");
                    if (direction > 0) {
                        console.log(direction);

                        console.log("GOING DOWN");
                    } else if (direction < 0) {
                        console.log(direction);
                        console.log("GOING UP");
                    }
                }
            });
        }
    });

    mc.on("panend", function (ev) {
        if (touchCanvas) {
//            let list = layer.getIntersectionList(rect, null);
//        console.log(layer);
//        console.log(list);
// this needs to be upgraded too something more efficient.            
            getActiveLayer().layer.select('g').members.forEach(
                    function (n) {
                        let children = n.node.children;
                        for (var k = 0; k < children.length; k++) {
                            let element = SVG.get(children[k].id);
                            if (element.highlight) {
                                element.highlight.hide();
                            }
                        }
//                    children.forEach(function(n){
//                        if (n.highlight){
//                            n.highlight.hide();
//                        }
//                    });
//                    n.each(
//                            function(child1){
//                                console.log(child.type);
//                                if (child1.highlight){
//                                    child1.highlight.hide();
//                                }
//                            }
//                                    )
                    }
            );

//        list.forEach(function (element) {
//            let edge = SVG.get(element.id);
////            console.log(edge);
//            if (edge.type === "path") {
////                console.log(edge);
////                console.log(line);
//                intersection = line.intersectsPath(edge);
//                if (intersection.length) {
////                    console.log("intersections:");
//                    edge.highlight.hide();
//                }
//            }
//        });
            line.remove();
        } else {
            touchCanvas = true;
        }
    });



}

function nodeInSelection(nodeParent) {
    for (var i = 0; i < SELECTION.length; i++) {
        if (SELECTION[i] === nodeParent) {
            return true;
        }
    }
    return false;
}

function addNodeToSelection(group) {
    if (!nodeInSelection(group)) {
        var circle = getElementFromGroup(group, 'circle');
        hideHighlight(circle);
        circle.animate(100).attr({"r": circle.attr("r") + 10});
        circle.animate(100).attr({"r": circle.attr("r")});
//        console.log(circle);
//        console.log(getActiveLayer());
//        console.log(getActiveLayer().layer);
        var halo = drawHaloInCircle(getActiveLayer().layer, circle, 5, getActiveLayer().color);
//        console.log(halo);
        console.log(group.add(halo));
        group.add(halo);
        console.log(group);
        ;
        halo.back();
        SELECTION.push(group);
    } else {
        getElementFromGroup(group, 'path').remove();
        SELECTION = arrayRemove(SELECTION, group);
    }
}

//removes a nodes from selection
function removeNodeFromSelection(group){
    
    getElementFromGroup(group, 'path').remove();
    SELECTION = arrayRemove(SELECTION, group);
}

//slight bug with selection if you try and disable the button while there are actives, but whatever. leave it for now.
function selectionMode(mode, buttonPressed) {

    if (mode) {
        var groups = getActiveLayer().layer.select('g.node').members;
        for (var index in groups) {
            let group = groups[index];
//            console.log(group);
            removeTouchEvents(group);
            group.on('pointerdown', function () {
//                console.log(group.node.id);
                console.log(group);
                //check if node is in selection
                addNodeToSelection(group);
            });
        }
        selectionFlag = mode;
    } else {

        var groups = getActiveLayer().layer.select('g.node').members;
        /*if (groups.length == 0){
            $("#selector").fadeIn(150).fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);
            selectionFlag = false;
        }
        else{*/
            //console.log(groups);
            //remaining nodes in oriignal layer
            for (var index in groups) {
                let group = groups[index];
                group.off('pointerdown');
                addTouchEvents(group);
                //removeNodeFromSelection(group);
                //getElementFromGroup(group, 'path').remove();  
            }

            //this will remove the ability to add to another layer, so be wary
            //an inelegant hack which checks if the flag switch is due to a button press -- if so, then remove selection
            if (buttonPressed){
                while (SELECTION.length != 0){
                   removeNodeFromSelection(SELECTION[0]);
                }
            }
            //SELECTION = [];
            selectionFlag = mode;
        
    }
    console.log(selectionFlag);
}

//make this so that it is triggered by button press only
function addSelectionEvents(nodeParent) {
    var mc = new Hammer(nodeParent.node);
    //selectionFlag = true

    nodeParent.node.hammer = mc;
/////////////////////////////////////////////////////////////////////////////////////////////////
    //mc.get('press').set({time: 300});


    if (selectionFlag){
        mc.on('press', function (event) {
            selectionMode(true);
        });

        mc.on('pressup', function (event) {
            addNodeToSelection(nodeParent);
        });
    }

    else{
        mc.off('press');
        mc.off('pressup');
    }
}
function addPressEvents(mc, toolGraphics, drawer, type, child) {
    //for tool events
    mc.get('press').set({time: 300});
    if (type === 'gravity') {

        mc.on('press', function (event) {

            event.preventDefault();
            $(event.target).attr('oncontextmenu', 'return false');
            mc.off('panmove');



            let line = null;
            let startingPoint = null;
            let currentPoint = null;
            let deltaX;
            let deltaY;
            let x2;
            let y2;
            let magnitude;
            let triangle;
            let color = '#686868';
            let theGroup = toolGraphics.parent();
            let angle;
            let center;

            blink(theGroup);

            mc.on("panstart", function (ev) {

                center = toolGraphics.rbox().addOffset();
                startingPoint = {x: center.cx /*- $("#accordionSidebar").width()*/, y: center.cy - 65};

                line = drawer.line(startingPoint.x, startingPoint.y, startingPoint.x, startingPoint.y)
                        .attr({
                            stroke: color,
                            fill: color,
                            color: color,
                            'stroke-width': 1,
                            'stroke-linecap': 'round'
                        });

                triangle = drawer.polygon('3,0 -10,-6 -10,6');
                triangle.fill(color).move(startingPoint.x, startingPoint.y);
            });

            mc.on("panmove", function (ev) {
                currentPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
                line.attr("x2", currentPoint.x);
                line.attr("y2", currentPoint.y);

                deltaX = line.attr("x2") - line.attr("x1");
                deltaY = line.attr("y2") - line.attr("y1");
                magnitude = Math.sqrt(Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2));

                // changing the width of the line to suggest the strength of the gravity we will add
                line.attr({'stroke-width': 40 * (magnitude / 1000)});

                angle = (Math.atan(deltaY / deltaX) * 180) / Math.PI;
                if (line.attr("x1") > line.attr("x2")) {
                    angle -= 180;
                }

                triangle.attr('transform', null);
                triangle.center(currentPoint.x, currentPoint.y);
                triangle.rotate(angle);
                let scale = 14 * (magnitude / 1000);
                triangle.scale(scale, scale);

            });

            mc.on("panend", function (ev) {

                let matrix = new SVG.Matrix(theGroup);
                let inverse = matrix.inverse();
                theGroup.add(line);
                theGroup.add(triangle);
                line.transform(inverse);

                triangle.transform(inverse);

                triangle.rotate(angle);
                let scale = 14 * (magnitude / 1000);
                triangle.scale(scale, scale);

                addGravity(activatePhysics(getActiveLayer().layer.node.id), deltaX / magnitude, deltaY / magnitude, magnitude);

                mc.off('panstart');
                mc.off('panmove');
                mc.off('panend');
                addDragEvents(mc, toolGraphics.parent(), toolGraphics, type);

            });
        });
        mc.on('pressup', function (event) {
            mc.off('panstart');
            mc.off('panmove');
            mc.off('panend');
            addDragEvents(mc, toolGraphics.parent(), toolGraphics, type);
        });

    } else if (type === 'bending') {

        
        addLayerEvents(getActiveLayer().layer.node, getActiveLayer().layer);
    } else if (type === 'wall') {



    } else if (type === 'position') {

    }

    else if (type === 'force'){

        let line = null;
        let startingPoint = null;
        let currentPoint = null;
        let color = '#686868';
        let theGroup = toolGraphics.parent();  
        let center;
         

        mc.on('press', function (event) {
            event.preventDefault();
            $(event.target).attr('oncontextmenu', 'return false');
            mc.off('panmove');
            blink(theGroup);
        });



        mc.on('pressup', function (event) {
            mc.off('panstart');
            mc.off('panmove');
            mc.off('panend');
            forceLayout(GRAPHS[GRAPHTOLOAD], pxs, pys)
            addDragEvents(mc, toolGraphics.parent(), toolGraphics, type);
            addPressEvents(mc, toolGraphics.parent(), toolGraphics, type);
        });

        
    }



}

function moveElements(event, nodeGraphics, child, isProxy, graphicProxy) {
    //console.log("moving");
    let currentPoint = {x: event.srcEvent.pageX, y: event.srcEvent.pageY};

//    console.log("Previous");
//    console.log(x,y);

    var x = currentPoint.x /*- $("#accordionSidebar").width()*/ - child.previousX;
    var y = currentPoint.y - 70 - child.previousY;


//    console.log(child.disToCenterX+x,child.disToCenterY+y);
//    getActiveLayer().layer.circle(5).center(x,y).fill("red");
//    console.log("*******************");
//    console.log(x,y);

/// THE IF IS NOT THE BEST THING TO DO BUT WE NEED TO KEEP GOING. 
    if (nodeGraphics === child) {
//        console.log("child");
        if (nodeGraphics.wall) {
//            console.log("wall");
            if (nodeGraphics.direction === "horizontal") {
//                console.log("in horizontal");
                nodeGraphics.center(child.disToCenterX + x, child.cy());
            } else if (nodeGraphics.direction === "vertical") {
//                console.log("in vertical");
                nodeGraphics.center(child.cx(), child.disToCenterY + y);
            }
            if (isProxy) {
                console.log("Move all of them");

                for (var index in graphicProxy.axis.valueLabels) {


                    var wall = null;
                    if (nodeGraphics.direction === "horizontal") {
                        if (nodeGraphics.position === "left") {
                            wall = graphicProxy.axis.valueLabels[index].walls[0];
                            if (!wall.initialX) {
                                wall.initialX = wall.cx();
                            }
                            //                        console.log(wallX.cx()+x);
                            wall.center(wall.initialX + x, wall.cy());
                        } else if (nodeGraphics.position === "right") {

                            wall = graphicProxy.axis.valueLabels[index].walls[1];
                            if (!wall.initialX) {
                                wall.initialX = wall.cx();
                            }
                            //                        console.log(wallX.cx()+x);
                            wall.center(wall.initialX + x, wall.cy());

//                        graphicProxy.axis.valueLabels[index].walls[0] = wallX;
                        }
                    } else if (nodeGraphics.direction === "vertical") {
                        if (nodeGraphics.position === "top") {
                            wall = graphicProxy.axis.valueLabels[index].walls[0];
                            if (!wall.initialY) {
                                wall.initialY = wall.cy();
                            }
                            //                        console.log(wallX.cx()+x);
                            wall.center(wall.cx(), wall.initialY + y);
                        } else {

                            wall = graphicProxy.axis.valueLabels[index].walls[1];
                            if (!wall.initialY) {
                                wall.initialY = wall.cy();
                            }
                            //                        console.log(wallX.cx()+x);
                            wall.center(wall.cx(), wall.initialY + y);

//                        graphicProxy.axis.valueLabels[index].walls[0] = wallX;
                        }
                    }
                    if (wall.matter) {
                        Matter.Body.setPosition(wall.matter, {x: wall.cx(), y: wall.cy()});
                    }

                }
            }
        }


    } else {
        nodeGraphics.dmove(x, y);
        child.previousX = nodeGraphics.cx();
        child.previousY = nodeGraphics.cy();
    }



//    console.log("DISTANCE");
//    console.log(child.disToCenterX,child.disToCenterY);
//    console.log(child.previousX,child.previousY);
//
//            getActiveLayer().layer.circle(5).center(child.disToCenterX+x,child.disToCenterY+y).fill("BLUE");
//    child.disToCenterX = child.disToCenterX;
//    child.disToCenterY = child.disToCenterY+y;

//    console.log("DIST");
//    console.log(child.disToCenterX,child.disToCenterY);
//    console.log(child.previousX+child.disToCenterX,child.previousY+child.disToCenterY);
//    child.previousX += 5;
//    child.previousY += 5;   
//    console.log(nodeGraphics.cx());

    if (nodeGraphics.matter) {
        Matter.Body.setPosition(nodeGraphics.matter, {x: child.cx(), y: child.cy()});
    }

    //console.log(nodeGraphics.cx())


//    
//    
//    let currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
////        console.log(toolEntity.cx(),toolEntity.cy());
//    nodeGraphics.center(currentPoint.x-$("#accordionSidebar").width(),currentPoint.y-70);
}

function addDragEvents(hammer, entityGroup, toolEntity, type, isProxy, graphicProxy) {

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    //console.log(entityGroup)

    let startingPoint = null;
    let currentPoint = null;
    let activeLayer = getActiveLayer();
    let trashZone =  activeLayer.trash;
    let threshold_w = activeLayer.layer.width() - 10;
    let threshold_h = activeLayer.layer.height() - 10;
    let distanceToTrash_x = null;
    let distanceToTrash_y = null;
    let initX = null;
    let initY = null;


    hammer.on("panstart", function (ev) {
        console.log('addDragEvents triggered')

        startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
        initX = startingPoint.x ;//- $("#accordionSidebar").width();
        initY = startingPoint.y - 70;
        toolEntity.previousX = initX;
        toolEntity.previousY = initY;

        toolEntity.disToCenterX = entityGroup.cx();
        toolEntity.disToCenterY = entityGroup.cy();

        distanceToTrash_x = Math.abs(trashZone.rect.cx() - toolEntity.disToCenterX);
        distanceToTrash_y = Math.abs(trashZone.rect.cy() - toolEntity.disToCenterY);

    });

    hammer.on("panmove", function (ev) {
        //moveElements(ev, entityGroup, toolEntity, isProxy, graphicProxy);
        currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY - 70};

        //for walls, only allow them to move along one direction
        //entityGroup undefined after force
        if (type == 'wall'){
            if (toolEntity.position == 'left' || toolEntity.position == 'right'){
                entityGroup.dmove(currentPoint.x - toolEntity.disToCenterX, 0);
            }
            else if (toolEntity.position == 'bottom' || toolEntity.position == 'top'){
                entityGroup.dmove(0, currentPoint.y - toolEntity.disToCenterY);
            }
        }
        else{
            entityGroup.dmove(currentPoint.x - toolEntity.disToCenterX, currentPoint.y - toolEntity.disToCenterY);
        }
        
        
        //use disToCenterXY instead of previousXY for more centered dragging


        distanceToTrash_x = Math.abs(trashZone.rect.cx() - toolEntity.disToCenterX);
        distanceToTrash_y = Math.abs(trashZone.rect.cy() - toolEntity.disToCenterY);

        /*console.log(entityGroup.cx() + " cxcy " + entityGroup.cy())
        console.log(distanceToTrash_x + " dtxy " + distanceToTrash_y)*/

        if ((distanceToTrash_x < 300) || (distanceToTrash_y < 300)) {
            trashZone.rect.attr({opacity: (trashZone.rect.x() - distanceToTrash_x)/threshold_w*2});
            /*trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            })*/
        }
        if (distanceToTrash_x < 100 && distanceToTrash_y < 100){
            trashZone.icon.attr({
                fill: 'white',
                opacity: 1
            })
        }
        
        else{
            trashZone.rect.attr({opacity: 0});
            trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            })
        }
        toolEntity.disToCenterX = entityGroup.cx();
        toolEntity.disToCenterY = entityGroup.cy();
        
    });

    hammer.on('panend', function(ev){
        console.log(distanceToTrash_x + " dxdy " + distanceToTrash_y)
        trashZone.rect.attr({opacity:0});
        if ((distanceToTrash_x < 60) && (distanceToTrash_y < 60)){
            
            removeWithAnimation(entityGroup);
            copyOnCanvas = false;
            trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            });

            //be wary of these two for now
            
            removeGravity(activatePhysics(getActiveLayer().layer.node.id));
            stop_physics(activatePhysics(getActiveLayer().layer.node.id))
            //
        }


    })

//    mc.on("panend", function (ev) {
//        toolEntity.front();
//        toolEntity.draggable();
//        console.log(toolEntity);
//        addPressEvents(toolEntity.node,toolEntity);
////        console.log(activeLayer);
//    });
}
function getActiveLayer() {
    return activeLayer;
}

function applyWallStyle(object) {

    let drawer = getActiveLayer().layer;

    if (object.type === 'text') {
//        object.attr({"stroke-dasharray": 4, stroke: 'green', 'stroke-width': 3});
        object.attr({"text-decoration":"underline"});
    } else if (object.type === 'rect') {
        object.attr({stroke: '#f4bf42', 'stroke-width': 2.5});
    }
}

function addSelectorEvents(){
     $("#selector").on('pointerdown', function (e) {
        /*if(e.type == 'touchend'){
            $(this).off('click');
        }*/

        //selectionFlag = !selectionFlag;
        selectionMode(!selectionFlag);
        console.log(selectionFlag + " selector")
        //console.log("Selection turned to " + selectionFlag + " state");
        $(this).toggleClass('active');
    });
}

//add accordionSidebar only when layers are reimplemented
function addToolEvents(tool, type) {
    
    if (!$(tool).prop('disabled')) {
        let mc = new Hammer(tool);

        // let the pan gesture support all directions.
        // this will block the vertical scrolling on a touch-device while on the element
        mc.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});

        let startingPoint = null;
        let currentPoint = null;
        let path = null;
        let toolEntity = null;  //ghost
        let entityGroup = null; //ghostFather

        let activeLayer = null;

        let attributeLand = null;
        let trashZone = null;
        let distanceToTrash_x = null;
        let distanceToTrash_y = null;

        //past threshold


        var initX = 0;
        var initY = 0;
        var svgID = "";
        var copyOnCanvas = false;


        mc.on("panstart", function (ev) {
            console.log(tool);
            
            svgID = type + '-' + getActiveLayer().layer.id().split('-')[1];
            startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
            activeLayer = getActiveLayer();
            trashZone =  activeLayer.trash;

            initX = startingPoint.x;// - $("#accordionSidebar").width();
            initY = startingPoint.y - 70;

            copyOnCanvas = false;

            path = $($(tool).children()[0]).children()[0].getAttribute("d");
            console.log($(svgID.toString()).length)

            //already exists, but does not do a smooth transition
            if ($('g#' + svgID.toString()).length > 0){
                removeWithAnimation(entityGroup);
                copyOnCanvas = false;
                //return;
            }

            //if ((x > $('#set-tools').outerHeight() + 5) && !copyOnCanvas){
            //only add toolEntity if it comes out of the drop zone
            entityGroup = getActiveLayer().layer.group();   //creates group for entity
            entityGroup.addClass('canvas-tool');
            entityGroup.id(svgID)

            //creation of actual fa-icon
            toolEntity = getActiveLayer().layer.path(path).move(initX, initY).attr({"tool": true, fill: getActiveLayer().color});
            var relationAspect = toolEntity.width() / toolEntity.height();
            toolEntity.height(50);
            toolEntity.width(50 * relationAspect);

            entityGroup.add(toolEntity);
            entityGroup.add(getActiveLayer().layer
                .text(type)
                .center(toolEntity.cx(), toolEntity.cy() + toolEntity.height() * 0.6)
            );

            toolEntity.previousX = initX;
            toolEntity.previousY = initY;
            //store group on canvas
            //ACTIVETOOLS[entityGroup.id] = {group: entityGroup, toolType = type, icon = toolEntity};
            copyOnCanvas = true;

            //initially highlight zone
            trashZone.rect.attr({opacity:30});
            console.log(entityGroup)
        });

        mc.on("panmove", function (event) {
            currentPoint = {x: event.srcEvent.pageX, y: event.srcEvent.pageY};
            
            let x = currentPoint.x;// - $("#accordionSidebar").width();
            let y = currentPoint.y - 70;
            
            let threshold = activeLayer.layer.width() - 10;

            distanceToTrash_x = Math.abs(activeLayer.trash.rect.cx() - x);
            distanceToTrash_y = Math.abs(activeLayer.trash.rect.cy() - y);

            //set the distance between the group and the tool
            entityGroup.childDX = entityGroup.cx() - getElementFromGroup(entityGroup, 'path').cx();
            entityGroup.childDY = entityGroup.cy() - getElementFromGroup(entityGroup, 'path').cy();

            //if within threshold, then move
            entityGroup.dmove(x - toolEntity.previousX, y - toolEntity.previousY);

            if ((x < threshold/4) || (y < (activeLayer.layer.height() - 70)/4)) {
                trashZone.rect.attr({opacity: (trashZone.rect.x() - distanceToTrash_x)/threshold*2});
            }

            if (copyOnCanvas){
                toolEntity.previousX = entityGroup.cx();
                toolEntity.previousY = entityGroup.cy();
            }

            if (type === 'wall' || type === 'position' || type === 'attractor' || type === 'axis') {
                attributeLand = isClassedGraphics(getActiveLayer().layer.node, x, y, 'toolable');
            }

            if (distanceToTrash_x < 100 && distanceToTrash_y < 100){
                trashZone.icon.attr({
                    fill: 'white',
                    opacity: .75
                })
            }

            else{
                trashZone.icon.attr({
                    fill: 'gray',
                    opacity: .25
                })
            }

           
        });

        mc.on("panend", function (ev) {
            currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
            var x = currentPoint.x;// - $("#accordionSidebar").width();
            var y = currentPoint.y - 70;
            toolEntity.front();
            let mc = new Hammer(toolEntity.node);

            distanceToTrash_x = Math.abs(activeLayer.trash.rect.cx() - x);
            distanceToTrash_y = Math.abs(activeLayer.trash.rect.cy() - y);

        

            //console.log(attributeLand)
            if (attributeLand) {
                var attributeGraphics = getCrossedClassedGraphicObject(getActiveLayer().layer.node, x, y, 'toolable');

                if (type === 'wall') {
                    applyWallStyle(attributeGraphics);
                    if ($(attributeGraphics.node).hasClass('proxy')) {
                        var labelsGraphics = attributeGraphics.values;
                        for (var index in labelsGraphics) {
                            var labelGraphic = labelsGraphics[index];
                            // IF ITS CONTINUOUS DATA THIS HAS TO CHANGE
                          // blink(labelGraphic);
                        }
                        console.log(attributeGraphics.width());

                        addBuilderWallsEvents(attributeGraphics, attributeGraphics.parent());
                        // TODO: build the wall here, right after the wall tool has been added to the proxy
                        // or to a single attribute value (that's perhaps in another if)
                    } 
                    else {
                        addBuilderWallsEvents(attributeGraphics, attributeGraphics);
                    }

                }
                else if (type === 'position') {              
                    var direction = attributeGraphics.direction;

                    if ($(attributeGraphics.node).hasClass('proxy')) {
                        var attributeTypeName = attributeGraphics.attr("value");
                        
                        if (attributeGraphics.discrete){
                            var labelsGraphics = attributeGraphics.values;
                            for (var index in labelsGraphics){
                                var labelGraphic = labelsGraphics[index];
                                var attributeValue = labelGraphic.node.textContent;
                                var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];

                                if (direction === "horizontal"){
                                    var newPos = labelGraphic.rbox().cx;// - $("#accordionSidebar").width();
                                    currentNodes.forEach(function(element){
                                       var oldPos = element.rbox().cx - element.childDX;;// -$("#accordionSidebar").width();
                                       elementPos(element,newPos,oldPos,direction);
                                    })                                    
                                }
                                else if  (direction === "vertical"){
                                    if(attributeGraphics.isAxis){    
                                        if (clonationMode){                                           
                                            var newPosY = labelGraphic.rbox().cy-70;                                            
                                            var newPosX = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width();

                                            currentNodes.forEach(function(element){
                                                if (!element.cloned){
                                                    var clone =element.clone();
                                                    var oldPosY = element.rbox().cy -70-element.childDY;
                                                    var oldPosX = element.rbox().cx - element.childDX;;//$("#accordionSidebar").width();
                                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element);
                                                    clone.childDX = element.childDX;
                                                    clone.childDY = element.childDY;
                                                    element.cloned = clone; 
                                                }
                                               else{
                                                    var clone =element.cloned.clone();
                                                    var oldPosY = element.cloned.rbox().cy -70-element.cloned.childDY;
                                                    var oldPosX = element.cloned.rbox().cx - element.cloned.childDX; //$("#accordionSidebar").width()
                                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element.cloned);
                                                    clone.childDX = element.childDX;
                                                    clone.childDY = element.childDY;
                                                    element.cloned = clone; 
                                                    element.cloned = clone; 
                                               }
                                            });                                           
                                        }
                                        else{
                                            var newPos = labelGraphic.rbox().cy-70;
                                            currentNodes.forEach(function(element){
                                                //var clone =element.clone();
                                                var oldPos = element.rbox().cy -70-element.childDY;
                                                elementPos(element,newPos,oldPos,direction);
                                            });

                                            var newPos = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width();
                                            currentNodes.forEach(function(element){
                                                var oldPos = element.rbox().cx - element.childDX;;//$("#accordionSidebar").width()-element.childDX;
                                                elementPos(element,newPos,oldPos,"horizontal");
                                            });
                                        }
                                    }
                                    else{
                                        var newPos = labelGraphic.rbox().cy-70;
                                        currentNodes.forEach(function(element){
                                            var oldPos = element.rbox().cy -70-element.childDY;
                                            elementPos(element,newPos,oldPos,direction);
                                        });
                                    }
                                }
                            }
                        }
                        

                        else{
                            console.log('landed on attribute')
                            var scaleData = attributeGraphics.values;
                            var uniqueAttributeValues =  Object.keys(getActiveLayer().data[attributeTypeName].values);

                            for (var index in uniqueAttributeValues){

                                var attributeValue = uniqueAttributeValues[index];                                
                                var newPos = interpolate(attributeValue,scaleData.min,scaleData.max,scaleData.minPos, scaleData.maxPos);
                                
                                var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];
                                
                                if (direction === "horizontal"){            
                                    currentNodes.forEach(function(element){
                                       var oldPos = element.rbox().cx - element.childDX;;//-$("#accordionSidebar").width();
                                       elementPos(element,newPos,oldPos,direction);
                                    })                                    
                                }
                                else if  (direction === "vertical"){

                                    if(attributeGraphics.isAxis){
                                        if (clonationMode){
                                            var newPosY = newPos;                                            
                                            var newPosX = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width()


                                            currentNodes.forEach(function(element){
                                                if (!element.cloned){
                                                    var clone =element.clone();

                                                    var oldPosY = element.rbox().cy -70-element.childDY;
                                                    //elementPos(clone,newPosY,oldPosY,direction);
                                                    var oldPosX = element.rbox().cx - element.childDX;//$("#accordionSidebar").width()-element.childDX;
                                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element);
                                                    clone.childDX = element.childDX;
                                                    clone.childDY = element.childDY;
                                                    element.cloned = clone; 
                                                }
                                                else{
                                                    var clone =element.cloned.clone();
                                                    var oldPosY = element.cloned.rbox().cy -70-element.cloned.childDY;
                                                    //elementPos(clone,newPosY,oldPosY,direction);
                                                    var oldPosX = element.cloned.rbox().cx - element.cloned.childDX;//$("#accordionSidebar").width()-element.cloned.childDX;
                                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element.cloned);
                                                    clone.childDX = element.childDX;
                                                    clone.childDY = element.childDY;
                                                    element.cloned = clone; 
                                                    element.cloned = clone; 
                                                }
                                                   
                                            });
                                        }
                                        else{
                                            currentNodes.forEach(function(element){
                                                var oldPos = element.rbox().cy -70-element.childDY;
                                                elementPos(element,newPos,oldPos,direction);
                                             });

                                            var newPos = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width()
                                            currentNodes.forEach(function(element){
                                                var oldPos = element.rbox().cx - element.childDX;//-$("#accordionSidebar").width();
                                                elementPos(element,newPos,oldPos,"horizontal");
                                            });
                                        }

                                    }
                                    else{
                                        currentNodes.forEach(function(element){
                                            var oldPos = element.rbox().cy -70-element.childDY;
                                            elementPos(element,newPos,oldPos,direction);
                                        })
                                    }
                                }
                            }
                        }
                            
                           
                    }
                    //addBuilderWallsEvents(attributeGraphics,attributeGraphics.parent());
                    else {
                        var attributeTypeName = attributeGraphics.attr("attrType");
                        var attributeValue = attributeGraphics.node.textContent;
                        var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];

                        //console.log(attributeGraphics.discrete);
                        if (attributeGraphics.attr('attrDiscrete')){
                            if (direction === "horizontal"){   
                                var newPos = attributeGraphics.rbox().cx;// - $("#accordionSidebar").width();
                                currentNodes.forEach(function(element){
                                   var oldPos = element.rbox().cx - element.childDX;//$("#accordionSidebar").width();
                                   elementPos(element,newPos,oldPos,direction);
                                })                                    
                            }
                            else if  (direction === "vertical"){
                                var newPos = attributeGraphics.rbox().cy-70;
                                currentNodes.forEach(function(element){
                                   var oldPos = element.rbox().cy -70-element.childDY;
                                   elementPos(element,newPos,oldPos,direction);
                                })
                            }
                        }
                        else{
                            // for defining
                        }
                    }

                    //positionElementsByAttribute(attributeGraphics,attributeValue,attributeTypeName);

                } 
                else if (type === 'attractor') {
                    console.log("Attracting elements");
                    //addAttributeValueAsAttractor(attributeGraphics,attributeGraphics.node.textContent,attributeTypeName);

                    if ($(attributeGraphics.node).hasClass('proxy')) {

                        console.log("proxy");
                        var labelsGraphics = attributeGraphics.values;
                        var attributeTypeName = attributeGraphics.attr("value");

                        for (var index in labelsGraphics) {
                            var labelGraphic = labelsGraphics[index];
                            var attributeValue = labelGraphic.node.textContent;
                            addAttributeValueAsAttractor(labelGraphic, attributeValue, attributeTypeName);
                        }
                        //addBuilderWallsEvents(attributeGraphics,attributeGraphics.parent());
                    } 
                    else {
                        var attributeTypeName = attributeGraphics.attr("attrType");
                        addAttributeValueAsAttractor(attributeGraphics, attributeGraphics.node.textContent, attributeTypeName);
                    }


                } 
                else if(type === 'axis'){
                    var attributeName = attributeGraphics.attr("value");
                    attributeGraphics.direction = "vertical";
                    attributeGraphics.discrete = getActiveLayer().data[attributeGraphics.attr("value")].discrete;

                    attributeGraphics.isAxis = true;
                    var w = 70;
                    var h = 55;
                    var drawer = getActiveLayer().layer;
                    let lineAttributes = {stroke: 'black', 'stroke-width': 2, fill: '#efefef', opacity: 1, linecap: 'round'};
                    attributeGraphics.parent().animate(250).dy(getActiveLayer().left.line.rbox().y-70-(attributeGraphics.parent().rbox().cy-70)-20);
                    var axis = drawer.line(0, h, 0, drawer.height() - 40).move(attributeGraphics.parent().rbox().cx /*- $("#accordionSidebar").width()*/, 40).attr(lineAttributes);
                    axis.animate(250).height(drawer.height() - 40);

                    var x = attributeGraphics.parent().rbox().cx;//-$("#accordionSidebar").width();
                    var y = axis.y();
                    var space = axis.rbox().h;
                    addAttributeValues(attributeName, attributeGraphics, x, y, space, drawer, "vertical", attributeGraphics,axis);

                }

                entityGroup.remove();
                copyOnCanvas = false;
                blink(attributeGraphics);

            }
            else if ((distanceToTrash_x < 60) && (distanceToTrash_y < 60)){
                removeWithAnimation(entityGroup);
                copyOnCanvas = false;
            }
            else {
                if (type === 'gravity' || type === 'force' || type === 'bending'){
                    console.log('manipulatable physics added')
                    copyOnCanvas = true;
                }
                if (type === 'wall' || type === 'position' || type === 'attractor' || type === 'axis') {
                    removeWithAnimation(entityGroup);
                    copyOnCanvas = false;
                }else if(type === 'clonator'){
                    clonationMode = true;
                    copyOnCanvas = true;
                }
            }
            trashZone.rect.attr({opacity:0});
            trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            })

           if (copyOnCanvas){        
                addDragEvents(mc, entityGroup, toolEntity, type);
                addPressEvents(mc, toolEntity, getActiveLayer().layer, type);
           }

        });
    }

}

function addBuilderWallsEvents(attributeGraphics, attributeGraphicsParent) {

    //Takes the orientation of the values (axis x or y)
    var orientation = attributeGraphics.direction;

    if (!attributeGraphicsParent.hammer) {
        attributeGraphicsParent.hammer = new Hammer(attributeGraphicsParent.node);
    }

    var hammer = attributeGraphicsParent.hammer;

    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});

    let startingPoint = null;
    let currentPoint = null;
    let height = null;
    let width = null;
    let direction = null;
    var axis = null;
    var wallSize = 1.1;
    var insideSpace = nodeRadius+10;


    if (orientation === 'horizontal') {
        axis = getActiveLayer().bottom;

        hammer.on("panup", function (event) {
            direction = 'up'
//            console.log("Going to the top");

        });

        hammer.on("pandown", function (event) {
            direction = 'down'
//            console.log("Going to the down");
        });
    } else if (orientation === 'vertical') {
        axis = getActiveLayer().left;

        hammer.on('panleft', function (event) {
            direction = 'left';
//            console.log("Going to the left");
        });

        hammer.on("panright", function (event) {
            direction = 'right';
//            console.log("Going to the right");
        });
    }

    hammer.on("panstart", function (ev) {
        startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
    });

    hammer.on("panmove", function (ev) {
        currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
        height = -( currentPoint.y - startingPoint.y);
        width = currentPoint.x - startingPoint.x;

        if (orientation === "horizontal") {

            var y = axis.line.cy();
//            console.log("changing");
//            console.log(y);

            if ($(attributeGraphics.node).hasClass('proxy')) {
                attributeGraphics.axis = axis;

//                the proxy thing
//                change line 797 after demo 
                
                var xProxy = attributeGraphics.rbox().cx;// - $("#accordionSidebar").width();
                //console.log(xProxy);
                buildWall(attributeGraphics, wallSize, height, [xProxy, y], 'both', insideSpace, direction, true);

                for (var index in axis.valueLabels) {

                    var x = axis.valueLabels[index].cx();

                    //BOLD THE TEXT
                    boldText(axis.valueLabels[index]);

                    buildWall(axis.valueLabels[index], wallSize, height, [x, y], 'both', insideSpace, direction);
                }
            } else {
                buildWall(attributeGraphics, wallSize, height, [attributeGraphics.cx(), y], 'both', insideSpace, direction);
            }
        } else if (orientation === "vertical") {
            let x = axis.line.cx();
            var yProxy = attributeGraphics.rbox().cy - 70;
            //console.log(yProxy);

            if ($(attributeGraphics.node).hasClass('proxy')) {
                attributeGraphics.axis = axis;
                buildWall(attributeGraphics, width, wallSize, [x, yProxy], 'both', insideSpace, direction, true);

                //the proxy thing
                for (var index in axis.valueLabels) {
                    var y = axis.valueLabels[index].cy();
                    //BOLD THE TEXT
                    boldText(axis.valueLabels[index]);
                    buildWall(axis.valueLabels[index], width, wallSize, [x, y], 'both', insideSpace, direction);
                }
            } else {
                buildWall(attributeGraphics, width, wallSize, [x, attributeGraphics.cy()], 'both', insideSpace, direction);
            }
        }
    });


    hammer.on("panend", function (ev) {
        
        if ($(attributeGraphics.node).hasClass('proxy')) {
            attributeGraphics.walls[0].previousIncrement = 0;

            for (var index in axis.valueLabels) {
                unBoldText(axis.valueLabels[index]);
                axis.valueLabels[index].walls[0].previousIncrement = 0;
            }
        } else {
            let attributeName = attributeGraphics.attr("attrType");
            let attributeValue = attributeGraphics.node.textContent;
            highlightNodesByAttributeValue(attributeValue, attributeName, false);
            attributeGraphics.walls[0].previousIncrement = 0;
     
        }
    });

    initializeWalls(attributeGraphics,wallSize,insideSpace,direction,orientation,axis);
}

//note -- this will fire twice. it's unavoidable with our current setup in hammer 
function addAttributesDraggingEvents(element, attributeName, isDiscrete, hammer) {
    let mc = new Hammer(element);
    //console.log(element)
    
    //mc.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    mc.get('pan').set({enable: true, direction: Hammer.DIRECTION_ALL, threshold: 5});

    let group = null;
    let rect = null;
    let label = null;
    let startingPoint = null;
    let currentPoint = null;
    let distance = null;
    let targetDropZone = null;
    let activeLayer = null;
    let drawer = null;
    let direction = null;

    let leftGlow = null;
    let bottomGlow = null;
    let trashGlow = null;

    let leftZone = null;//
    let bottomZone = null;
    let trashZone = null;

    //specifically for trashZone
    let trashRect = null;
    let trashIcon = null;

    var isGlow = false;
    //var count = 0;

    //for removal of walls
    let wallDir = null;

    mc.on("panstart", function (ev) {

        drawer = getActiveLayer().layer;
        startingPoint = {x: ev.srcEvent.pageX /*- $("#onSidebar").width()*/, y: ev.srcEvent.pageY - 70};

        //for defining labels that are going to be dragged

        label = drawer.text(attributeName).id('test').attr({
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
            isDiscrete: isDiscrete,
        }).center(startingPoint.x, startingPoint.y);

        trashIcon = drawer.rect(Math.min(label.rbox().w + 10, 82), 30).attr({
            fill: '#d8d9df',
            rx: 5,
            ry: 5,
            stroke: "#858796",
            class: 'toolable proxy',
            value: attributeName,
            isDiscrete: isDiscrete,
        }).center(startingPoint.x, startingPoint.y);

        rect.values = [];

        group = drawer.group();
        group.add(rect);
        group.add(label);
        group.addClass('attr-' + attributeName);       


        //}

        
    });


    mc.on("panmove", function (ev) {
        currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY - 70};

        group.move(currentPoint.x - startingPoint.x, currentPoint.y - startingPoint.y);

        //init
        activeLayer = getActiveLayer();
        leftZone =  activeLayer.left;
        bottomZone =  activeLayer.bottom;
        trashZone = activeLayer.trash;
        
        
        //add a flag to see if there has been a drop
        //isGlow = true;

        //threshold for glows
        let threshold = activeLayer.layer.width() - 10;
        let distanceToLeft = currentPoint.x - (activeLayer.left.rect.x() + activeLayer.left.rect.width());
        let distanceToBottom = activeLayer.bottom.rect.y() - currentPoint.y;

        //let distanceToTrash = Math.min(activeLayer.trash.rect.x() - currentPoint.x, currentPoint.y - activeLayer.trash.rect.y());

        let distanceToTrash_x = Math.abs(activeLayer.trash.rect.cx() - currentPoint.x);
        let distanceToTrash_y = Math.abs(activeLayer.trash.rect.cy() - currentPoint.y);
        //let distanceToTrash = Math.min(Math.abs(activeLayer.trash.rect.cy() - currentPoint.y), Math.abs(activeLayer.trash.rect.cx() - currentPoint.x));
        let distanceToTrash = [distanceToTrash_x, distanceToTrash_y];
        //let distanceToTrash = Math.min( Math.abs(activeLayer.trash.rect.width() + activeLayer.trash.rect.x() - currentPoint.x), Math.abs(activeLayer.trash.rect.x() - currentPoint.x));
        let distanceToTrashCoords = {x: activeLayer.trash.rect.x() - currentPoint.y, y: activeLayer.trash.rect.y() - currentPoint.y};   //818 top, 0 left

        //if anywhere within trash.rect.x - threshold, or anywhere within trahs.rect.y - threshold, take effect

        //initial opacities are 0
        //also make the glow appear at this point
        if (!leftZone.hasAttribute){
            leftZone.rect.attr({opacity: 20});
            //leftZone.filter("url(#dropZoneBlur)");
        }

        if (!bottomZone.hasAttribute){
            bottomZone.rect.attr({opacity: 20});
           // bottomZone.filter("url(#dropZoneBlur)");
        }
        //initially start out 
        trashZone.rect.attr({opacity:30});
        //trashZone.rect.appendChild(activeLayer.trash.icon)




        // //start out and check and glow from the start
        if (distanceToLeft < distanceToBottom) {
            distance = distanceToLeft;
            targetDropZone = activeLayer.left;
            direction = "vertical";
        }
        else {
            distance = distanceToBottom;
            targetDropZone = activeLayer.bottom;
            direction = "horizontal";
        }

        
        if (distance < threshold) {
            //left < bottom < trash
            //left < trash < bottom
            if ( ((distanceToLeft < distanceToBottom) && (distanceToLeft < distanceToTrash_x) )
                )
            {
                distance = distanceToLeft;
                targetDropZone = activeLayer.left;
                direction = "vertical";
            }

            //bottom < left < trash
            //bottom < trash < left
            else if ( ((distanceToBottom <= distanceToLeft) && (distanceToBottom < distanceToTrash_y)))
            {
                distance = distanceToBottom;
                targetDropZone = activeLayer.bottom;
                direction = "horizontal";
            }

            // trash < left < bottom
            //trash < bottom < left
            else if ( ((distanceToTrash_x < distanceToLeft) && (distanceToTrash_y < distanceToBottom))
                ) {
                
                if( (distanceToTrash_x < distanceToTrash_y) && ( (distanceToTrash_x < activeLayer.trash.rect.width()) && (distanceToTrash_y < activeLayer.trash.rect.width()) )){
                    distance = distanceToTrash_x;
                }
                else if( (distanceToTrash_x >= distanceToTrash_y) && ( (distanceToTrash_x < activeLayer.trash.rect.width()) && (distanceToTrash_y < activeLayer.trash.rect.height()) )){
                    distance = distanceToTrash_y;
                }
                else{
                    distance = Math.max(distanceToTrash_x, distanceToTrash_y);
                }
                //console.log('d ' + distance)
                targetDropZone = activeLayer.trash;
                direction = "trash";
            }
            //console.log(direction)

           //setVisibilityOfAttributeValues(targetDropZone, 1 - (distance/threshold));
           if (!targetDropZone.hasAttribute){
                targetDropZone.rect.attr({opacity: 1 - (distance / threshold)});
            }
           //this is literally disgusting code 
           //want inverse dependent on whether this is closer
           if (distance < threshold/4){
            
            leftZone.rect.attr({opacity: distance/threshold*2});
            bottomZone.rect.attr({opacity: distance/threshold*2});
            trashZone.rect.attr({opacity: distance/threshold*2});
            targetDropZone.rect.attr({opacity: 1 - (distance / threshold)});

            if (!targetDropZone.hasAttribute){
                
                setVisibilityOfAttributeValues(targetDropZone, 0.25);
            }

            if (leftZone.hasAttribute){
                leftZone.rect.attr({opacity: 0})
            }

            if (bottomZone.hasAttribute){
                bottomZone.rect.attr({opacity: 0});
            }
           }


            //theDropping Zone is target Zone
            /*console.log(direction);
            console.log(distanceToTrash_x + " " + distanceToTrash_y);
            console.log(distance);*/
            if ( (distance < 50) || ((distanceToTrash_x < 100) && distanceToTrash_y < 100)){
                //console.log(targetDropZone.valueLabels)
                if (!targetDropZone.valueLabels) {

                    let x = null;
                    let y = null;
                    let space = null;
                    let line = null;
                    rect.direction = direction;
                    rect.discrete = getActiveLayer().data[attributeName].discrete;

                    distanceToLeft = Math.abs(currentPoint.x - (activeLayer.left.rect.x() + activeLayer.left.rect.width()) );
                    distanceToBottom = Math.abs(activeLayer.bottom.rect.y() - currentPoint.y);
                    /*distanceToTrash = Math.min((activeLayer.trash.rect.x() - currentPoint.x), (currentPoint.y - activeLayer.trash.rect.y()));*/
                    //distanceToTrash = Math.abs (currentPoint.y - activeLayer.trash.rect.y());

                    distanceToTrash_x = Math.abs(activeLayer.trash.rect.cx() - currentPoint.x);
                    distanceToTrash_y = Math.abs(activeLayer.trash.rect.cy() - currentPoint.y);
                    //let distanceToTrash = Math.min(Math.abs(activeLayer.trash.rect.cy() - currentPoint.y), Math.abs(activeLayer.trash.rect.cx() - currentPoint.x));
                    distanceToTrash = [distanceToTrash_x, distanceToTrash_y];
                    
                    //console.log(distanceToTrash_x + " xy " + distanceToTrash_y);

    

                    //if (distanceToLeft < distanceToBottom){
                    if ( ((distanceToLeft < distanceToBottom) && (distanceToLeft < distanceToTrash_x)) )/* || 
                        ((distanceToLeft < distanceToTrash) && (distanceToLeft < distanceToBottom))){*/
                    {
                        x = activeLayer.left.rect.cx();
                        y = activeLayer.left.line.y();
                        space = activeLayer.left.line.rbox().h;
                        line = activeLayer.left.line;
                        /*direction = 'left';*/
                    }

            

                    else if ( ((distanceToBottom <= distanceToLeft) && (distanceToBottom <= distanceToTrash_y)) )/*|| 
                        ((distanceToBottom < distanceToTrash) && (distanceToBottom < distanceToLeft))
                        )*/
                    {
                        x = activeLayer.bottom.line.x();
                        y = activeLayer.bottom.rect.cy() - 25; //targetDropZone.rect
                        space = activeLayer.bottom.line.width();
                        line = activeLayer.bottom.line;

                       /* direction = 'bottom';*/
                    }

                    //for equal cases? with trash
                    //check these
                    else if ( (distanceToTrash_x < distanceToLeft) && (distanceToTrash_y < distanceToBottom) ){
                        x = activeLayer.trash.rect.x(); ////////FIX THIS LATER TO MAKE THE DROP ZONE BIGGER
                        y = activeLayer.trash.rect.height();
                        space = activeLayer.trash.line.rbox().h; //check this
                        line = activeLayer.trash.line;

                        
                       /* direction = 'trash';*/
                    }

                    /*if (direction === "horizontal") {
                        x = activeLayer.left.rect.cx();
                        y = activeLayer.left.line.y();
                        space = activeLayer.left.line.rbox().h;
                        line = activeLayer.left.line;
                    } 

                    else if (direction === "vertical") {
                        x = activeLayer.bottom.line.x();
                        y = targetDropZone.rect.cy() - 25;
                        space = activeLayer.bottom.line.width();
                        line = activeLayer.bottom.line;
                    } 

                    //define for trash
                    else if (direction === "trash") {
                        x = activeLayer.trash.rect.x();
                        y = activeLayer.trash.line.height();
                        space = activeLayer.trash.line.rbox().h;
                        line = activeLayer.trash.line;
                    }*/
                    //console.log(targetDropZone.hasAttribute);
                    if (direction !== "trash" && !targetDropZone.hasAttribute){
                        addAttributeValues(attributeName, targetDropZone, x, y, space, drawer, direction, rect,line);
                    }

                    if (distanceToTrash_x < 150 && distanceToTrash_y < 150){
                        trashZone.icon.attr({
                            fill: 'white',
                            opacity: 1
                        })
                        //trashZone.icon.addClass('active')
                    }
                    else{
                        trashZone.icon.attr({
                            fill: 'gray',
                            opacity: .25
                        })
                        // trashZone.icon.removeClass('hover')
                    }

                } else if (!targetDropZone.hasAttribute) {                  
                    setVisibilityOfAttributeValues(targetDropZone, 0.5);
                }
            } else if (!targetDropZone.hasAttribute) {               
                removeAttributeValues(attributeName, direction);
                targetDropZone.valueLabels = null;
                //setVisibilityOfAttributeValues(targetDropZone, 0);
                //targetDropZone.removeClass('glow-anim');
            }

        } else {
            targetDropZone.rect.attr({opacity: 0});
            trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            })
            //trashZone.icon.removeClass('hover')
            targetDropZone = null;
        }
    });
//increase drop zone for trash
    mc.on("panend", function (ev) {

        /*leftZone.removeClass('glow-anim');
        bottomZone.removeClass('glow-anim');*/

        let removed = false;
        

        setTimeout(function () {

            // attribute dropped inside a dropping area
            //addAttributesDraggingEvents(group, attributeName, isDiscrete)
            //console.log(targetDropZone == activeLayer.bottom);
            //if (activeZone)
            

            if ((targetDropZone && distance < 30) && !targetDropZone.hasAttribute) {

                let x = null;
                let y = null;
                
                if (direction === "horizontal") {
                    x = -startingPoint.x + activeLayer.bottom.line.x() + activeLayer.bottom.line.rbox().w + rect.rbox().w / 2 + 5;
                    y = targetDropZone.line.cy() - startingPoint.y;
                    group.droppedLocation = 'horizontal';
                }
                else if (direction === 'vertical') {
                    x = -startingPoint.x + targetDropZone.rect.width();
                    y = -startingPoint.y + rect.height() / 2 + 5;
                    group.droppedLocation = 'vertical';
                }

                if (direction === 'trash'){
                    removed = true;
                    removeWithAnimation(group);
                    //$('.wall-' + ).remove();
                    trashZone.icon.attr({
                        fill: 'gray',
                        opacity: .25
                    })
                    
                    //remove with animation 

                    //removeAttributeFromExistence()
                    //return;
                }

                group.animate(250).move(x, y);

                targetDropZone.rect.animate(250).attr({opacity: 0});

                setTimeout(function () {
                    targetDropZone.line.animate(250).attr({opacity: 1});
                    setVisibilityOfAttributeValues(targetDropZone, 1, false);

                }, 350);
                targetDropZone.hasAttribute = true;
                ACTIVEATTRIBUTES[group.node.id] = {'name': attributeName, 'group': group, 'occupantZone': targetDropZone.hasAttribute ? targetDropZone : null, madeAxis: true};
            } 

            //remove in trash zone
            else {
//              removeWithAnimation(group);
                leftZone.rect.animate(250).attr({opacity: 0});
                leftZone.rect.removeClass('glow-anim');
                bottomZone.rect.animate(250).attr({opacity: 0});
                bottomZone.rect.removeClass('glow-anim');
                trashZone.rect.animate(250).attr({opacity: 0});
                trashZone.rect.removeClass('glow-anim');

                /*if (direction != 'trash'){
                    //ACTIVEATTRIBUTES[group.node.id] = {'name': attributeName, 'group': group, 'occupantZone': null, madeAxis: false};

                }*/
                removed = true;
                removeWithAnimation(group);
                //screw it and just remove the damn thing

            }

            /*console.log(direction + " ")
            console.log(group.droppedLocation  );*/

            
            
            trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            })

            if (!removed){
                addPressAttribute(new Hammer(group.node), group, rect, targetDropZone, attributeName, direction);
                console.log('added press attr')
            }
            //wow it finally works lol. absolutely needs a new hammer node and the rectangle

            if (group.droppedLocation == 'vertical'){
               $('.wall-vertical').remove();
            }

            else if (group.droppedLocation == 'horizontal'){
                $('.wall-horizontal').remove();
            }
            //also remove old axes

        }, 300);
        
        
        //addAttributesDraggingEvents(element, isDiscrete, attributeName)
        //addD(mc, group);
        //disableGlow(activeLayer.left.rect, leftGlow);
 //       disableGlow(activeLayer.bottom.rect, bottomGlow)
        //now push that canavs on
    });


}

function addPressAttribute(hammer, entityGroup, attrEntity, zone, attrName, dir){

    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    hammer.get('press').set({time: 300});

    //console.log(entityGroup.label)
    let startingPoint = null;
    let currentPoint = null;
    let activeLayer = getActiveLayer();
    let drawer = getActiveLayer().layer;
    let activeDirection = dir;
    let threshold_w = activeLayer.layer.width() - 10;
    let threshold_h = activeLayer.layer.height() - 10;

    let disatanceToLeft = null;
    let distanceToBottom = null;
    let distanceToTrash_x = null;
    let distanceToTrash_y = null;
    let initX = null;
    let initY = null;

    

    let leftZone = activeLayer.left;
    let bottomZone = activeLayer.bottom;
    let trashZone = activeLayer.trash;
    let activeZone = zone;

    //may not be necessary
    let activeDistance = null;  //x or y value depending on direction
    let thresh = null;
    let distance, targetDropZone, direction = null;

    hammer.on('press', function(event){
        event.preventDefault();
        $(event.target).attr('oncontextmenu', 'return false');
        hammer.off('panmove');
        blink(entityGroup);

        hammer.on("panstart", function (ev) {
            startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
            initX = startingPoint.x;
            initY = startingPoint.y - 70;
            attrEntity.previousX = initX;
            attrEntity.previousY = initY;

            attrEntity.disToCenterX = entityGroup.cx();
            attrEntity.disToCenterY = entityGroup.cy();

            distanceToTrash_x = Math.abs(trashZone.rect.cx() - attrEntity.disToCenterX);
            distanceToTrash_y = Math.abs(trashZone.rect.cy() - attrEntity.disToCenterY);
        });


        hammer.on("panmove", function (ev) {
            currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY - 70};
            entityGroup.dmove(currentPoint.x - attrEntity.disToCenterX, currentPoint.y - attrEntity.disToCenterY);

            //if targetZone is pulled out, remove the target attributes
            distanceToLeft = currentPoint.x - (leftZone.rect.x() + leftZone.rect.width());
            distanceToBottom = bottomZone.rect.y() - currentPoint.y;
            distanceToTrash_x = Math.abs(trashZone.rect.cx() - attrEntity.disToCenterX);
            distanceToTrash_y = Math.abs(trashZone.rect.cy() - attrEntity.disToCenterY);

            //console.log(distanceToTrash_x + " " + distanceToTrash_y);

        
            //initializations
            trashZone.rect.attr({opacity:30});

            if( (distanceToTrash_x < distanceToTrash_y) && ( (distanceToTrash_x < activeLayer.trash.rect.width()) && (distanceToTrash_y < activeLayer.trash.rect.width()) )){
                distance = distanceToTrash_x;
            }

            else if( (distanceToTrash_x >= distanceToTrash_y) && ( (distanceToTrash_x < activeLayer.trash.rect.width()) && (distanceToTrash_y < activeLayer.trash.rect.height()) )){
                distance = distanceToTrash_y;
            }
            else{
                distance = Math.max(distanceToTrash_x, distanceToTrash_y);
            }

            //don't highlight any of these here, just have option to remove
            /*if (!targetDropZone.hasAttribute){
                targetDropZone.rect.attr({opacity: 1 - (distance / threshold)});
            }*/

            if (distance < 500){

                trashZone.rect.attr({opacity: (trashZone.rect.cx() - distance)/threshold_w*2});

                /*leftZone.rect.attr({opacity: 1.25*Math.abs((activeZone.rect.cx() - currentPoint.x)/threshold_w)});
                bottomZone.rect.attr({opacity: 1.25*Math.abs((activeZone.rect.cy() - currentPoint.y)/threshold_h)})*/
                
                let op = 1.25 - 1.25*Math.abs(1-distance/threshold_w)
                //console.log(op)

                $('.ticks-' + attrName + "." + dir).attr({opacity: op})
                activeZone.line.attr({opacity: op})
                /*activeZone.line.attr({opacity: 1 - 1.25*Math.abs(activeDistance/threshold)})*/
            }

            if (distanceToTrash_x < 100 && distanceToTrash_y < 100){
                trashZone.icon.attr({
                    fill: 'white',
                    opacity: 1
                })
            }
            
            else{
                trashZone.rect.attr({opacity: 0});
                trashZone.icon.attr({
                    fill: 'gray',
                    opacity: .25
                })
            }

            //detect if its in the trash zone

            attrEntity.disToCenterX = entityGroup.cx();
            attrEntity.disToCenterY = entityGroup.cy();

        });


        hammer.on("panend", function (ev) {
            trashZone.rect.attr({opacity:0});
            activeZone.rect.animate(250).attr({opacity: 0});

            setTimeout(function(){
                removeAttributeValues(attrName, dir);
                removeWithAnimation(entityGroup);
                activeZone.hasAttribute = false;
                activeZone.line.attr({opacity: 0});
                if (entityGroup.droppedLocation == 'vertical'){
                   $('.wall-vertical').remove();
                }

                else if (entityGroup.droppedLocation == 'horizontal'){
                    $('.wall-horizontal').remove();
                }
            }, 300)
            
            activeZone.valueLabels = null;
            trashZone.icon.attr({
                fill: 'gray',
                opacity: .25
            });

        });

    })

    hammer.on('pressup', function (event) {
            hammer.off('panstart');
            hammer.off('panmove');
            hammer.off('panend');
            //addPressAttribute(hammer, entityGroup, attrEntity, zone, attrName, dir){
            console.log('addPressAttribute added')
            addPressAttribute(hammer, entityGroup, attrEntity, zone, attrName, dir);
            //addDragEvents(mc, toolGraphics.parent(), toolGraphics);
        });

   
}



function addAttributeValuesEvents(nodeGraphics, attributeName) {
    nodeGraphics.on('pointerdown', function () {
        console.log("showing");
        //console.log(nodeGraphics.node.textContent);
        highlightNodesByAttributeValue(nodeGraphics.node.textContent, attributeName, true);
    });

    nodeGraphics.on('pointerup', function () {
        highlightNodesByAttributeValue(nodeGraphics.node.textContent, attributeName, false);
    });

}