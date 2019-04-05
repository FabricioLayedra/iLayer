/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

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
    if (this.node.allowed){
        let x = event.pageX-this.cx()-this.node.dx;
        let y = event.pageY-this.cy()-this.node.dy;
        this.dmove(x,y);
        updateEdgesEnds(getElementFromGroup(this,'circle'),this.cx()-this.childDX,this.cy()-this.childDY);
        this.node.initX = this.cx()-this.childDX;
        this.node.initY = this.cy()-this.childDY;
        
        if (this.matter){
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
    console.log(drawer);
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
        touchCanvas = isFreePoint(layer,startingPoint.x,startingPoint.y);



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
            SVG.select('g').members.forEach(
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

function selectionMode(mode) {
    if (mode) {
        var groups = getActiveLayer().layer.select('g.node').members;
        for (var index in groups) {
            let group = groups[index];
//            console.log(group);
            removeTouchEvents(group);
            group.on('pointerdown', function () {
//                console.log(group.node.id);
                console.log(group);
                addNodeToSelection(group);
            });
        }
        selectionFlag = mode;
    } else {
        var groups = getActiveLayer().layer.select('g.node').members;
        for (var index in groups) {
            let group = groups[index];
            group.off('pointerdown');
        }
        selectionFlag = mode;
    }
}

function addSelectionEvents(nodeParent) {
    var mc = new Hammer(nodeParent.node);

    nodeParent.node.hammer = mc;

    mc.get('press').set({time: 300});

    mc.on('press', function (event) {
        selectionMode(true);
    });

    mc.on('pressup', function (event) {
        addNodeToSelection(nodeParent);

    });
}
function addPressEvents(mc, toolGraphics, drawer, type, child) {
    if (type === 'gravity') {
        console.log(type);
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
                startingPoint = {x: center.cx - $("#accordionSidebar").width(), y: center.cy - 65};

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
        
    } 
    else if (type === 'bending') {
//        console.log();
        addLayerEvents(getActiveLayer().layer.node, getActiveLayer().layer);
    }
    else if (type === 'wall'){
        
    }
    else if (type === 'position'){
        
    }
}

function moveElements(event, nodeGraphics, child) {
    let currentPoint = {x: event.srcEvent.pageX, y: event.srcEvent.pageY};

//    console.log("Previous");
//    console.log(x,y);

    var x = currentPoint.x-$("#accordionSidebar").width() - child.previousX;
    var y = currentPoint.y-70 - child.previousY;
    

//    console.log(child.disToCenterX+x,child.disToCenterY+y);
//    getActiveLayer().layer.circle(5).center(x,y).fill("red");
//    console.log("*******************");
//    console.log(x,y);

/// THE IF IS NOT THE BEST THING TO DO BUT WE NEED TO KEEP GOING. 
    if(nodeGraphics === child){
        nodeGraphics.center(child.disToCenterX+x,child.disToCenterY+y);
    }else{
        nodeGraphics.dmove(x,y);
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
    
    if (nodeGraphics.matter){
////        nodeGraphics.matter.isStatic = f
//        nodeGraphics.matter.position.x = child.previousX;
//        nodeGraphics.matter.position.y = child.previousY;
//        console.log(nodeGraphics.matter.position.x);
//        console.log(nodeGraphics.matter.position.y);

//        console.log("Changing the position...");
//        nodeGraphics.matter.position.x =  nodeGraphics.matter.position.x +5;
//        nodeGraphics.matter.position.y = nodeGraphics.matter.position.y + 5;
        
        Matter.Body.setPosition(nodeGraphics.matter,{x:child.cx(),y:child.cy()});

//        console.log(nodeGraphics.matter.position.x);
//        console.log(nodeGraphics.matter.position.y);
        
//        Matter.Body.setStatic(nodeGraphics.matter,true);
//        nodeGraphics.matter.isStatic = true;
    }
    

//    
//    
//    let currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
////        console.log(ghost.cx(),ghost.cy());
//    nodeGraphics.center(currentPoint.x-$("#accordionSidebar").width(),currentPoint.y-70);
}

function addDragEvents(hammer, ghostFather, ghost) {

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});



    let startingPoint = null;
    
    hammer.on("panstart", function (ev) {

        startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
        var initX = startingPoint.x - $("#accordionSidebar").width();
        var initY = startingPoint.y - 70;
        console.log("INIT POS");
        console.log(initX, initY);
        ghost.previousX = initX;
        ghost.previousY = initY;

        ghost.disToCenterX = ghostFather.cx();
        ghost.disToCenterY = ghostFather.cy();

    });

    hammer.on("panmove", function (ev) {
        moveElements(ev, ghostFather, ghost);
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

function addToolEvents(tool, type) {
//    console.log($(tool).prop('disabled'));
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

        mc.on("panstart", function (ev) {

            startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};

            var initX = startingPoint.x - $("#accordionSidebar").width();
            var initY = startingPoint.y - 70;

            path = $($(tool).children()[0]).children()[0].getAttribute("d");
            ghostFather = getActiveLayer().layer.group();

            ghost = getActiveLayer().layer.path(path).move(initX, initY).attr({"tool": true, fill: getActiveLayer().color});
            var relationAspect = ghost.width() / ghost.height();
            ghost.height(50);
            ghost.width(50 * relationAspect);

            ghostFather.add(ghost);
            ghostFather.add(getActiveLayer().layer
                    .text(type)
                    .center(ghost.cx(), ghost.cy() + ghost.height() * 0.6)
                    );

            console.log(ghost.cx(), ghost.cy());

            ghost.previousX = initX;
            ghost.previousY = initY;

//            testCircle = getActiveLayer().layer.circle(5).center(ghost.previousX,ghost.previousY);

            //set the distance between the group and the tool
            ghostFather.childDX = ghostFather.cx() - getElementFromGroup(ghostFather, 'path').cx();
            ghostFather.childDY = ghostFather.cy() - getElementFromGroup(ghostFather, 'path').cy();


        });

        mc.on("panmove", function (event) {
            currentPoint = {x: event.srcEvent.pageX, y: event.srcEvent.pageY};

//            console.log("Previous");
//            console.log(x,y);

            var x = currentPoint.x - $("#accordionSidebar").width() ;
            var y = currentPoint.y - 70 ;
            ghostFather.dmove(x- ghost.previousX, y- ghost.previousY);
            ghost.previousX = ghostFather.cx();
            ghost.previousY = ghostFather.cy();
            
            if (type === 'wall'){
                attributeLand = isClassedGraphics(getActiveLayer().layer.node,x,y,'toolable');
            }
            
        });

        mc.on("panend", function (ev) {
            currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};

//            console.log("Previous");
//            console.log(x,y);

            var x = currentPoint.x - $("#accordionSidebar").width() ;
            var y = currentPoint.y - 70 ;
            ghost.front();
            //        ghost.draggable();
            let mc = new Hammer(ghost.node);
            
            if (type==='wall'){
                if (attributeLand){
                    var attributeGraphics = getCrossedClassedGraphicObject(getActiveLayer().layer.node,x,y,'toolable');
                    attributeGraphics.attr({"stroke-dasharray":4,stroke:'red','stroke-width':3});
                    addBuilderWallsEvents(attributeGraphics);
                    blink(attributeGraphics);
                }
                ghostFather.remove();
            }

            addDragEvents(mc, ghostFather, ghost);
            addPressEvents(mc, ghost, getActiveLayer().layer, type);
            //        console.log(activeLayer);
            
            
        });
    }

}

function addBuilderWallsEvents(attributeGraphics){
    if (!attributeGraphics.hammer){
        attributeGraphics.hammer = new Hammer (attributeGraphics.node);
    }
        
    var hammer = attributeGraphics.hammer;

    
    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    
    hammer.on("panstart", function (event) {
        console.log("Wall to the top");
        var point = {x: event.srcEvent.pageX, y: event.srcEvent.pageY};
//tool.getBoundingClientRect().x;
        var initX = point.x - $("#accordionSidebar").width();
        var initY = point.y - 70;
    });
    
    
    let startingPoint = null;
    let currentPoint = null;
    let height = null;
    let segment2 = null;
    let line = null;
    let rect = null;
    let intersection = null;
    let touchCanvas = true;

    hammer.on("panstart", function (ev) {
        startingPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
    });

    hammer.on("panmove", function (ev) {
        count = count +1;
        currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
        height =  Math.abs(currentPoint.y - startingPoint.y);
        buildWall(attributeGraphics,7,height,'both');
        
    });
    
    
    hammer.on("panend", function (ev) {
        console.log(attributeGraphics);
       
    });
    hammer.on('panleft',function(event){
        console.log("Wall to the right");

    });
    
    hammer.on("panright", function (event) {
        console.log("Wall to the right");
    });
    
    hammer.on("panleft", function (event) {
        console.log("Wall to the left");
    });
    
    hammer.on("pandown", function (event) {
        console.log("Wall to the down");
    });
    
    hammer.on('panmove',function(event){
        console.log("moving");
    });
    
    hammer.on('panend',function(event){
        console.log("moving");
    });
    
//    hammer.on("swiperight", function (event) {
//        console.log("Wall to the right");
//    });
//    
//    hammer.on("swipeleft", function (event) {
//        console.log("Wall to the left");
//    });
//    
//    hammer.on("swipedown", function (event) {
//        console.log("Wall to the down");
//    });
    
}