/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function beginSliding(e) {
  this.node.allowed = true;
  this.node.dx = event.pageX-this.cx();
  this.node.dy = event.pageY-this.cy();
  // this sets the original distance between the group center and the circle center
  // it is just set the first time it is moved. Then it will be kept during the session
  if (!this.node.childDX){
      this.node.childDX = this.cx()-this.children()[0].cx();
  }
  if (!this.node.childDY){
      this.node.childDY = this.cy()-this.children()[0].cy();
  }
//  this.node.childDX = this.cx()-this.children()[0].cx();
//  this.node.childDY = this.cy()-this.children()[0].cy();
//  this.fire("pointermove",slide(e,this)e.log(this);

  this.node.setPointerCapture(e.pointerId);
}

function stopSliding(e) {
  this.node.allowed = null;

  count=0;
  this.node.releasePointerCapture(e.pointerId);
}

function slide(event) {
    
    if (this.node.allowed){

//        console.log(this.cx());
//        console.log(this.cy());
//        console.log(this.x());
//        console.log(this.y());
        let x = event.pageX-this.cx()-this.node.dx;
        let y = event.pageY-this.cy()-this.node.dy;
        this.dmove(x,y);
//        this.children()[0].dmove(x,y)
//        count+=1;
//        console.log(count);
        updateEdgesEnds(this.children()[0],this.cx()-this.node.childDX,this.cy()-this.node.childDY);
        
//        this.node.childDY=this.node.childDY+y;

        
    }
}

function highlight(event,node,show){
//    console.log(event);
    
    event.preventDefault();
//    console.log(node);
    var child = node.children()[0];
//    console.this.highlight.show());
//    console.log(child);
    if (show){
        child.highlight.show();

        child.nodeData.inEdges.forEach(function (inEdge) {
            inEdge.highlight.show();
        });

        child.nodeData.outEdges.forEach(function (outEdge) {
            outEdge.highlight.show();
        });
    }else{
        child.highlight.hide();

        child.nodeData.inEdges.forEach(function (inEdge) {
            inEdge.highlight.hide();
        });

        child.nodeData.outEdges.forEach(function (outEdge) {
            outEdge.highlight.hide();
        });
    }
    
}

function addTouchEvents(nodeParent){
    nodeParent.on('pointerdown',function(e){highlight(e,nodeParent,true)});    
    nodeParent.on('pointerdown',beginSliding);
    nodeParent.on('pointermove',slide);
    nodeParent.on('pointerup',stopSliding);
    nodeParent.on('pointerup',function(e){highlight(e,nodeParent,false)});
//    function(event){
//        console.log("ENTER");
//        console.log(this);
//        console.log(event.pageX,event.pageY);
//        nodeParent.dx = event.pageX-this.cx();
//        nodeParent.dy = event.pageY-this.cy();
//        console.log(this.cy()+event.pageY-event.pageY-this.cy())
////        event.preventDefault();
//        console.log(this);
//        nodeParent.original = [this.cx(),this.cy()];
//       
//        nodeParent.dx = event.pageX-this.cx();
//        nodeParent.dy = event.pageY-this.cy();
//        nodeParent.previousX = event.pageX;
//        nodeParent.previousY = event.pageY;
//            nodeParent.previousX = event.pageX-this.cx();
//            nodeParent.previousY = event.pageY-this.cy();
//            console.log(nodeParent.previousX,nodeParent.previousY)
//            console.log("INITIALIZE");
//            console.log(nodeParent);
//            console.log(this.cx() - nodeParent.dx);
//        console.log()
//                          console.log(this.cx() - nodeParent.dx);
//            console.log(nodeParent.dy);
//            console.log(this.cx());
//            console.log(this.cy());
//            console.log(event.pageX);
//            console.log(event.pageY);
//         detectInputType(event,"down");
//     });
//    
//    nodeParent.on('pointermove',function(event){
//        if (!nodeParent.dx){
//            console.log("move");
//            console.log(this);
//        }
        
        
//        event.preventDefault();
//            console.log(move);
//            var x = event.pageX-nodeParent.previousX;
//            var y = event.pageY-nodeParent.previousY;
//            console.log(event.pageX-this.cx()-nodeParent.previousX,event.pageY-this.cy()-nodeParent.previousY);

//            this.cx(event.pageX-this.cx())
//            this.cy(event.pageY-this.cy());
//            this.cy(this.cy()+y);

//                    console.log(event.pageX);

//            nodeParent.previousX = x;
//            nodeParent.previousY = y;

//        console.log("ON DRAG");
//        console.log(this);

//
//     });
//     
//     nodeParent.on('pointerup',function(event){
////        nodeParent.original = null;
////        nodeParent.dx = null;
////        nodeParent.dy =null;
//
//            nodeParent.previousX = null;
//            nodeParent.previousY = null;
////        console.log("ON UP");
////        console.log(this);
//     });


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
        console.log("hits an element?")
        verifier = layer.createSVGRect();
        verifier.x = startingPoint.x;
        verifier.y = startingPoint.y;
        verifier.width = 1;
        verifier.height = 1;
        let elements = layer.getIntersectionList(verifier,null);
        for (var i =0; i <elements.length; i++){
//                            console.log();

            
            if (elements[i].tagName  === "circle"){
//                console.log(elements[i]);
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
                }
            }
        });}
    });

    mc.on("panend", function (ev) {
        if (touchCanvas){
        line.remove();
    }else{
        touchCanvas = true;
    }
    });



}

