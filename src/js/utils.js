/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function getRandomBetween(min, max) {
    //Gets a random position
    return Math.random() * (max - min) + min;
}

function format_id(string){
    return string.replace(/\./g,' ').split(" ").join('');
}

function random_id() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 5);
};

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
