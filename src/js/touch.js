/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function beginSliding(e) {
  this.node.allowed = true;
  this.node.dx = event.pageX-this.cx();
  this.node.dy = event.pageY-this.cy();

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
    }
}

function highlight(event,node,show){
    event.preventDefault();
    var child = getElementFromGroup(node,'circle');
    if (show){
        showHighlight(child);
    }else{
        hideHighlight(child);
    }   
}

function showHighlight(child){
    child.highlight.show();

    child.nodeData.inEdges.forEach(function (inEdge) {
        inEdge.highlight.show();
    });

    child.nodeData.outEdges.forEach(function (outEdge) {
        outEdge.highlight.show();
    });
}

function hideHighlight(child){
    child.highlight.hide();

    child.nodeData.inEdges.forEach(function (inEdge) {
        inEdge.highlight.hide();
    });

    child.nodeData.outEdges.forEach(function (outEdge) {
        outEdge.highlight.hide();
    });
}

function addTouchEvents(nodeParent){
    nodeParent.on('pointerdown',function(e){highlight(e,nodeParent,true)});    
    nodeParent.on('pointerdown',beginSliding);
    nodeParent.on('pointermove',slide);
    nodeParent.on('pointerup',stopSliding);
    nodeParent.on('pointerup',function(e){highlight(e,nodeParent,false)});
//    nodeParent.on('pointerenter',function(){console.log("Data enter")});
//    nodeParent.on('pointerleave',function(){console.log("Data leave")});

}

