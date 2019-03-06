$( function() {
  $( "#search-bar" ).autocomplete({
    //source: availableEntities,
    select: function( event, ui ) {
      console.log("Option selected");
    },
    close: function( event, ui ) {
      console.log("Run selection")
    }
  });
});


$( function() {
  $( "#search-bar").click(function(){
      $("#search-bar").val("");
    }
  )}) ;
