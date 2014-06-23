/**
 * Created by iben883 on 20/06/14.
 */
angular.module("graphManipulation", []).factory("graphManipulationService", [function(){
	var service = {};

	service.colorMap = {1: 'lightcoral', 2: 'lightcoral', 3: "#F5A45D", 4: "#6FB1FC"};
	service.textColorMap = {1: 'darkcoral', 2: 'darkcoral', 3: "#F5A45D", 4: "#6FB1FC"};
	service.shapesMap = {1: 'octagon', 2: 'ellipse', 3: 'rectangle', 4: 'triangle'};
	service.colorMapByStatus = {'stopped': 'red', 'not running':'red', 'warning': 'darkred', 'unavailable':'grey'};

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
			textColor: service.getColor(status, level, true)};
		return result;
	};

	service.generateNodeData = function(level, name, status, weight, order, id){
		return $.extend(service.initNodeData(level, name, status, id), {weight:weight, serviceOrder: order});
	};

	service.refreshColor = function(sourceNode, cy){
		var node = cy.getElementById(sourceNode.name);

		node.data("faveColor", service.getColor(sourceNode.status, node.data("serviceLevel"), false));
		node.data("textColor", service.getColor(sourceNode.status, node.data("serviceLevel"), true));
	};

	service.refreshStatuses = function(cy, network){
		service.refreshColor(network, cy);
		for(var cEntities = 0; cEntities < network.entities.length; cEntities ++) {
			var entity = network.entities[cEntities];
			service.refreshColor(entity, cy);
			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				service.refreshColor(application, cy);
				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					service.refreshColor(subscriber, cy);
				}
			}
		}
	};

	service.generateGraph = function(network, myNodes, myEdges){
		var column2 = -20;
		var column3 = 0;
		var column4 = 0;
		myNodes.push( {data: service.generateNodeData(1, network.name, 'fixed', 75, -30, 'system')});
		for(var cEntities = 0; cEntities < network.entities.length; cEntities ++) {
			var entity = network.entities[cEntities];
			myNodes.push( {data: service.generateNodeData(2, entity.name, 'fixed', 55, column2)});
			myEdges.push( { data: { source: 'system', target: entity.name, faveColor: service.colorMap[2], strength: 90 } } );
			column2 =  column2==0 ? -20 : 0;

			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				myNodes.push({data: service.generateNodeData(3, application.name, application.status, 35+aCount, column3)});
				myEdges.push({ data: { source: entity.name, target: application.name, faveColor: service.colorMap[3], strength: 90 }});
				column3 = column3==0 ? -20 : 0;

				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					myNodes.push({data: service.generateNodeData(4, subscriber.name, subscriber.status, 15+sCount*5, column4)});
					myEdges.push({ data: { source: application.name, target: subscriber.name, faveColor: service.colorMap[4], strength: 90 }});
					column4 = column4 ==0? -20 : 0;
				}
			}
		}
	};

	service.getGraphOptions = function(myNodes, myEdges, onReadyFunc, onLayoutReadyFunc){
		var result = {
			layout:service.getBFLayout(onLayoutReadyFunc),
			//service.getArborGraphLayout(),


			style: cytoscape.stylesheet()
				.selector('node')
				.css({
//                        'font-size': 11,
					'shape': 'data(faveShape)',
					'width': 'mapData(weight, 10, 80, 20, 60)',
					'content': 'data(name)',
					'text-valign': 'bottom',
					'background-color': 'data(faveColor)',
					'color': 'data(textColor)'
				})
				.selector(':selected')
				.css({
					'border-width': 2,
					'border-color': '#333'
				})
				.selector('edge')
				.css({
					'opacity': 0.666,
					'width': 'mapData(strength, 1, 100, 2, 6)',
					'target-arrow-shape': 'triangle',
					'source-arrow-shape': 'circle',
					'line-color': 'data(faveColor)',
					'source-arrow-color': 'data(faveColor)',
					'target-arrow-color': 'data(faveColor)'
				})
				.selector('edge.questionable')
				.css({
					'line-style': 'dotted',
					'target-arrow-shape': 'diamond'
				})
				.selector('.faded')
				.css({
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

	service.getBFLayout = function(onLayoutReadyFunc){
		return {
			name: 'breadthfirst',
			directed: true,
			maximalAdjustments: 5,
			roots: '#system',

			ready: onLayoutReadyFunc,
			stop: undefined, // callback on layoutstop
			fit: false, // reset viewport to fit default simulationBounds
			padding: 10, //[ 50, 50, 50, 50 ], // top, right, bottom, left
			position: function (node) {
				var row = 0 + node.data("serviceOrder");
				var col = 0 + node.data("serviceLevel");
				console.log("For " + node.data("name") + "    " + row + ":" + col);
				return {col: col, row: row}
			},
			concentric: function () { // returns numeric value for each node, placing higher nodes in levels towards the centre
				return 10 - this.data("serviceLevel");
			}

		}
	};

	service.getConcentricGraphLayout = function(){
		return {
			name: 'concentric',
			directed: true,
			maximalAdjustments: 5,

			ready: undefined,// onLayoutReadyFunc,
			stop: undefined, // callback on layoutstop
			fit: false, // reset viewport to fit default simulationBounds
			padding: 10, //[ 50, 50, 50, 50 ], // top, right, bottom, left
			/*position: function (node) {
			 var row = 0 + node.data("serviceOrder");
			 var col = 0 + node.data("serviceLevel");
			 console.log("For " + node.data("name") + "    " + row + ":" + col);
			 return {col: col, row: row}
			 },*/
			concentric: function () { // returns numeric value for each node, placing higher nodes in levels towards the centre
				return 10 - this.data("serviceLevel");
			}
			//roots: '#system'
		}
	};

	service.getArborGraphLayout = function(){
		return {
			name: 'arbor',

			liveUpdate: true, // whether to show the layout as it's running
			ready: undefined, // callback on layoutready
			stop: undefined, // callback on layoutstop
			maxSimulationTime: 4000, // max length in ms to run the layout
			fit: true, // reset viewport to fit default simulationBounds
			padding: [ 50, 50, 50, 50 ], // top, right, bottom, left
			simulationBounds: undefined, // [x1, y1, x2, y2]; [0, 0, width, height] by default
			ungrabifyWhileSimulating: true, // so you can't drag nodes during layout

			// forces used by arbor (use arbor default on undefined)
			repulsion: undefined,
			stiffness: undefined,
			friction: undefined,
			gravity: true,
			fps: undefined,
			precision: undefined,

			// static numbers or functions that dynamically return what these
			// values should be for each element
			nodeMass: undefined,
			edgeLength: undefined,

			stepSize: 1, // size of timestep in simulation

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
