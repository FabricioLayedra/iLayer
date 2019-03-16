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
//  this.node.releasePointerCapture(e.pointerId);
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
        count+=1;
        console.log(count);
        updateEdgesEnds(this.children()[0],this.cx()-this.node.childDX,this.cy()-this.node.childDY);
        
//        this.node.childDY=this.node.childDY+y;

        
    }
}

function addTouchEvents(nodeParent){
//    var child = nodeParent.children()[0];
//    const slider = document.getElementById('slider');
//
//slider.onpointerdown = beginSliding;
//slider.onpointerup = stopSliding;
//    
    nodeParent.on('pointerdown', beginSliding);
    nodeParent.on('pointermove',slide);
    nodeParent.on('pointerup',stopSliding);
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
//
//function highlightActive(item){
//    
//}