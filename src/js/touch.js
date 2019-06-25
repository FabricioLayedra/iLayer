/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var clonationMode = false;

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

    if (type === 'gravity') {
        mc.get('press').set({time: 300});

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
            let color = '#f06';
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
                addDragEvents(mc, toolGraphics.parent(), toolGraphics);

            });
        });
        mc.on('pressup', function (event) {
            mc.off('panstart');
            mc.off('panmove');
            mc.off('panend');
            addDragEvents(mc, toolGraphics.parent(), toolGraphics);
        });

    } else if (type === 'bending') {

//        console.log();
        addLayerEvents(getActiveLayer().layer.node, getActiveLayer().layer);
    } else if (type === 'wall') {



    } else if (type === 'position') {

    }



}

function moveElements(event, nodeGraphics, child, isProxy, graphicProxy) {
    console.log("moving");
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

    console.log(nodeGraphics.cx())


//    
//    
//    let currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
////        console.log(ghost.cx(),ghost.cy());
//    nodeGraphics.center(currentPoint.x-$("#accordionSidebar").width(),currentPoint.y-70);
}

function addDragEvents(hammer, ghostFather, ghost, isProxy, graphicProxy) {

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});



    let startingPoint = null;

    hammer.on("panstart", function (ev) {

        startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
        var initX = startingPoint.x ;//- $("#accordionSidebar").width();
        var initY = startingPoint.y - 70;
        ghost.previousX = initX;
        ghost.previousY = initY;

        ghost.disToCenterX = ghostFather.cx();
        ghost.disToCenterY = ghostFather.cy();

    });

    hammer.on("panmove", function (ev) {
        moveElements(ev, ghostFather, ghost, isProxy, graphicProxy);
    });

//    mc.on("panend", function (ev) {
//        ghost.front();
//        ghost.draggable();
//        console.log(ghost);
//        addPressEvents(ghost.node,ghost);
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
        let ghost = null;
        let ghostFather = null;

        let attributeLand = null;


        var initX;
        var initY;

        mc.on("panstart", function (ev) {
            console.log(type)
            startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};

             initX = startingPoint.x;// - $("#accordionSidebar").width();
             initY = startingPoint.y - 70;

            path = $($(tool).children()[0]).children()[0].getAttribute("d");
            ghostFather = getActiveLayer().layer.group();

            //console.log(initX, initY);

            //only add ghost if it comes out of the drop zone

            //if (ghost.x >= $('#set-tools').outerHeight();)


            // ghost = getActiveLayer().layer.path(path).move(initX, initY).attr({"tool": true, fill: getActiveLayer().color});
            // var relationAspect = ghost.width() / ghost.height();
            // ghost.height(50);
            // ghost.width(50 * relationAspect);

            // ghostFather.add(ghost);
            // ghostFather.add(getActiveLayer().layer
            //         .text(type)
            //         .center(ghost.cx(), ghost.cy() + ghost.height() * 0.6)
            //         );

            // ghost.previousX = initX;
            // ghost.previousY = initY;

            // //set the distance between the group and the tool
            // ghostFather.childDX = ghostFather.cx() - getElementFromGroup(ghostFather, 'path').cx();
            // ghostFather.childDY = ghostFather.cy() - getElementFromGroup(ghostFather, 'path').cy();
        });

        mc.on("panmove", function (event) {
            currentPoint = {x: event.srcEvent.pageX, y: event.srcEvent.pageY};

            var x = currentPoint.x;// - $("#accordionSidebar").width();
            var y = currentPoint.y - 70;



            //////////newly added
            ghost = getActiveLayer().layer.path(path).move(initX, initY).attr({"tool": true, fill: getActiveLayer().color});
            var relationAspect = ghost.width() / ghost.height();
            ghost.height(50);
            ghost.width(50 * relationAspect);

            ghostFather.add(ghost);
            ghostFather.add(getActiveLayer().layer
                    .text(type)
                    .center(ghost.cx(), ghost.cy() + ghost.height() * 0.6)
                    );

            ghost.previousX = initX;
            ghost.previousY = initY;

            //set the distance between the group and the tool
            ghostFather.childDX = ghostFather.cx() - getElementFromGroup(ghostFather, 'path').cx();
            ghostFather.childDY = ghostFather.cy() - getElementFromGroup(ghostFather, 'path').cy();
            ///////////////////


            ghostFather.dmove(x - ghost.previousX, y - ghost.previousY);
            ghost.previousX = ghostFather.cx();
            ghost.previousY = ghostFather.cy();

            if (type === 'wall' || type === 'position' || type === 'attractor' || type === 'axis') {
                attributeLand = isClassedGraphics(getActiveLayer().layer.node, x, y, 'toolable');
            }

        });

        mc.on("panend", function (ev) {
            currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
            var x = currentPoint.x;// - $("#accordionSidebar").width();
            var y = currentPoint.y - 70;
            ghost.front();
            let mc = new Hammer(ghost.node);

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
//                            blink(labelGraphic);

                        }

                        addBuilderWallsEvents(attributeGraphics, attributeGraphics.parent());
                        
                        // TODO: build the wall here, right after the wall tool has been added to the proxy
                        // or to a single attribute value (that's perhaps in another if)

                    } else {
                        addBuilderWallsEvents(attributeGraphics, attributeGraphics);
                    }

                } else if (type === 'position') {
                    
                    var direction = attributeGraphics.direction;

                    if ($(attributeGraphics.node).hasClass('proxy')) {
                        
                        var attributeTypeName = attributeGraphics.attr("value");

                        if (attributeGraphics.discrete){
                            var labelsGraphics = attributeGraphics.values;

                            for (var index in labelsGraphics) {
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
                                               }else{
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
                                            
                                        }else{
                                            var newPos = labelGraphic.rbox().cy-70;
                                            currentNodes.forEach(function(element){
//                                               var clone =element.clone();
                                               var oldPos = element.rbox().cy -70-element.childDY;
                                               elementPos(element,newPos,oldPos,direction);
                                            });

                                            var newPos = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width();
                                            currentNodes.forEach(function(element){
//                                                var clone =element.clone();

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
//                                               elementPos(clone,newPosY,oldPosY,direction);
                                                var oldPosX = element.rbox().cx - element.childDX;//$("#accordionSidebar").width()-element.childDX;
                                                elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element);
                                                clone.childDX = element.childDX;
                                                clone.childDY = element.childDY;
                                                element.cloned = clone; 
                                               }else{
                                                    var clone =element.cloned.clone();
                                                    var oldPosY = element.cloned.rbox().cy -70-element.cloned.childDY;
//                                               elementPos(clone,newPosY,oldPosY,direction);
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

                                    }else{
                                        currentNodes.forEach(function(element){
                                            var oldPos = element.rbox().cy -70-element.childDY;
                                            elementPos(element,newPos,oldPos,direction);
                                        })
                                    }
                                }
                            }
                        }
                            
                           
                    }
