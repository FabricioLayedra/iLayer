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

function arrayRemove(arr, value) {
   return arr.filter(function(ele){
       return ele !== value;
   });
}

function scaleValue(oldmax,oldmin,newmax,newmin,oldvalue){
    var OldRange = (oldmax - oldmin); 
    var NewRange = (newmax - newmin); 
    return (((oldvalue - oldmin) * NewRange) / OldRange) + newmin;
}

function valuesDict(dictionary){
    return Object.keys(dictionary).map(function(key){
        return dictionary[key];
    });
}

function getMaxArray(array){
    return Math.max(...array);
}

function getMinArray(array){
    return Math.min(...array);
}

function getElementFromGroup(group,type){
    let children = group.children();
    for (var i = 0; i < children.length; i++){
        if (children[i].type === type){
            return children[i];
        }
    }
    return null;
}