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
    let duration = 100;
    let scale = 1.4;
    object.animate(duration).scale(scale, scale);
    setTimeout(function () {
        object.animate(duration).scale(1, 1);
    }, duration);
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
    console.log("position searched");
    console.log(x,y);
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