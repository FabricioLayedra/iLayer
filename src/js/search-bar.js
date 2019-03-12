function getAvailableEntities(filename){
    
    return $.getJSON(filename).done(function(json){
        // Creates a new directed graph
        var edges = json.links;
        var nodes = json.nodes;

        console.log(nodes);
//        nodes.forEach(function (data) {
//            g.setNode(format_id(data["id"]), {authorInfo: {name: data["id"], group:data["group"]}});
//        });
//
//        edges.forEach(function (data) {
//            //Load it data-drivenish (TO DO)
//            g.setEdge(format_id(data["source"]), format_id(data["target"]), {colabInfo: {value: data["value"],id: data["id"]}});
//        });

//        var color = "#"+ add_new_layer(layer_name);
//        drawGraph(LAYERS[layer_name].layer,g,layer_name);
//        var svg_id = $("#"+layer_name).children("svg").attr("id");
//        SVG.get(svg_id).select("circle").fill(color);
//        if (Object.keys(GRAPHS).includes(key)){
//            console.log( "Request Failed: " + "Data Already Loaded");
//        }else{
//            GRAPHS[key] = g;
//        }
    }).fail(function(jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
        return null;
    });
    
}

var availableEntities= []; 
function getAvailableEntities(filename){ 
    return $.getJSON(filename).done(function(json){ 
        // Creates a new directed graph 
        var edges = json.links; 
        var nodes = json.nodes; 
        for (var i = 0; i<nodes.length; i++){ 
            availableEntities.push(nodes[i].id);
        } 
     }).fail(
             function(jqxhr, textStatus, error ) { 
                 var err = textStatus + ", " + error; 
                 console.log( "Request Failed: " + err ); 
                 return null; 
             }
        ); 
}

getAvailableEntities(datafile).then(
        function(){ $( function() {
    $("#search-bar" ).autocomplete({
    source: availableEntities,
    select: function( event, ui ) {
        console.log(ui);
        console.log(ui.item.value);
        SVG.get(format_id(ui.item.value)).fill("red");

    },
    close: function( event, ui ) {
      console.log("Run selection")
    }
  });
});}); 




$( function() {
  $( "#search-bar").click(function(){
      $("#search-bar").val("");
    }
  )}) ;