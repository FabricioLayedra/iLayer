/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function getRandomBetween(min, max) {
    //Gets a random position
    return Math.random() * (max - min) + min;
}

function format_id(string) {
    return string.replace(/\./g, ' ').split(" ").join('');
}

function random_id() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 5);
}
;

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele !== value;
    });
}

function scaleValue(oldmax, oldmin, newmax, newmin, oldvalue) {
    var OldRange = (oldmax - oldmin);
    var NewRange = (newmax - newmin);
    return (((oldvalue - oldmin) * NewRange) / OldRange) + newmin;
}

function valuesDict(dictionary) {
    return Object.keys(dictionary).map(function (key) {
        return dictionary[key];
    });
}

function getMaxArray(array) {
    return Math.max(...array);
}

function getMinArray(array) {
    return Math.min(...array);
}

function getElementFromGroup(group, type) {

    try {
        var children = group.children();

        for (var i = 0; i < children.length; i++) {
            if (children[i].type === type) {
                return children[i];
            }
        }
        return null;
    } catch (err) {
        return null;
    }
}

function getRectMiddle(rect) {
    return [rect.x() + rect.width() / 2, rect.y() + rect.height() / 2];
}

function toFirstCapital(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function blink(object) {
    let duration = 150;
    let scale = 1.1;
    object.animate(duration).scale(scale, scale);
    setTimeout(function () {
        object.animate(duration).scale(1, 1);
    }, duration);
}

function glow(object){
    let duration = 150;
    let scale = 1.1;

    /*window.setInterval(function() {  
        object.toggleClass('active');
    }, 1000);*/

    


}

function disableGlow(object){//, interval){
    let scale = 1;
    object.scale(scale, scale);
    object.removeClass('active');
    //window.clearInterval(interval)
}

function toggleAttributesButtons(dataKeys){
    $("#database").on('click', function (e) {


        if ($('#file').css('display') !== 'none'){
            $('#file').slideUp('fast', function(){
                
                $('.attributeTool').css({display: 'block', visibility: 0});
                for (var index in dataKeys){
                    drawLineFromDatabase($('#' + dataKeys[index].toString()));
                        }

               //actSlide();
                        //is currently called 3x for each button, but that is ok
                        /*for (var index in dataKeys){
                            drawLineFromDatabase($('#' + dataKeys[index].toString()), index);
                        }
                        $('.database_line').slideDown('fast');*/


                });
             $('.attributeTool').slideDown('slow')//, function(){
                 

                 
            //});
        }


        /*else if ($('#file').css('display') === 'none'){
            $('.attributeTool').slideToggle('fast', function(){
                $('#file').slideToggle('slow');
            });
        }*/
        
    });
}

function showPanel(id) {
    var theElement = $('#' + id);
    var duration = 400;
    var easing = 'easeOutSine';
    theElement.show({
        duration: duration,
        easing: easing
    });
}

function hidePanel(id) {
    var theElement = $('#' + id);
    var duration = 400;
    var easing = 'easeOutSine';
    theElement.hide({
        duration: duration,
        easing: easing
    });
}

function removeWithAnimation(object) {
    let duration = 300;
    object.animate(duration, '<>').scale(0, 0);
    setTimeout(function () {
        object.remove();
    }, duration);
}

function isFreePoint(layer,x,y){
    var  verifier = layer.createSVGRect();
    verifier.x = x;
    verifier.y = y;
    verifier.width = 1;
    verifier.height = 1;

    let elements = layer.getIntersectionList(verifier, null);
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].tagName === "rect" || elements[i].tagName === "g" || elements[i].tagName === "circle" || $(elements[i]).attr("tool")) {
            console.log("Current element");
            console.log(elements[i].class);
            return false;
        }
    }
    return true;
}

function isClassedGraphics(layerNode,x,y,className){
    var  verifier = layerNode.createSVGRect();
    verifier.x = x;
    verifier.y = y;
    verifier.width = 1;
    verifier.height = 1;
//    console.log("position searched");
//    console.log(x,y);
    let elements = layerNode.getIntersectionList(verifier, null);
    for (var i = 0; i < elements.length; i++) {
//        console.log(elements[i]);
        if ($(elements[i]).hasClass(className)) {
            
            return true;
        }
    }
    return false;
}

function getCrossedClassedGraphicObject(layerNode,x,y,className){
    var  verifier = layerNode.createSVGRect();
    verifier.x = x;
    verifier.y = y;
    verifier.width = 1;
    verifier.height = 1;
    console.log("position searched");
    console.log(x,y);
    let elements = layerNode.getIntersectionList(verifier, null);
    for (var i = 0; i < elements.length; i++) {
//        console.log(elements[i]);
        if ($(elements[i]).hasClass(className)) {
           
            return SVG.get(elements[i].id);
        }
    }
    return null;
}

function lightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255)
        r = 255;
    else if (r < 0)
        r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255)
        b = 255;
    else if (b < 0)
        b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255)
        g = 255;
    else if (g < 0)
        g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}


