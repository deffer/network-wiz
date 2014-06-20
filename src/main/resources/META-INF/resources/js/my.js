/**
 * Created by iben883 on 20/06/14.
 */

(function($){

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

}];
