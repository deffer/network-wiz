/**
 * Created by iben883 on 20/06/14.
 */
angular.module("datasource", []).factory("datasource", [function(){
	var service = {};

	service.getNodes = function(){
		var node1 = {
			"system": {
				"name": "EPR",
				"entities": [
					{
						"name": "identity",
						"topic": "nz.ac.auckland.jms.identity.person",
						"applications":  [
							{
								"name": "StudentAdminSubscribers",
								"status": "running",
								"version": "2.15",
								"subscribers": [{
									"name": "StudentAdminPerson",
									"context": "StudentAdminPerson",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/StudentAdmin/StudentAdminService"
								}
								]
							},
							{
								"name": "StudentAccommodationSubscribers",
								"status": "running",
								"version": "2.16",
								"subscribers": [{
									"name": "StudentAccommodationPerson",
									"context": "StudentAccommodationPerson",
									"endpoint": "https://ormadmpre01.pre.mw.auckland.ac.nz:8004/StudentAccommodation/StudentAccommodationService"
								}
								]
							},
							{
								"name": "FacultyOfEducationSubscribers",
								"status": "running",
								"version": "1.18",
								"subscribers": [
									{
										"name": "FedssPerson",
										"context": "FedssPerson",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/FacultyOfEducation/FedssService"
									}]
							},
							{
								"name": "HRSubscribers",
								"status": "stopped",
								"version": "1.8",
								"subscribers": [
									{
										"name": "HREmployee",
										"context": "HREmployee",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
									},
									{
										"name": "HRApplicant",
										"context": "HRApplicant",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
									},
									{
										"name": "UnresolvedVisitor",
										"context": "HREmployee",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
									}
								]
							}
						]
					}
				]
			}
		};

		var node2 = $.extend(true, {}, node1);
		node2.system.entities[0].applications[3].status='running';
		node2.system.entities[0].applications[0].status='running';
		node2.system.entities[0].applications[2].status='stopped';
		return [node1, node2];
	};

	service.colorMap = {1: 'blueviolet', 2: 'blueviolet', 3: "#F5A45D", 4: "#6FB1FC"};
	service.refreshColor = function(sourceNode, cy){
		var node = cy.getElementById(sourceNode.name);
		var color = sourceNode.status == "stopped"?"red":service.colorMap[node.data("serviceLevel")];
		node.data("faveColor", color);
	};

	service.refreshStatuses = function(cy, network){
		for(var cEntities = 0; cEntities < network.system.entities.length; cEntities ++) {
			var entity = network.system.entities[cEntities];
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

	service.generateGraph = function(myNodes, myEdges){
		var network = service.getNodes()[0];

		var column2 = 1;
		var column3 = 1;
		var column4 = 1;
		myNodes.push( {data: {id: 'system', weight: 75, faveColor: 'blueviolet', faveShape: 'octagon',
			 name: network.system.name, serviceLevel:1, serviceOrder:0}});
		for(var cEntities = 0; cEntities < network.system.entities.length; cEntities ++) {
			var entity = network.system.entities[cEntities];
			myNodes.push( {data: {id: entity.name, weight: 55, faveColor: 'blueviolet', faveShape: 'ellipse',
				name: entity.name, serviceLevel:2, serviceOrder:column2*10}});
			myEdges.push( { data: { source: 'system', target: entity.name, faveColor: 'blueviolet', strength: 90 } } );
			column2 = -column2;

			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				myNodes.push({data: {id: application.name, weight: 35+aCount, faveColor: application.status === 'stopped' ? 'red' : '#F5A45D',
					faveShape: 'rectangle', name: application.name, serviceLevel:3, serviceOrder:column3*10}});
				myEdges.push({ data: { source: entity.name, target: application.name, faveColor: '#F5A45D', strength: 90 }});
				column3 = -column3;

				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					myNodes.push({data: {id: subscriber.name, weight: 15+sCount*5, faveColor: '#6FB1FC',
						faveShape: 'triangle', name: subscriber.name, serviceLevel:4, serviceOrder:column4*10}});
					myEdges.push({ data: { source: application.name, target: subscriber.name, faveColor: '#6FB1FC', strength: 90 }});
					column4 = -column4;
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
					'color': 'data(faveColor)'
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
