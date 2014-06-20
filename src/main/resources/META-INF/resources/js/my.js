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

	cyEl.cytoscape(datasource.getGraphOptions(myNodes, myEdges, $scope.onCyReady));

	$scope.cy = cyEl.cytoscape('get');

	$scope.toggleStatus = function(){
		console.log("Toggling status");
		$scope.cy.nodes("[faveColor='red']").data("faveColor", "#F5A45D");
	};
}];
