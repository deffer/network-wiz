/**
 * Created by iben883 on 20/06/14.
 */

(function($){
   // if we need something here
})(this.jQuery);

angular.module("nwizApp", ["datasource", "graphManipulation", "dataManipulation"]);

var nwizController = ["$scope", "datasource", "graphManipulationService", "dataManipulationService",function($scope, datasource, gms, dms){
	var cyEl = $('#cy');
	var myNodes = [];
	var myEdges = [];

	var nodes = datasource.getNodes();

	datasource.loadNodes().then(function (systems) {
		console.log("Updating nodes");
		console.log(systems);
		nodes[1] = systems[0][0]; // find the one with name EPR
		nodes[2] = systems[1][0]; // find the one with name EPR
		nodes[3] = systems[2][0]; // find the one with name EPR
		nodes[4] = systems[3][0]; // find the one with name EPR
		dms.runChaosMonkey(nodes);

		nodes[0] = dms.mergeLayers(nodes);
		gms.generateGraph(nodes[0], myNodes, myEdges);
		cyEl.cytoscape(gms.getGraphOptions(myNodes, myEdges, $scope.onCyReady, $scope.onLayoutReady));
		$scope.cy = cyEl.cytoscape('get');

		//console.log(nodes[3]);
		//bookmarksShuffle.convertFromServer(results, $scope.bookmarkStore);
	});


	$scope.onCyReady = function(){
		console.log("Cy ready");
		window.globalCy = this;
	};

	$scope.onLayoutReady = function(){
		console.log("Setting positions");
		var cy = this;
		cy.nodes().each(function(i, node){
			var vars = node.data("serviceOrder");
			var y = node.position('y');

			node.position('y', y + vars);
			console.log("Setting position to "+ (y+ vars));
		});
	};


	$scope.toggleLayer = function(layer){
		console.log("Showing layer "+layer);
		//$scope.cy.nodes("[faveColor='red']").data("faveColor", "#F5A45D");
		//$scope.cy.nodes("[serviceType='queue']").data("faveColor", "blue");
		console.log(nodes[layer]);
		gms.refreshStatuses($scope.cy, nodes[layer]);
	};
}];
