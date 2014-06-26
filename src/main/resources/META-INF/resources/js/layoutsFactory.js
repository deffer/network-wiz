/**
 * Created by iben883 on 25/06/14.
 */
angular.module("layoutsFactory", []).factory("layoutsFactory", [function(){
	var service = {};

	service.getArborLayout = function(onReady, onStop, allFixed){
		service.allFixed = allFixed;
		return {

			name: 'arbor',

			liveUpdate: true, // whether to show the layout as it's running
			maxSimulationTime: 5000, // max length in ms to run the layout
			fit: true, // reset viewport to fit default simulationBounds
			padding: [ 100, 100, 100, 100 ], // top, right, bottom, left
			simulationBounds: undefined, // [x1, y1, x2, y2]; [0, 0, width, height] by default
			ungrabifyWhileSimulating: true, // so you can't drag nodes during layout

			// forces used by arbor (use arbor default on undefined)
			repulsion: 1000,
			stiffness: 600,
			friction: 0.5,
			gravity: true,
			fps: 55,
			precision: 200,

			// static numbers or functions that dynamically return what these
			// values should be for each element
			nodeMass:
			function(data){
				var map = {'1': 0.5, '2': 0.3, '3': 0.2, '4': 0.1};
				return map[""+data.serviceLevel];
			},
			edgeLength: undefined,
			/*function(data){
				return data.strength/100;
			},*/

			stepSize: 1, // size of timestep in simulation

			ready: onReady, // callback on layoutready
			stop: onStop, // callback on layoutstop

			// function that returns true if the system is stable to indicate that the layout can be stopped
			stableEnergy:
			function (energy) {
				if (service.allFixed) {
					//console.log("All fixed, nothing to do");
					return true;
				}
				var e = energy;
				return (e.max <= 0.5) || (e.mean <= 0.3);
			}
		}
	};

	service.getArborTemplateLayout = function(onReady, onStop){
		return {
			name: 'arbor',

			liveUpdate: true, // whether to show the layout as it's running
			maxSimulationTime: 500, // max length in ms to run the layout
			fit: true, // reset viewport to fit default simulationBounds
			padding: [ 100, 100, 100, 100 ], // top, right, bottom, left
			simulationBounds: undefined, // [x1, y1, x2, y2]; [0, 0, width, height] by default
			ungrabifyWhileSimulating: true, // so you can't drag nodes during layout

			// forces used by arbor (use arbor default on undefined)
			repulsion: 10000,
			stiffness: 700,
			friction: undefined, //0.2,
			gravity: false,
			fps: undefined,
			precision: 100,

			// static numbers or functions that dynamically return what these values should be for each element
			nodeMass: 10,
			edgeLength: undefined,

			stepSize: 0.15, // size of timestep in simulation

			ready: onReady, // callback on layoutready
			stop: onStop, // callback on layoutstop

			// function that returns true if the system is stable to indicate	that the layout can be stopped
			stableEnergy: function (energy) {
				var e = energy;
				return (e.max <= 0.5) || (e.mean <= 0.3);
			}
		}
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

	service.getCoSELayout = function(onLayoutReady, onLayoutStop){
		return {
			name: 'cose',
			fit : true,
			ready: onLayoutReady,
			stop: onLayoutStop,

			showOverlay: false,
			zoomEnabled: true,
			panEnabled: true,

			refresh : 10,
			nodeOverlap  : 10,
			numIter  : 20,
			gravity : 50

			/*nodeRepulsion : 1000, // Node repulsion (non overlapping) multiplier
			edgeElasticity : 50, // Divisor to compute edge forces
			refresh : 10, // Number of iterations between consecutive screen positions update (0 -> only updated on the end)

			 padding             : 10,
			 randomize           : true, // Whether to randomize node positions on the beginning
			 debug               : false,

			 nodeOverlap         : 1000, // Node repulsion (overlapping) multiplier
			 idealEdgeLength     : 1, // Ideal edge (non nested) length

			 nestingFactor       : 50, // Nesting factor (multiplier) to compute ideal edge length for nested edges
			 gravity             : 50, // Gravity force (constant)
			 numIter             : 20, // Maximum number of iterations to perform
			 initialTemp         : 50, // Initial temperature (maximum node displacement)
			 coolingFactor       : 0.95, // Cooling factor (how the temperature is reduced between consecutive iterations
			 minTemp             : 1 // Lower temperature threshold (below this point the layout will end)*/
		}
	};

	return service;

}]);