function highlightBackground(object,color){
    let duration = 100;
    console.log("PAINTING");
    object.animate(duration).fill(lightenDarkenColor(color,-10));
    setTimeout(function () {
        object.animate(duration).fill(color);
    }, duration);
}

function interpolate(value, originalMin, originalMax, newMin, newMax) {
    var oldRange = (originalMax - originalMin);
    var newRange = (newMax - newMin);
    var newValue = (((value - originalMin) * newRange) / oldRange) + newMin;
    if (isNaN(newValue)) { // true when the oldRange is zero (i.e., when the oldMax and oldMin are equal)
        newValue = value;
    }
    return newValue;
}

function isNumericArray(array){
    for (var index in array){
        if (isNaN(array[index])){
            return false;
        }
    }
    return true;
}

function boldText(textGraphics){
    textGraphics.attr({'font-weight':'bold'});
}

function unBoldText(textGraphics){
    textGraphics.attr({'font-weight':'normal'});
}


function getElementFromGroupByPropertyValue(group, property,value) {

    try {
        var children = group.children();

        for (var i = 0; i < children.length; i++) {
            if (children[i][property] === value) {
                return children[i];
            }
        }
        return null;
    } catch (err) {
        return null;
    }
}

function elementPos(element,newPos,oldPos,orientation){
    
    let point = newPos - oldPos;

//                                        console.log(getElementFromGroupByPropertyValue(element,'type','circle').node.id);
    if (orientation === "horizontal"){
    //    console.log(pointX);

        element.animate(500).dx(point).during(function (pos, morph, eased, situation) {

            let currentX = interpolate(pos, 0, 1, oldPos,newPos);

    //        console.log("Updating edges...");
            updateEdgesEnds(getElementFromGroupByPropertyValue(element,'type','circle'), currentX);
        });
    }else{
    //    console.log(pointX);

        element.animate(500).dy(point).during(function (pos, morph, eased, situation) {

            let currentY = interpolate(pos, 0, 1, oldPos,newPos);

    //        console.log("Updating edges...");
            updateEdgesEnds(getElementFromGroupByPropertyValue(element,'type','circle'),null, currentY);
        });
    }
}

function elementPosDrawingLine(element,newPosX,oldPosX,newPosY,oldPosY,previous){
    
        let pointX = newPosX - oldPosX;
        let pointY = newPosY - oldPosY;

//                                        console.log(getElementFromGroupByPropertyValue(element,'type','circle').node.id);
//    if (orientation === "horizontal"){
    //    console.log(pointX);
        
        let drawer = getActiveLayer().layer;
        let previousCircle = {x:previous.cx()-previous.childDX,y:previous.cy()-previous.childDY};
        let lineAttributes = {stroke:getActiveLayer().color,"stroke-width":3.5};
//            ,opacity:0.8};
            
        let line = drawer.line(previousCircle.x,previousCircle.y,previousCircle.x,previousCircle.y).attr(lineAttributes);
//        console.log(line);
        
//        element.attr("opacity":0.8)
        
        element.animate(500).dmove(pointX,pointY).during(function (pos, morph, eased, situation) {
//            console.log(pos);
            let currentX = interpolate(pos, 0, 1, oldPosX,newPosX);
            let currentY = interpolate(pos, 0, 1, oldPosY,newPosY);
//            console.log(currentX,currentY);
            line.attr("x2", currentX);
            line.attr("y2", currentY);

//            console.log(line);
    //        console.log("Updating edges...");
    //       
//            updateEdgesEnds(getElementFromGroupByPropertyValue(element,'type','circle'), currentX);
        });
//    }else{
    //    console.log(pointX);

//        element.animate(500).dy(point).during(function (pos, morph, eased, situation) {

//            let currentY = interpolate(pos, 0, 1, oldPos,newPos);

    //        console.log("Updating edges...");
//            updateEdgesEnds(getElementFromGroupByPropertyValue(element,'type','circle'),null, currentY);
//        });
//    }
}



var edgesHidden = false;

function showHideEdges(){
    console.log(edgesHidden)

    //make this global because currently all edges are still registered as part of layer 1
    if (!edgesHidden){
        getActiveLayer().layer.select('g.edge').attr({"opacity":0});
        edgesHidden = true;
    }else{
        getActiveLayer().layer.select('g.edge').attr({"opacity":1});
        edgesHidden = false;
    }
}

var globalLabelsHidden = false;

function showHideLabels(){
    if (!globalLabelsHidden){
        getActiveLayer().layer.select('text.node-label').attr({"opacity":0});
        globalLabelsHidden = true;
    }else{
        getActiveLayer().layer.select('text.node-label').attr({"opacity":1});
        globalLabelsHidden = false;
    }
}

//to hide an individual layer's attributes
//is totally bonked
// function showHideLabels(layerName){
//     var layer = "#layer-" + layerName;
//     console.log($(layer).labelIsHidden);
//     if (!labelIsHidden){
//         getActiveLayer().layer.select('text.node-label').attr({"opacity":0});
//         labelIsHidden = true;
//     }else{
//         getActiveLayer().layer.select('text.node-label').attr({"opacity":1});
//         labelIsHidden = false;
//     }
// }