function defaultScatterplot(starterAttributes){

	//bottom and left axes
	let activeLayer = getActiveLayer();
    let drawer = getActiveLayer().layer;
    let leftZone = activeLayer.left;
    let bottomZone = activeLayer.bottom;
    let startingPoint = {x: 0, y: 0};

	var h_attributeName = starterAttributes.x;
	var v_attributeName = starterAttributes.y;
	var h_discrete = getActiveLayer().data[h_attributeName].discrete;
	var v_discrete = getActiveLayer().data[v_attributeName].discrete;

	//for x axis
	let h_group = drawer.group();
    let h_rect = null;
    let h_label = null;

    //for y axis
    let v_group = drawer.group();
    let v_rect = null;
    let v_label = null;
    
    //specifically for trashZone
    let trashRect = null;
    let trashIcon = null;

	//place both in position
	//draw axes
	//position

	//note that there will be an issue where things wont be undraggable without first opening up the database 

	//addDragEvents(mc, toolGraphics.parent(), toolGraphics, type);

	//addAttributesDraggingEvents($("#" + attribute)[0], attribute, true);

	
	h_label = drawer.text(h_attributeName).attr({
            fill: 'black',
            "text-anchor": "middle",
            "alignment-baseline": "hanging",
            "dominant-baseline": "middle",
            "font-size": "18px"
        }).move(startingPoint.x, startingPoint.y-10);

	h_rect = drawer.rect(Math.min(h_label.rbox().w + 10, 82), 30).attr({
            fill: '#d8d9df',
            rx: 5,
            ry: 5,
            stroke: "#858796",
            class: 'toolable proxy',
            value: h_attributeName,
            isDiscrete: h_discrete,
        }).center(startingPoint.x, startingPoint.y); 
	
	v_label = drawer.text(v_attributeName).attr({
            fill: 'black',
            "text-anchor": "middle",
            "alignment-baseline": "hanging",
            "dominant-baseline": "middle",
            "font-size": "18px"
        }).move(startingPoint.x, startingPoint.y-10);

	v_rect = drawer.rect(Math.min(v_label.rbox().w + 10, 82), 30).attr({
            fill: '#d8d9df',
            rx: 5,
            ry: 5,
            stroke: "#858796",
            class: 'toolable proxy',
            value: v_attributeName,
            isDiscrete: v_discrete,
        }).center(startingPoint.x, startingPoint.x); 

    h_rect.values = [];
    v_rect.values = [];

    
    h_group.add(h_rect);
    h_group.add(h_label);
    h_group.addClass('attr-' + h_attributeName); 

    v_group.add(v_rect);
    v_group.add(v_label);
    v_group.addClass('attr-' + v_attributeName); 


    let h_coords = {x: activeLayer.bottom.line.x(), y: activeLayer.bottom.rect.cy() - 25};
    let h_space = activeLayer.bottom.line.width();
    let h_line = activeLayer.bottom.line;
    h_rect.direction = 'horizontal';
    h_rect.discrete = getActiveLayer().data[h_attributeName].discrete;

    let v_coords = {x: activeLayer.left.line.cx(), y: activeLayer.left.rect.y()};
    let v_space = activeLayer.left.line.rbox().h;
    let v_line = activeLayer.left.line;
    v_rect.direction = 'vertical';
    v_rect.discrete = getActiveLayer().data[v_attributeName].discrete;

    addAttributeValues(h_attributeName, bottomZone, h_coords.x, h_coords.y, h_space, drawer, 'horizontal', h_rect, h_line);
    addAttributeValues(v_attributeName, leftZone, v_coords.x, v_coords.y, v_space, drawer, 'vertical', v_rect, v_line);

	let temp_h = {x: -startingPoint.x + activeLayer.bottom.line.x() + activeLayer.bottom.line.rbox().w + h_rect.rbox().w / 2 + 5, y: bottomZone.line.cy() - startingPoint.y};

	let temp_v = {x: -startingPoint.x + leftZone.rect.width(), y: -startingPoint.y + v_rect.height() / 2 + 5};

	h_group.move(temp_h.x, temp_h.y);
	v_group.move(temp_v.x, temp_v.y);


	bottomZone.line.animate(250).attr({opacity: 1});
	leftZone.line.animate(250).attr({opacity: 1});
	setVisibilityOfAttributeValues(bottomZone, 1, false);
	setVisibilityOfAttributeValues(leftZone, 1, false);

	bottomZone.hasAttribute = true;
	leftZone.hasAttribute = true;
    ACTIVEATTRIBUTES[h_group.node.id] = {'name': h_attributeName, 'group': h_group, 'occupantZone': bottomZone, madeAxis: true};
    ACTIVEATTRIBUTES[v_group.node.id] = {'name': v_attributeName, 'group': v_group, 'occupantZone': leftZone, madeAxis: true};

    addPressAttribute(new Hammer(h_group.node), h_group, h_rect, bottomZone, h_attributeName, 'horizontal');
    addPressAttribute(new Hammer(v_group.node), v_group, v_rect, leftZone, v_attributeName, 'vertical');
    console.log('added press attr');

    //one for each axis
    moveTemplateNodes({x: temp_h.x, y: temp_h.y}, false, true);
    moveTemplateNodes({x: temp_v.x, y: temp_v.y}, false, true);

    //position

}