function removeTouchEvents(nodeParent){
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
    let verifier = null;
    let touchCanvas = true;

    mc.on("panstart", function (ev) {

        startingPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
        rect = layer.createSVGRect();
        rect.x = startingPoint.x;
        rect.y = startingPoint.y;
//        console.log("hits an element?")
        verifier = layer.createSVGRect();
        verifier.x = startingPoint.x;
        verifier.y = startingPoint.y;
        verifier.width = 1;
        verifier.height = 1;
        let elements = layer.getIntersectionList(verifier,null);
        for (var i =0; i <elements.length; i++){
            if (elements[i].tagName  === "circle" || $(elements[i]).attr("tool")){
                touchCanvas = false ;
                break;
            }
        }
        
        
        if (touchCanvas){
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
        if (touchCanvas){
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
                }else if(edge.type === "circle"){
                    console.log(edge);
                    let direction = line.attr("x2")-line.attr("x1");
                    if (direction > 0){
                        console.log(direction);
                        
                        console.log("GOING DOWN");
                    }else if (direction <0){
                        console.log(direction);
                        console.log("GOING UP");
                    }
                }
            });
        }
    });

    mc.on("panend", function (ev) {
        if (touchCanvas){
            
            
            
//            let list = layer.getIntersectionList(rect, null);
//        console.log(layer);
//        console.log(list);
// this needs to be upgraded too something more efficient.            
            SVG.select('g').members.forEach(
                function(n){
                    let children = n.node.children;
                    for (var k =0; k<children.length; k++){
                        let element = SVG.get(children[k].id);
                        if (element.highlight){
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
    }else{
        touchCanvas = true;
    }
    });



}

function nodeInSelection(nodeParent){
    for (var i = 0; i<SELECTION.length; i++){
        if(SELECTION[i]===nodeParent){
            return true;
        }
    }
    return false;
}

function addNodeToSelection(group){
    if (!nodeInSelection(group)){
        var circle = getElementFromGroup(group,'circle');
        hideHighlight(circle);
        circle.animate(100).attr({"r":circle.attr("r")+10});
        circle.animate(100).attr({"r":circle.attr("r")});
        var halo = drawHaloInCircle(getActiveLayer().layer,circle,5,getActiveLayer().color);
        group.add(halo);
        halo.back();
        SELECTION.push(group);
    }else{
        getElementFromGroup(group,'path').remove();
    }
}

function selectionMode(mode){
    if (mode){        
        var groups = getActiveLayer().layer.select('g.node').members;
        for (var index in groups){
            let group = groups[index];   
            removeTouchEvents(group);
            group.on('pointerdown',function(){
                addNodeToSelection(group);
            });
        }  
        selectionFlag = mode;
    }else{
        var groups = getActiveLayer().layer.select('g.node').members;
        for (var index in groups){
            let group = groups[index];   
            group.off('pointerdown');
        }
        selectionFlag = mode;
    }
}

function addSelectionEvents(nodeParent){
    var mc = new Hammer(nodeParent.node);
    var layerName = nodeParent.parent().node.id.split("layer-")[1];
    var draw = LAYERS[layerName].layer;
    var color = LAYERS[layerName].color;

    nodeParent.node.hammer = mc;
    
    mc.get('press').set({time:300});
    
    mc.on('press',function(event){
        addNodeToSelection(nodeParent);
    });
    
    mc.on('pressup',function(event){
        selectionMode(true);
    });
}
function addPressEvents(mc,toolGraphics,drawer) {

    mc.get('press').set({time: 300});
    mc.on('press', function(event) {
        event.preventDefault();
        $(event.target).attr('oncontextmenu', 'return false');
        mc.off('panmove');
        
        let line = null;
        let startingPoint = null;
        let currentPoint = null;

        mc.on("panstart", function (ev) {
            startingPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
            line = drawer.line(startingPoint.x, startingPoint.y, startingPoint.x, startingPoint.y)
                    .stroke({color: '#f06', width: 1, linecap: 'round'})
                    .attr({'stroke-dasharray': [8, 3], stroke: 'red'});
        });

        mc.on("panmove", function (ev) {
            currentPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
            line.attr("x2", currentPoint.x);
            line.attr("y2", currentPoint.y);
            line.stroke({color: '#f06000', width: 1, linecap: 'round'});
            //CHANGE GRAVITY HERE
            var x = line.attr("x2")-line.attr("x1");
            var y = line.attr("y2")-line.attr("y1");
            var x2 = Math.pow(Math.abs(x),2);
            var y2 = Math.pow(Math.abs(y),2);
            var magnitude = Math.sqrt(x2+y2);
//            console.log(x/magnitude,y/magnitude,magnitude);
            addGravity(activatePhysics(getActiveLayer().layer.node.id),x/magnitude,y/magnitude,magnitude);

        });

        mc.on("panend", function (ev) {
            line.remove();
            mc.off('panstart');
            mc.off('panmove');
            mc.off('panend');
            addDragEvents(mc,toolGraphics);

        });
    });
    mc.on('pressup',function(event) {
        mc.off('panstart');
        mc.off('panmove');
        mc.off('panend');

        addDragEvents(mc,toolGraphics);
    });
    
}

function moveElements(ev, nodeGraphics){
    let currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
//        console.log(ghost.cx(),ghost.cy());
    nodeGraphics.center(currentPoint.x-$("#accordionSidebar").width(),currentPoint.y-70);
}

function addDragEvents(hammer,toolGraphics){

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    
    

//    mc.on("panstart", function (ev) {
//
//        startingPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
//        
//        console.log(startingPoint.x,startingPoint.y);
////        console.log(startingPoint);
//        path = $($(tool).children()[0]).children()[0].getAttribute("d"); 
//        ghost = drawer.path(path).center(-20,-20).attr({"tool":true});
////        ghost.draggable();
//        let relationAspect = ghost.width()/ghost.height();
//        ghost.height(25);
//        ghost.width(25*relationAspect)
//
////        ghost = drawer.circle(5).center(-startingPoint.x,-startingPoint.y);
//        
//    });

    hammer.on("panmove", function (ev) {
        moveElements(ev,toolGraphics);
    });

//    mc.on("panend", function (ev) {
//        ghost.front();
//        ghost.draggable();
//        console.log(ghost);
//        addPressEvents(ghost.node,ghost);
////        console.log(activeLayer);
//    });
}
function getActiveLayer(){
    return activeLayer;
}

function addToolEvents(tool) {
    let mc = new Hammer(tool);

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    mc.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 5});
    
    let startingPoint = null;
    let currentPoint = null;
    let path = null;
    let ghost = null;
    
    

    mc.on("panstart", function (ev) {

        startingPoint = {x: ev.srcEvent.offsetX, y: ev.srcEvent.offsetY};
        
        console.log(startingPoint.x,startingPoint.y);
//        console.log(startingPoint);
        path = $($(tool).children()[0]).children()[0].getAttribute("d"); 
        ghost = getActiveLayer().layer.path(path).center(-20,-20).attr({"tool":true});
//        ghost.draggable();
        let relationAspect = ghost.width()/ghost.height();
        ghost.height(50);
        ghost.width(50*relationAspect);

//        ghost = drawer.circle(5).center(-startingPoint.x,-startingPoint.y);
        
    });

    mc.on("panmove", function (ev) {
        currentPoint = {x: ev.srcEvent.pageX, y: ev.srcEvent.pageY};
        console.log(ghost.cx(),ghost.cy());
        ghost.center(currentPoint.x-$("#accordionSidebar").width(),currentPoint.y-70);

    });

    mc.on("panend", function (ev) {
        ghost.front();
//        ghost.draggable();
        let mc = new Hammer(ghost.node);

        addDragEvents(mc,ghost);
        console.log(ghost);

        addPressEvents(mc,ghost,getActiveLayer().layer);
//        console.log(activeLayer);
    });

}


