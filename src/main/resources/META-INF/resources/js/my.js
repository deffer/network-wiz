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

	var nodes = [];
	$scope.servernames = ['ormesbdev01', 'ormesbdev02', 'ormesbdev98', 'ormesbdev99'];

	datasource.loadNodes().then(function (systems) {
		console.log("Updating nodes");
		console.log(systems);
		$scope.systems = dms.groupSystemsByName(systems);

		dms.addMockDataToReport(datasource.getOtherSystemNodes(), $scope.systems);
		dms.addMockDataToReport(datasource.getAnotherSystemNodes(), $scope.systems);

		console.log($scope.systems);

		_.each($scope.systems, function(system){
			dms.runChaosMonkey(system);
			dms.mergeLayers(system);
		});

		_.each($scope.systems, function(system){
			gms.generateGraph(system.instances[0], myNodes, myEdges);
		});

		cyEl.cytoscape(gms.getGraphOptions(myNodes, myEdges, $scope.onCyReady));
		$scope.cy = cyEl.cytoscape('get');

		_.each($scope.systems, function(system){
			gms.refreshStatuses($scope.cy, system.instances[0]);
		});
	});


	$scope.onCyReady = function(){
		console.log("Cy ready");
		window.globalCy = this;
	};

	$scope.toggleLayer = function(layer){
		console.log("Showing layer "+layer);

		_.each($scope.systems, function(system){
			gms.refreshStatuses($scope.cy, system.instances[layer]);
			console.log( system.instances[layer]);
		});
	};
}];
