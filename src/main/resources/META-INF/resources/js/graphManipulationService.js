/**
 * Created by iben883 on 20/06/14.
 */
angular.module("graphManipulation", ["dataManipulation", "layoutsFactory"]).factory("graphManipulationService",
["dataManipulationService", "layoutsFactory", function(dms, layoutsFactory){
	var service = {};

	service.colorMap = {1: 'orange', 2: 'coral', 3: "olivedrab", 4: "cornflowerblue"};
	service.textColorMap = {1: 'darkorange', 2: 'chocolate', 3: 'darkolivegreen', 4: 'dodgerblue'};
	service.shapesMap = {1: 'ellipse', 2: 'roundrectangle', 3: 'roundrectangle', 4: 'ellipse'};
	service.colorMapByStatus = {'stopped': 'red', 'not running':'darkgrey', 'warning': 'red', 'unavailable':'darkgrey'};

	service.getColor = function (status, level, forText){
		var color = service.colorMapByStatus[status];

		if (!color){
			var map = forText? service.textColorMap : service.colorMap;
			color = map[level];
		}
		return color;
	};

	service.initNodeData = function(level, name, status, id){
		var nodeid = id ? id : name;

		var result = {id: nodeid, name: name,  serviceLevel:level,
			faveColor: service.getColor(status, level, false),
			faveShape: service.shapesMap[level],
			//faveShape: 'roundrectangle',
			textColor: service.getColor(status, level, true)};
		return result;
	};


	service.generateNodeData = function(level, entry, weight, order, parent){
		return $.extend(service.initNodeData(level, entry.name, entry.status, entry.id),
			{weight:weight, serviceOrder: order, customData: entry/*, parent: parent? parent.id : undefined*/});
	};

	service.refreshStatusIndication = function(sourceNode, node){
		node.data("customData", sourceNode);

		if (node.hasClass('highlighted')){
			node.removeClass('highlighted');
		}

		if (sourceNode.status == "warning"){
			node.data("faveColor", service.getColor(undefined, node.data("serviceLevel"), false));
			node.data("textColor", service.getColor(sourceNode.status, node.data("serviceLevel"), true));
			node.css('border-width', 3);
		}else{
			node.css('border-width', 1);
			node.data("textColor", service.getColor(sourceNode.status, node.data("serviceLevel"), true));
			if (sourceNode.status == "unavailable"){
				node.data("faveColor", service.getColor(sourceNode.status, node.data("serviceLevel"), false));
			}else {
				node.data("faveColor", service.getColor(undefined, node.data("serviceLevel"), false));
				if (!dms.statusIsGoodOrUndefined(sourceNode.status)) {
					node.addClass('highlighted');
				}
			}
		}
	};

	service.refreshNodes = function(cy, nodesCache){
		cy.nodes().each(function(i, node){
			var sourceNode = nodesCache[node.data("id")];
			if (!sourceNode)
				sourceNode = {id: node.id, status: "unavailable", name: 'unavailable'};
			service.refreshStatusIndication(sourceNode, node);
		});
	};

	service.generateGraph = function(system, myNodes, myEdges){
		var column2 = -20;
		var column3 = 0;
		var column4 = 0;
		system.status = "fixed";
		myNodes.push( {
			data: service.generateNodeData(1, system, 90, -30)/*,position: { x: 100, y: 100 },locked: true*/});
		for(var cEntities = 0; cEntities < system.entities.length; cEntities ++) {
			var entity = system.entities[cEntities];
			if (!entity.status) entity.status = "fixed";
			myNodes.push( {data: service.generateNodeData(2, entity, 35, column2, system)});
			myEdges.push( { data: { source: system.id, target: entity.id, faveColor: service.colorMap[2], weight: 10, strength: 90 } } );
			column2 =  column2==0 ? -20 : 0;

			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				myNodes.push({data: service.generateNodeData(3, application, 25, column3, entity)});
				myEdges.push({ data: { source: entity.id, target: application.id, faveColor: service.colorMap[3], weight: 20, strength: 90 }});
				column3 = column3==0 ? -20 : 0;

				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					myNodes.push({data: service.generateNodeData(4, subscriber, 15, column4, application)});
					myEdges.push({ data: { source: application.id, target: subscriber.id, faveColor: service.colorMap[4], weight:10, strength: 90 }});
					column4 = column4 ==0? -20 : 0;
				}
			}
		}
	};

	service.getGraphOptions = function(myNodes, myEdges, onReadyFunc, onLayoutReadyFunc, onLayoutStop){
		var result = {
			layout: layoutsFactory.getArborLayout(onLayoutReadyFunc, onLayoutStop),
			//layoutsFactory.getConcentricGraphLayout(onLayoutReadyFunc),
			//layoutsFactory.getBFLayout(onLayoutReadyFunc),
			//layoutsFactory.getCoSELayout(onLayoutReadyFunc, onLayoutStop),


			style: cytoscape.stylesheet()
				.selector('node')
				.css({
                    'font-size': 11,
					'font-weight': 'bold',
					'shape': 'data(faveShape)',
					'width': 'mapData(weight, 0, 100, 10, 60)',
					'height': 'mapData(weight, 0, 100, 10, 60)',
					'content': 'data(name)',
					'text-valign': 'bottom',
					'background-color': 'data(faveColor)',
					'border-color': 'data(textColor)',
					'border-width': 1,
					'color': 'data(textColor)'
				})
				.selector('.highlighted').css({
					'background-color': 'darkred',
					'color': 'darkred',
					'transition-property': 'background-color, color',
					'transition-duration': '0.5s'
				})
				.selector(':selected').css({
					'border-width': 2,
					'border-color': '#333'
				})
				.selector('edge').css({
					'opacity': 0.666,
					'width': 'mapData(strength, 1, 100, 2, 6)',
					'target-arrow-shape': 'triangle',
					//'source-arrow-shape': 'circle',
					'line-color': 'data(faveColor)',
					'source-arrow-color': 'data(faveColor)',
					'target-arrow-color': 'data(faveColor)'
				})
				.selector('edge.questionable').css({
					'line-style': 'dotted',
					'target-arrow-shape': 'diamond'
				})
				.selector('.faded').css({
					'opacity': 0.25,
					'text-opacity': 0
				}),

			elements: {
				nodes: myNodes,
				edges: myEdges
			},

			ready: onReadyFunc
		};

		return result;
	};

	service.generateTemplateGraph = function(systems){
		var myNodes = [];
		_.each(systems, function(system){
			myNodes.push( {data: service.generateNodeData(1, system.instances[0], 90, -30)});
		});
		return myNodes;
	};

	service.getTemplateGraphOptions = function(myNodes, onLayoutStop) {
		var result = {
			layout: layoutsFactory.getArborTemplateLayout(undefined, onLayoutStop),
			elements: { nodes: myNodes, edges: []},
			style: cytoscape.stylesheet()
				.selector('node').css({
					'font-size': 11,
					'font-weight': 'bold',
					'shape': 'data(faveShape)',
					'width': 'mapData(weight, 0, 100, 20, 60)',
					'height': 'mapData(weight, 0, 100, 20, 60)',
					'content': 'data(name)',
					'text-valign': 'bottom',
					'background-color': 'data(faveColor)',
					'border-color': 'data(textColor)',
					'border-width': 1,
					'color': 'data(textColor)'
				})
		};
		return result;
	};


	return service;
}]);