function defaultBarChart(starterAttributes, gravityDirection){

	//bottom and left axes
	let activeLayer = getActiveLayer();
    let drawer = getActiveLayer().layer;
    let leftZone = activeLayer.left;
    let bottomZone = activeLayer.bottom;
    let startingPoint = {x: 0, y: 0};

	var h_attributeName = starterAttributes.x;
	var v_attributeName = starterAttributes.y;
    
    //specifically for trashZone
    let trashRect = null;
    let trashIcon = null;

    let gravityEnabled = gravityDirection;

	//place both in position
	//draw axes
	//position

	//note that there will be an issue where things wont be undraggable without first opening up the database 

	//addDragEvents(mc, toolGraphics.parent(), toolGraphics, type);

	//addAttributesDraggingEvents($("#" + attribute)[0], attribute, true);

	if (h_attributeName != null){
		
		var h_discrete = getActiveLayer().data[h_attributeName].discrete;
		//for x axis
		let h_group = drawer.group();
	    let h_rect = null;
	    let h_label = null;

		h_label = drawer.text(h_attributeName).attr({
            fill: 'black',
            "text-anchor": "middle",
            "alignment-baseline": "hanging",
            "dominant-baseline": "middle",
            "font-size": "18px"
        }).move(startingPoint.x, startingPoint.y-10);

		h_rect = drawer.rect(Math.min(h_label.rbox().w + 10, 82), 30).attr({
            fill: '#d8d9df',
            rx: 5,
            ry: 5,
            stroke: "#858796",
            class: 'toolable proxy',
            value: h_attributeName,
            isDiscrete: h_discrete,
        }).center(startingPoint.x, startingPoint.y); 

        h_rect.values = [];
        h_group.add(h_rect);
        h_group.add(h_label);
        h_group.addClass('attr-' + h_attributeName); 

        let h_coords = {x: activeLayer.bottom.line.x(), y: activeLayer.bottom.rect.cy() - 25};
        let h_space = activeLayer.bottom.line.width();
        let h_line = activeLayer.bottom.line;
        h_rect.direction = 'horizontal';
        h_rect.discrete = getActiveLayer().data[h_attributeName].discrete;
        addAttributeValues(h_attributeName, bottomZone, h_coords.x, h_coords.y, h_space, drawer, 'horizontal', h_rect, h_line);

        let temp_h = {x: -startingPoint.x + activeLayer.bottom.line.x() + activeLayer.bottom.line.rbox().w + h_rect.rbox().w / 2 + 5, y: bottomZone.line.cy() - startingPoint.y};
        h_group.move(temp_h.x, temp_h.y);

        bottomZone.line.animate(250).attr({opacity: 1});
        setVisibilityOfAttributeValues(bottomZone, 1, false);
        bottomZone.hasAttribute = true;
        ACTIVEATTRIBUTES[h_group.node.id] = {'name': h_attributeName, 'group': h_group, 'occupantZone': bottomZone, madeAxis: true};

        addPressAttribute(new Hammer(h_group.node), h_group, h_rect, bottomZone, h_attributeName, 'horizontal');

        moveTemplateNodes({x: temp_h.x, y: temp_h.y}, true, true);

        for (let i = 30; i < generalHeight; i+nodeRadius*2 + 10){
        	moveTemplateNodes({x: temp_h.x, y: i}, false, true);
        }
        //add 

        if (gravityEnabled == 'horizontal'){
        	;//addGravity();
	    }
	}

	if (v_attributeName != null){

		var v_discrete = getActiveLayer().data[v_attributeName].discrete;
	    //for y axis
	    let v_group = drawer.group();
	    let v_rect = null;
	    let v_label = null;

		v_label = drawer.text(v_attributeName).attr({
	            fill: 'black',
	            "text-anchor": "middle",
	            "alignment-baseline": "hanging",
	            "dominant-baseline": "middle",
	            "font-size": "18px"
	        }).move(startingPoint.x, startingPoint.y-10);

		v_rect = drawer.rect(Math.min(v_label.rbox().w + 10, 82), 30).attr({
	            fill: '#d8d9df',
	            rx: 5,
	            ry: 5,
	            stroke: "#858796",
	            class: 'toolable proxy',
	            value: v_attributeName,
	            isDiscrete: v_discrete,
	        }).center(startingPoint.x, startingPoint.x); 

		v_rect.values = [];
		v_group.add(v_rect);
		v_group.add(v_label);
		v_group.addClass('attr-' + v_attributeName);

	    let v_coords = {x: activeLayer.left.line.cx(), y: activeLayer.left.rect.y()};
	    let v_space = activeLayer.left.line.rbox().h;
	    let v_line = activeLayer.left.line;
	    v_rect.direction = 'vertical';
	    v_rect.discrete = getActiveLayer().data[v_attributeName].discrete;
	    addAttributeValues(v_attributeName, leftZone, v_coords.x, v_coords.y, v_space, drawer, 'vertical', v_rect, v_line);
		let temp_v = {x: -startingPoint.x + leftZone.rect.width(), y: -startingPoint.y + v_rect.height() / 2 + 5};
		v_group.move(temp_v.x, temp_v.y);
		
		leftZone.line.animate(250).attr({opacity: 1});
		setVisibilityOfAttributeValues(leftZone, 1, false);
		leftZone.hasAttribute = true;
	    ACTIVEATTRIBUTES[v_group.node.id] = {'name': v_attributeName, 'group': v_group, 'occupantZone': leftZone, madeAxis: true};

	    addPressAttribute(new Hammer(v_group.node), v_group, v_rect, leftZone, v_attributeName, 'vertical');
	    moveTemplateNodes({x: temp_v.x, y: temp_v.y}, false, true);
	    //addgravity in that direction

	    if (gravityEnabled == 'vertical'){
	    	addGravity();
	    }
	    

	}

	//add horizontal gravity
}

