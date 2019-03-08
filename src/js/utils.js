/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function getRandomBetween(min, max) {
    //Gets a random position
    return Math.random() * (max - min) + min;
}

function addMouseEvents(object) {
    object.mousedown(function(){
        object.mousedown = true;  
    });
    
    object.mousemove(function(){  
        console.log(object);
        if (!object.mousedown)
            return;
//        var pointer = canvas.getPointer(options.e);
//        Body.translate(object.matter, {
//            x: (pointer.x - object.matter.position.x) * 0.25,
//            y: (pointer.y - object.matter.position.y) * 0.25
//        });
    });
    
    object.mouseup(function(){
        object.mousedown = false;
    });
}

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