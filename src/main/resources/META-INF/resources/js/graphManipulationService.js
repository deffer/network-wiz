/**
 * Created by iben883 on 20/06/14.
 */
angular.module("graphManipulation", ["dataManipulation"]).factory("graphManipulationService", ["dataManipulationService", function(dms){
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


	service.generateNodeData = function(level, entry, weight, order, id){
		return $.extend(service.initNodeData(level, entry.name, entry.status, id), {weight:weight, serviceOrder: order, customData: entry});
	};

	service.refreshStatusIndication = function(sourceNode, cy){
		var node = cy.getElementById(sourceNode.name);
		node.data("customData", sourceNode);

		if (sourceNode.status && sourceNode.status == "warning"){
			node.removeClass('highlighted');
			node.data("faveColor", service.getColor(undefined, node.data("serviceLevel"), false));
			node.data("textColor", service.getColor(sourceNode.status, node.data("serviceLevel"), true));
			node.css('border-width', 3);
		}else{
			if (dms.statusIsGoodOrUndefined(sourceNode.status)){
				node.removeClass('highlighted');
			}
			node.css('border-width', 1);
			node.data("faveColor", service.getColor(undefined, node.data("serviceLevel"), false));
			node.data("textColor", service.getColor(undefined, node.data("serviceLevel"), true));

			if (!dms.statusIsGoodOrUndefined(sourceNode.status)){
				node.addClass('highlighted');
			}
		}
	};

	service.refreshStatuses = function(cy, network){
		service.refreshStatusIndication(network, cy);
		for(var cEntities = 0; cEntities < network.entities.length; cEntities ++) {
			var entity = network.entities[cEntities];
			service.refreshStatusIndication(entity, cy);
			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				service.refreshStatusIndication(application, cy);
				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					service.refreshStatusIndication(subscriber, cy);
				}
			}
		}
	};

	service.generateGraph = function(system, myNodes, myEdges){
		var column2 = -20;
		var column3 = 0;
		var column4 = 0;
		system.status = "fixed";
		myNodes.push( {data: service.generateNodeData(1, system, 90, -30, system.name)});
		for(var cEntities = 0; cEntities < system.entities.length; cEntities ++) {
			var entity = system.entities[cEntities];
			if (!entity.status) entity.status = "fixed";
			myNodes.push( {data: service.generateNodeData(2, entity, 25, column2)});
			myEdges.push( { data: { source: system.name, target: entity.name, faveColor: service.colorMap[2], weight: 10, strength: 90 } } );
			column2 =  column2==0 ? -20 : 0;

			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				myNodes.push({data: service.generateNodeData(3, application, 35, column3)});
				myEdges.push({ data: { source: entity.name, target: application.name, faveColor: service.colorMap[3], weight: 20, strength: 90 }});
				column3 = column3==0 ? -20 : 0;

				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					myNodes.push({data: service.generateNodeData(4, subscriber, 15, column4)});
					myEdges.push({ data: { source: application.name, target: subscriber.name, faveColor: service.colorMap[4], weight:10, strength: 90 }});
					column4 = column4 ==0? -20 : 0;
				}
			}
		}
	};

	service.getGraphOptions = function(myNodes, myEdges, onReadyFunc, onLayoutReadyFunc){
		var result = {
			layout:
				//service.getConcentricGraphLayout(),
			//service.getBFLayout(),
			service.getArborGraphLayout(),
			//service.getCoSELayout(),


			style: cytoscape.stylesheet()
				.selector('node')
				.css({
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
					'source-arrow-shape': 'circle',
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

	service.getBFLayout = function(){
		return {
			name: 'breadthfirst',
			directed: true,
			circle: true,
			maximalAdjustments: 5,
			roots: '#EPR,#IDCards,#Voyager',

			ready:  function(){
				/*this.nodes().each(function(i, node){
					var vars = node.data("serviceOrder");
					var y = node.position('y');

					node.position('y', y + vars);
					//console.log("Setting position to "+ (y+ vars));
				});*/
				},
			stop: undefined, // callback on layoutstop
			fit: false, // reset viewport to fit default simulationBounds
			padding: 10, //[ 50, 50, 50, 50 ], // top, right, bottom, left
			position: function (node) {    // thats for grid layout
				var row = 0 + node.data("serviceOrder");
				var col = 0 + node.data("serviceLevel");
				console.log("For " + node.data("name") + "    " + row + ":" + col);
				return {col: col, row: row}
			}
		}
	};

	service.getConcentricGraphLayout = function(){
		return {
			name: 'concentric',
			maximalAdjustments: 5,

			ready: undefined,// onLayoutReadyFunc,
			stop: undefined, // callback on layoutstop
			fit: false, // reset viewport to fit default simulationBounds
			padding: 10, //[ 50, 50, 50, 50 ], // top, right, bottom, left
			concentric: function () { // returns numeric value for each node, placing higher nodes in levels towards the centre
				return 10 - this.data("serviceLevel");
			}
		}
	};

	service.getCoSELayout = function(){
		return {
			name: 'cose',
			fit : false
			/*refresh             : 0, // Number of iterations between consecutive screen positions update (0 -> only updated on the end)

			padding             : 10,
			randomize           : true, // Whether to randomize node positions on the beginning
			debug               : false,
			nodeRepulsion       : 10000, // Node repulsion (non overlapping) multiplier
			nodeOverlap         : 1, // Node repulsion (overlapping) multiplier
			idealEdgeLength     : 1, // Ideal edge (non nested) length
			edgeElasticity      : 200, // Divisor to compute edge forces
			nestingFactor       : 50, // Nesting factor (multiplier) to compute ideal edge length for nested edges
			gravity             : 50, // Gravity force (constant)
			numIter             : 20, // Maximum number of iterations to perform
			initialTemp         : 100, // Initial temperature (maximum node displacement)
			coolingFactor       : 0.95, // Cooling factor (how the temperature is reduced between consecutive iterations
			minTemp             : 1 // Lower temperature threshold (below this point the layout will end)*/
		}
	};

	service.getArborGraphLayout = function(){
		return {
			name: 'arbor',

			liveUpdate: true, // whether to show the layout as it's running
			ready: undefined, // callback on layoutready
			stop: undefined, // callback on layoutstop
			maxSimulationTime: 10000, // max length in ms to run the layout
			fit: true, // reset viewport to fit default simulationBounds
			padding: [ 100, 100, 100, 100 ], // top, right, bottom, left
			simulationBounds: undefined, // [x1, y1, x2, y2]; [0, 0, width, height] by default
			ungrabifyWhileSimulating: true, // so you can't drag nodes during layout

			// forces used by arbor (use arbor default on undefined)
			repulsion: 10000,
			stiffness: 700,
			friction: undefined,
			gravity: true,
			fps: undefined,
			precision: 150,

			// static numbers or functions that dynamically return what these
			// values should be for each element
			nodeMass: function(data){
				return 5-data.serviceLevel;
			},
			edgeLength: undefined,

			stepSize: 0.15, // size of timestep in simulation

			// function that returns true if the system is stable to indicate
			// that the layout can be stopped
			stableEnergy: function (energy) {
				var e = energy;
				return (e.max <= 0.5) || (e.mean <= 0.3);
			}
		}
	};

	return service;
}]);