//                        addBuilderWallsEvents(attributeGraphics,attributeGraphics.parent());
                    else {

                        var attributeTypeName = attributeGraphics.attr("attrType");
                        var attributeValue = attributeGraphics.node.textContent;
                        var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];

                        console.log(attributeGraphics.discrete);
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

//                    positionElementsByAttribute(attributeGraphics,attributeValue,attributeTypeName);

                } else if (type === 'attractor') {
                    console.log("Attracting elements");
//                    addAttributeValueAsAttractor(attributeGraphics,attributeGraphics.node.textContent,attributeTypeName);

                    if ($(attributeGraphics.node).hasClass('proxy')) {

                        console.log("proxy");
                        var labelsGraphics = attributeGraphics.values;
                        var attributeTypeName = attributeGraphics.attr("value");

//                        console.log(attributeGraphics.attr("isDiscrete"));
                        for (var index in labelsGraphics) {
//                            console.log(attributeGraphics.values[index]);
                            var labelGraphic = labelsGraphics[index];
                            var attributeValue = labelGraphic.node.textContent;
                            addAttributeValueAsAttractor(labelGraphic, attributeValue, attributeTypeName);
                        }
//                        addBuilderWallsEvents(attributeGraphics,attributeGraphics.parent());
                    } else {

                        var attributeTypeName = attributeGraphics.attr("attrType");
                        addAttributeValueAsAttractor(attributeGraphics, attributeGraphics.node.textContent, attributeTypeName);
                    }


                } else if(type === 'axis'){
//                    console.log("ADDING LINE");
//                    console.log(attributeGraphics);
                    var attributeName = attributeGraphics.attr("value");
//                    console.log(getActiveLayer().data[attributeGraphics.attr("value")]);
//                    console.log(getAttributeValues(attributeGraphics.attr("value")));
//                    console.log(getActiveLayer().left.line.rbox().y-70);
//                    console.log(attributeGraphics.parent().rbox().y-70);
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
//                    console.log(getAttributeValues(attributeName));
                    addAttributeValues(attributeName, attributeGraphics, x, y, space, drawer, "vertical", attributeGraphics,axis);

                }

                ghostFather.remove();

                blink(attributeGraphics);

            } else {
                if (type === 'wall' || type === 'position' || type === 'attractor' || type === 'axis') {
                    removeWithAnimation(ghostFather);
                }else if(type === 'clonator'){
                    clonationMode = true;
                }
            }



            addDragEvents(mc, ghostFather, ghost);
            addPressEvents(mc, ghost, getActiveLayer().layer, type);
            //        console.log(activeLayer);


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

function addAttributeValuesEvents(nodeGraphics, attributeName) {
    nodeGraphics.on('pointerdown', function () {
        console.log("showing");
        console.log(nodeGraphics.node.textContent);
        highlightNodesByAttributeValue(nodeGraphics.node.textContent, attributeName, true);
    });

    nodeGraphics.on('pointerup', function () {
        highlightNodesByAttributeValue(nodeGraphics.node.textContent, attributeName, false);
    });

}