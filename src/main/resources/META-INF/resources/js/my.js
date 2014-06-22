/**
 * Created by iben883 on 20/06/14.
 */

(function($){
   // if we need something here
})(this.jQuery);

angular.module("nwizApp", ["datasource"]);

var nwizController = ["$scope", "datasource", function($scope, datasource){
	var cyEl = $('#cy');
	var myNodes = [];
	var myEdges = [];
	datasource.generateGraph(myNodes, myEdges);

	$scope.onCyReady = function(){
		console.log("Cy ready");
		window.globalCy = this;
	};

	$scope.onLayoutReady = function(){
		console.log("Setting positions");
		var cy = this;
		cy.nodes("[serviceLevel>2]").each(function(i, node){
			var vars = node.data("serviceOrder");
			var y = node.position('y');

			node.position('y', y + vars);
			console.log("Setting position to "+ (y+ vars));
		});
	};

	cyEl.cytoscape(datasource.getGraphOptions(myNodes, myEdges, $scope.onCyReady, $scope.onLayoutReady));

	$scope.cy = cyEl.cytoscape('get');

	$scope.toggleStatus = function(){
		console.log("Toggling status");
		//$scope.cy.nodes("[faveColor='red']").data("faveColor", "#F5A45D");
		//$scope.cy.nodes("[serviceType='queue']").data("faveColor", "blue");
		datasource.refreshStatuses($scope.cy, datasource.getNodes()[1]);
	};
}];
