var datafile = "https://raw.githubusercontent.com/FabricioLayedra/CiverseData/master/authors_relations_2016.json";


//----- List -----

var active_color = null;

var el = document.getElementById("layers-table");

var sortable = new Sortable(el,{

  onEnd: function (evt) {
    //get the actual order
    // run a for loop to render things
    var list = document.getElementById("layers-table").getElementsByTagName("li");

    for (var element of Array.prototype.slice.apply(list).reverse()){
       var layer = element.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input:nth-child(1)').getAttribute("value").toLowerCase().split(" ").join();
      // render the layers
      $(".set-canvases").prepend($(".canvas-"+layer).detach());
    }
}});


function reset_color(color) {

  $(".color-active").css("stroke",color);
  $(".color-active").removeClass("color-active");

  //svg.transition()
      //.duration(500)
      //.call(zoom.transform,d3.zoomIdentity);
}

function random_id() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 5);
};


function create_layer(){
    //Add a new layer
    var table = document.getElementById("layers-table");
    var template = document.getElementById('li-element').content.cloneNode(true);
    var id = random_id();
    change_layer_names(template,id);
    return template;
}

function change_layer_names(item,id){
    //Change this function is anything changes at the nav-item html template
    $(item.querySelector('div > div:nth-child(1) > div.col-sm-auto.pr-0 > input')).attr("layer",id);
    $(item.querySelector('div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("id","color-"+id);
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("id","p-"+id); 
    $(item.querySelector('div > div:nth-child(1) > div.col-8.my-auto > input')).attr("value","Layer " + id); 
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("data-target","#collapse-"+id);
    $(item.querySelector('div > div:nth-child(1) > div.col-2 > button')).attr("aria-controls","collapse-"+id);
    $(item.querySelector('div > div.row.collapse')).attr("id","collapse-"+id);
    $(item.querySelector('div > div.row.collapse > div > div.row > h6:nth-child(2)')).attr("id","opacity-"+id);
    $(item.querySelector('div > div.row.collapse > div > div.collapse-item.slidecontainer > input')).attr("id","range-"+id);
}

function add_item(){

    var id = random_id()[0];
    var t = random_id()[1];

    var layer_name = id.slice(1,id.length+1);

    console.log(random_id()[1]);

    var container = document.createElement("div")
    container.setAttribute("class","container");

    var col1 = document.createElement("div");
    col1.setAttribute("class","col-sm-auto pr-0");

    var row = document.createElement("div");
    row.setAttribute("class","row");

    var input = document.createElement("input");
    input.setAttribute("class","form-check-input my-auto");
    input.setAttribute("type","checkbox");
    input.setAttribute("checked","true");
    input.setAttribute("layer",layer_name);
    $(input).change(function(){
        var layer = "." + $(this).attr("layer");
        if (this.checked){
            d3.select(layer).style("opacity",1);
        }else{
            d3.select(layer).style("opacity",0);
        }
    });

    var col2 = document.createElement("div");
    col2.setAttribute("class","col-2-auto mr-1");
    col2.setAttribute("id",layer_name);
    //col2.css("width","5px!important");
    //col2.css("height","5px!important");

    var col3 = document.createElement("div");
    col3.setAttribute("class","col-8 my-auto");

    var p = document.createElement("p");
    p.setAttribute("class","text-white my-auto");
    p.setAttribute("id","p-"+layer_name);
    p.innerHTML = "Layer"+id;



    var col4 = document.createElement("div");
    col4.setAttribute("class","col-2");

    var button = document.createElement("button");
    button.setAttribute("class","btn btn-light-outline stop-drag");
    button.setAttribute("data-toggle","collapse");
    button.setAttribute("data-target","#collapse"+id);
    button.setAttribute('aria-expanded',"false");
    button.setAttribute('aria-controls',"collapse"+id);

    var icon = document.createElement("i");
    icon.setAttribute("class","fas fa-arrow-down");


    button.appendChild(icon);
    col4.appendChild(button);
    col3.appendChild(p);
    col1.appendChild(input);
    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    row.appendChild(col4);

    var div2 = document.createElement("div");
    div2.setAttribute("class","row collapse");
    div2.setAttribute("id","collapse_"+layer_name);

    var child_div_child2 = document.createElement("div");
    child_div_child2.setAttribute("class","bg-white py-2 collapse-inner rounded");

    var row2 = document.createElement("div");
    row2.setAttribute("class","row");

    var h6_1 = document.createElement("h6");
    h6_1.setAttribute("class","collapse-header");
    h6_1.innerHTML = "Opacity";

    var h6_2 = document.createElement("h6");
    h6_2.setAttribute("class","collapse-header");
    h6_2.setAttribute("id","opacity_"+layer_name);
    h6_2.innerHTML = "100";

    var box_child_div_child2 = document.createElement("div");
    box_child_div_child2.setAttribute("class","collapse-item slidecontainer");

    var input_box = document.createElement("input");
    input_box.setAttribute("type","range");
    input_box.setAttribute("class","slider");
    input_box.setAttribute("min","1");
    input_box.setAttribute("max","100");
    input_box.setAttribute("value","100");
    input_box.setAttribute("id","range"+id);

    $(input_box).on("input",function(){
        var layer_name = this.id.split("_")[1];
        $("#opacity_"+layer_name).html(this.value);
        d3.select(layer_name).attr("opacity",this.value/100);
    });

    box_child_div_child2.appendChild(input_box);

    row2.appendChild(h6_1);
    row2.appendChild(h6_2);
    child_div_child2.appendChild(row2);
    // child_div_child2.appendChild(box_child_div_child2);
    child_div_child2.appendChild(box_child_div_child2);
    div2.appendChild(child_div_child2);

    container.appendChild(row);
    container.appendChild(div2);


    var li = document.createElement("li");
    li.setAttribute('class','nav-item');
    li.appendChild(container);

    var ul = document.getElementById("layers-table");
    ul.appendChild(li);

    return [layer_name,d3.interpolateCool(t)];
};

function add_world(layer_name){
    console.log(layer_name);
}

$("#new-layer").click(function(){
    var layer = create_layer();
    var color = Math.floor(Math.random()*16777215).toString(16);
    $(layer.querySelector(' div > div:nth-child(1) > div.col-2-auto.mr-1')).attr("style","background-color:#"+color+"; height: auto; width: 5px"); 
    $("#layers-table").append(layer);
    
});

$(":checkbox").change(function(){
    //console.log(this);
    //console.log(this.checked)
    var layer = "#canvas-" + $(this).attr("layer").toLowerCase().split(" ");
    console.log(layer);
    if (this.checked){
        $(layer).css("display","block")
    }else{
        $(layer).css("display","none")
    }
    // else{
    //     // d3.selectAll(layer).style("opacity",0);
    // }
});



$("[type='range']").on("input",function(){
    var layer_name = this.id.split("_")[1];
    $("#opacity_"+layer_name).html(this.value);
    d3.selectAll("."+layer_name).style("opacity",this.value/100);


});

// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value;

// slider.oninput = function() {
//   output.innerHTML = this.value;
//   console.log(output.innerHTML);
  
//   console.log(sortable["options"]["disabled"]);


//   //update the opacity of the thing
// }


//  $("#layers-table").find("a").click(function(){
//     if (sortable["options"]["disabled"] === true){
//         sortable["options"]["disabled"] = false;
//     }else{
//         sortable["options"]["disabled"] = true;
//     }
// });

$(".stop-drag").click(function(){
    if (sortable["options"]["disabled"] === true){
        sortable["options"]["disabled"] = false;
    }else{
        sortable["options"]["disabled"] = true;
    }
});

$("p[id|='p']").click(function () {
  // body...
    console.log("clickeando");
    console.log("cambia color");


    let value = $(this).attr("id").split("-")[1];

    d3.selectAll("."+value).attr()
    // //$("."+value).css("box-shadow","10px 10px 5px red");
    // //$("."+value).css("stroke","10px 10px 5px red");
    // if (active_color=== value){
    //     //console.log("COLOR");
    //     //console.log(active_color);
    //     $("."+value).css("box-shadow","10px 10px 5px red");
    // }
    // console.log(this);
    // //   var value = evt.item.childNodes[1].innerText.trimRight().trimLeft().toLowerCase();

    // // console.log(value);
    // // reset_color(active_color);
    // active_color = $(this).attr("id").split("-")[1];
    // let color = "red";
    // console.log("COLOR");
    // console.log(active_color);
    // console.log(color);
    // if (color === active_color){
        

    //     console.log("IGUAL");
    // }
    
});

$("input[id|='p']").click(function () {
  // body...
    console.log("clickeando");
    console.log("cambia color");

    let value = $(this).attr("id").split("-")[1];
    let color = $("#color-"+value).css("background-color");
    if (d3.selectAll("."+value).attr("filter") != null){
        d3.selectAll("."+value).attr("filter",null);
    }else{
        d3.selectAll("."+value).attr("filter",function(d){return getFilter(color,value);});

    }
});

$("input[id|='p']").dblclick(function () {
  // body...
    console.log("Doble_Clickeando");
    // console.log();
    $(this).attr("previous-layer-name",$(this).val().toLowerCase());
    $(this).attr("readonly",false);
    // console.log(this);



});

$("input[id|='p']").on('keypress',function(e) {
    $(this).attr("readonly",true);
    d3.select("."+$(this).attr("previous-layer-name")).attr("class",className);

});
    // //$("."+value).css("box-shadow","10px 10px 5px red");
    // //$("."+value).css("stroke","10px 10px 5px red");

    // if (active_color=== value){
    //     //console.log("COLOR");
    //     //console.log(active_color);
    //     $("."+value).css("box-shadow","10px 10px 5px red");
    // }
    // console.log(this);
    // //   var value = evt.item.childNodes[1].innerText.trimRight().trimLeft().toLowerCase();

    // // console.log(value);
    // // reset_color(active_color);
    // active_color = $(this).attr("id").split("-")[1];
    // let color = "red";
    // console.log("COLOR");
    // console.log(active_color);
    // console.log(color);
    // if (color === active_color){
        

    //     console.log("IGUAL");
    // }
    



