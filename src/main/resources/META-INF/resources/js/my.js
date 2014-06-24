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

	$scope.dialogShow = false;

	datasource.loadNodes().then(function (systems) {
		console.log("Updating nodes");
		$scope.systems = dms.groupSystemsByName(systems);

		dms.addMockDataToReport(datasource.getOtherSystemNodes(), $scope.systems);
		dms.addMockDataToReport(datasource.getAnotherSystemNodes(), $scope.systems);

		console.log("All systems clear");
		console.log($scope.systems);

		console.log("Running chaos monkey and merging");
		_.each($scope.systems, function(system){
			dms.runChaosMonkey(system);
			dms.mergeLayers(system);
		});

		console.log("Graph data ready");
		console.log($scope.systems);

		_.each($scope.systems, function(system){
			gms.generateGraph(system.instances[0], myNodes, myEdges);
		});

		cyEl.cytoscape(gms.getGraphOptions(myNodes, myEdges, $scope.onCyReady));
		$scope.cy = cyEl.cytoscape('get');

		_.each($scope.systems, function(system){
			gms.refreshStatuses($scope.cy, system.instances[0]);
		});

		$scope.cy.on('click', 'node', function(evt) {
			var nodes = this;
			$scope.currentNode = nodes.data("customData");
			$scope.dialogShow = true;
			$(".dialog").css("left", evt.cyRenderedPosition.x+150); // canvas starts ar 150,100
			$(".dialog").css("top", evt.cyRenderedPosition.y+100);
			console.log(nodes);
			$scope.$apply();
		});

		$scope.cy.on('click', function(evt){
			if (evt.cyTarget === $scope.cy){
				$scope.dialogShow = false;
				$scope.$apply();
			}
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

		$scope.dialogShow = false;
		//$scope.$apply();
	};
}];
