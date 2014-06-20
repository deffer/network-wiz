/**
 * Created by iben883 on 20/06/14.
 */
angular.module("datasource", []).factory("datasource", [function(){
	var service = {};

	service.getNode = function(){
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

		//  var newObject = jQuery.extend(true, {}, oldObject);
		return node1;
	};

	service.generateGraph = function(myNodes, myEdges){
		var network = service.getNode();

		myNodes.push( {data: {id: 'system', weight: 75, faveColor: '#86B342', faveShape: 'octagon', 'font-size': 11, name: network.system.name}});
		for(var cEntities = 0; cEntities < network.system.entities.length; cEntities ++) {
			var entity = network.system.entities[cEntities];
			myNodes.push( {data: {id: entity.name, weight: 55, faveColor: '#EDA1ED', faveShape: 'ellipse', name: entity.name}});
			myEdges.push( { data: { source: 'system', target: entity.name, faveColor: '#EDA1ED', strength: 90 } } );
			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				myNodes.push({data: {id: application.name, weight: 35, faveColor: application.status === 'stopped' ? 'red' : '#F5A45D', faveShape: 'rectangle', name: application.name}});
				myEdges.push({ data: { source: entity.name, target: application.name, faveColor: '#F5A45D', strength: 90 }});
				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					myNodes.push({data: {id: subscriber.name, weight: 15, faveColor: '#6FB1FC', faveShape: 'triangle', name: subscriber.name}});
					myEdges.push({ data: { source: application.name, target: subscriber.name, faveColor: '#6FB1FC', strength: 90 }});
				}
			}
		}
	};

	service.getGraphOptions = function(myNodes, myEdges, onReadyFunc){
		var result = {
			layout: {
				name: 'breadthfirst', // 'arbor',
				directed: true,

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
			},

			style: cytoscape.stylesheet()
				.selector('node')
				.css({
//                        'font-size': 11,
					'shape': 'data(faveShape)',
					'width': 'mapData(weight, 40, 80, 20, 60)',
					'content': 'data(name)',
					'text-valign': 'center',
					'text-outline-width': 2,
					'text-outline-color': 'data(faveColor)',
					'background-color': 'data(faveColor)',
					'color': '#fff'
				})
				.selector(':selected')
				.css({
					'border-width': 3,
					'border-color': '#333'
				})
				.selector('edge')
				.css({
					'opacity': 0.666,
					'width': 'mapData(strength, 70, 100, 2, 6)',
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
	return service;
}]);