function moveTemplateNodes(coords, activateWall, activatePosition){

	let temp = coords;
	let attributeGraphics = getCrossedClassedGraphicObject(getActiveLayer().layer.node, temp.x, temp.y, 'toolable');

	let direction = attributeGraphics.direction;
	

	if (activateWall) {
	    applyWallStyle(attributeGraphics);
	    if ($(attributeGraphics.node).hasClass('proxy')) {
	        var labelsGraphics = attributeGraphics.values;
	        /*for (let index in h_labelsGraphics) {
	            let labelGraphic = h_labelsGraphics[index];
	            // IF ITS CONTINUOUS DATA THIS HAS TO CHANGE
	          // blink(labelGraphic);
	        }
	        console.log(h_attributeGraphics.width());*/

	        addBuilderWallsEvents(attributeGraphics, attributeGraphics.parent());
	        // TODO: build the wall here, right after the wall tool has been added to the proxy
	        // or to a single attribute value (that's perhaps in another if)

	        let height = (generalHeight - 80); //should be -
	        console.log(height);
	        let width = generalWidth;
	        let axis = null;
	        let wallSize = 1.1;
	        let insideSpace = nodeRadius+10;

	        if (direction === "horizontal") {
	        	axis = getActiveLayer().bottom;
	            let y = axis.line.cy();
	     

	            if ($(attributeGraphics.node).hasClass('proxy')) {
	                attributeGraphics.axis = axis;
	                var xProxy = attributeGraphics.rbox().cx;
	                buildWall(attributeGraphics, wallSize, height, [xProxy, y], 'both', insideSpace, direction, true);

	                for (var index in axis.valueLabels) {

	                    var x = axis.valueLabels[index].cx();
	                    console.log(x + " " + y);
	                    console.log(height);
	                    buildWall(axis.valueLabels[index], wallSize, height, [x, y], 'both', insideSpace, direction);
	                }
	            } 
	            else {
	                buildWall(attributeGraphics, wallSize, height, [attributeGraphics.cx(), y], 'both', insideSpace, direction);
	            }
	        } 
	        else if (direction === "vertical") {
	            axis = getActiveLayer().left;
	            let x = axis.line.cx();
	            var yProxy = attributeGraphics.rbox().cy - 70;

	            if ($(attributeGraphics.node).hasClass('proxy')) {
	                attributeGraphics.axis = axis;
	                buildWall(attributeGraphics, width, wallSize, [x, yProxy], 'both', insideSpace, direction, true);

	                //the proxy thing
	                for (var index in axis.valueLabels) {
	                    var y = axis.valueLabels[index].cy();
	                    //BOLD THE TEXT
	                    //boldText(axis.valueLabels[index]);
	                    buildWall(axis.valueLabels[index], width, wallSize, [x, y], 'both', insideSpace, direction);
	                }
	            } else {
	                buildWall(attributeGraphics, width, wallSize, [x, attributeGraphics.cy()], 'both', insideSpace, direction);
	            }
	        }


	        //initializeWalls(attributeGraphics, 1.1,nodeRadius+10,direction,'horizontal',getActiveLayer().bottom);

	    } 
	    else {
	        addBuilderWallsEvents(attributeGraphics, attributeGraphics);
	    }

	}

	if (activatePosition) {
	    if ($(attributeGraphics.node).hasClass('proxy')) {
	        var attributeTypeName = attributeGraphics.attr("value");
	        
	        if (attributeGraphics.discrete){
	            var labelsGraphics = attributeGraphics.values;
	            for (var index in labelsGraphics){
	                var labelGraphic = labelsGraphics[index];
	                var attributeValue = labelGraphic.node.textContent;
	                var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];
	                

	                if (direction === "horizontal"){
	                    var newPos = labelGraphic.rbox().cx;// - $("#accordionSidebar").width();
	                    currentNodes.forEach(function(element){
	                       var oldPos = element.rbox().cx - element.childDX;;// -$("#accordionSidebar").width();
	                       elementPos(element,newPos,oldPos,direction);
	                       element.spawnX = newPos;
	                       //console.log(newPos)
	                       //console.log(getElementFromGroup(element, 'circle'))

	                    })                                    
	                }
	                else if  (direction === "vertical"){
	                    if(attributeGraphics.isAxis){    
	                        if (clonationMode){                                           
	                            var newPosY = labelGraphic.rbox().cy-70;                                            
	                            var newPosX = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width();

	                            currentNodes.forEach(function(element){
	                                if (!element.cloned){
	                                    var clone =element.clone();
	                                    var oldPosY = element.rbox().cy -70-element.childDY;
	                                    var oldPosX = element.rbox().cx - element.childDX;;//$("#accordionSidebar").width();
	                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element);
	                                    clone.childDX = element.childDX;
	                                    clone.childDY = element.childDY;
	                                    clone.spawnX = newPosX;
	                                    clone.spawnY = newPosY;
	                                    element.cloned = clone; 

	                                }
	                               else{
	                                    var clone =element.cloned.clone();
	                                    var oldPosY = element.cloned.rbox().cy -70-element.cloned.childDY;
	                                    var oldPosX = element.cloned.rbox().cx - element.cloned.childDX; //$("#accordionSidebar").width()
	                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element.cloned);
	                                    clone.childDX = element.childDX;
	                                    clone.childDY = element.childDY;
	                                    clone.spawnX = newPosX;
	                                    clone.spawnY = newPosY;
	                                    element.cloned = clone; 
	                                    element.cloned = clone; 
	                               }
	                            });                                           
	                        }
	                        else{
	                            var newPos = labelGraphic.rbox().cy-70;
	                            currentNodes.forEach(function(element){
	                                //var clone =element.clone();
	                                var oldPos = element.rbox().cy -70-element.childDY;
	                                elementPos(element,newPos,oldPos,direction);
	                                element.spawnY = newPos;

	                            });

	                            var newPos = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width();
	                            currentNodes.forEach(function(element){
	                                var oldPos = element.rbox().cx - element.childDX;;//$("#accordionSidebar").width()-element.childDX;
	                                elementPos(element,newPos,oldPos,"horizontal");
	                                element.spawnX = newPos;
	                            });
	                        }
	                    }
	                    else{
	                        var newPos = labelGraphic.rbox().cy-70;
	                        currentNodes.forEach(function(element){
	                            var oldPos = element.rbox().cy -70-element.childDY;
	                            elementPos(element,newPos,oldPos,direction);
	                            element.spawnY = newPos;
	                        });
	                    }
	                }
	            }
	        }
	        

	        else{
	            console.log('landed on attribute')
	            var scaleData = attributeGraphics.values;
	            var uniqueAttributeValues =  Object.keys(getActiveLayer().data[attributeTypeName].values);

	            for (var index in uniqueAttributeValues){

	                var attributeValue = uniqueAttributeValues[index];                                
	                var newPos = interpolate(attributeValue,scaleData.min,scaleData.max,scaleData.minPos, scaleData.maxPos);
	                
	                var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];
	                //console.log(currentNodes);
	          
	                
	                if (direction === "horizontal"){            
	                    currentNodes.forEach(function(element){
	                       var oldPos = element.rbox().cx - element.childDX;;//-$("#accordionSidebar").width();
	                       elementPos(element,newPos,oldPos,direction);
	                       element.spawnX = newPos;
	                       //console.log(newPos)
	                       //console.log(element);
	                       //console.log(getElementFromGroup(element, 'circle'))

	                    })                                    
	                }
	                else if  (direction === "vertical"){

	                    if(attributeGraphics.isAxis){
	                        if (clonationMode){
	                            var newPosY = newPos;                                            
	                            var newPosX = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width()


	                            currentNodes.forEach(function(element){
	                                if (!element.cloned){
	                                    var clone =element.clone();

	                                    var oldPosY = element.rbox().cy -70-element.childDY;
	                                    //elementPos(clone,newPosY,oldPosY,direction);
	                                    var oldPosX = element.rbox().cx - element.childDX;//$("#accordionSidebar").width()-element.childDX;
	                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element);
	                                    clone.childDX = element.childDX;
	                                    clone.childDY = element.childDY;
	                                    clone.spawnX = newPosX;
	                                    clone.spawnY = newPosY;
	                                    element.cloned = clone; 

	                                }
	                                else{
	                                    var clone =element.cloned.clone();
	                                    var oldPosY = element.cloned.rbox().cy -70-element.cloned.childDY;
	                                    //elementPos(clone,newPosY,oldPosY,direction);
	                                    var oldPosX = element.cloned.rbox().cx - element.cloned.childDX;//$("#accordionSidebar").width()-element.cloned.childDX;
	                                    elementPosDrawingLine(clone,newPosX,oldPosX,newPosY,oldPosY,element.cloned);
	                                    clone.childDX = element.childDX;
	                                    clone.childDY = element.childDY;
	                                    clone.spawnX = newPosX;
	                                    clone.spawnY = newPosY;
	                                    element.cloned = clone; 
	                                    element.cloned = clone; 
	                                }
	                                   
	                            });
	                        }
	                        else{
	                            currentNodes.forEach(function(element){
	                                var oldPos = element.rbox().cy -70-element.childDY;
	                                elementPos(element,newPos,oldPos,direction);
	                                element.spawnY = newPos;
	                             });

	                            var newPos = attributeGraphics.rbox().cx;// -$("#accordionSidebar").width()
	                            currentNodes.forEach(function(element){
	                                var oldPos = element.rbox().cx - element.childDX;//-$("#accordionSidebar").width();
	                                elementPos(element,newPos,oldPos,"horizontal");
	                                element.spawnX = newPos;
	                            });
	                        }

	                    }
	                    else{
	                        currentNodes.forEach(function(element){
	                            var oldPos = element.rbox().cy -70-element.childDY;
	                            elementPos(element,newPos,oldPos,direction);
	                            element.spawnY = newPos;
	                        })
	                    }
	                }
	            }
	        }
	            
	           
	    }
	    //addBuilderWallsEvents(attributeGraphics,attributeGraphics.parent());
	    else {
	        var attributeTypeName = attributeGraphics.attr("attrType");
	        var attributeValue = attributeGraphics.node.textContent;
	        var currentNodes = getActiveLayer().data[attributeTypeName].values[attributeValue];
	        console.log(currentNodes);

	        //console.log(attributeGraphics.discrete);
	        if (attributeGraphics.attr('attrDiscrete')){
	            if (direction === "horizontal"){   
	                var newPos = attributeGraphics.rbox().cx;// - $("#accordionSidebar").width();
	                currentNodes.forEach(function(element){
	                   var oldPos = element.rbox().cx - element.childDX;//$("#accordionSidebar").width();
	                   elementPos(element,newPos,oldPos,direction);
	                   element.spawnX = newPos;
	                })                                    
	            }
	            else if  (direction === "vertical"){
	                var newPos = attributeGraphics.rbox().cy-70;
	                currentNodes.forEach(function(element){
	                   var oldPos = element.rbox().cy -70-element.childDY;
	                   elementPos(element,newPos,oldPos,direction);
	                   element.spawnY = newPos;
	                })
	            }
	        }
	        else{
	            // for defining
	        }
	    }



	}

	console.log(getActiveLayer().data[attributeGraphics.attr("value")])

}

function addGravity(dir){
	;
}

function resetDefaultPosition(){
	//let attributeGraphics = getActiveLayer().layer.node;
	let currentNodes = getActiveLayer().layer.select('g.node').members;

	currentNodes.forEach(function (element){
		elementPos(element, element.spawnX, element.rbox().cx, 'horizontal');
		elementPos(element, element.spawnY, element.rbox().cy - 70, 'vertical');
	})


}