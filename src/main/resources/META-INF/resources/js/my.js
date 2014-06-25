/**
 * Created by iben883 on 20/06/14.
 */

(function($){
   // if we need something here
})(this.jQuery);

angular.module("nwizApp", ["datasource", "graphManipulation", "dataManipulation"]);

var nwizController = ["$scope", "datasource", "graphManipulationService", "dataManipulationService", "$q",function($scope, datasource, gms, dms, $q){

	// flags
	$scope.maincy = true;
	$scope.dialogShow = false;
	$scope.layer = 0;

	// data grouped by layers (servers). layer 0 is a summary layer
	$scope.servernames = ['ormesbdev01', 'ormesbdev02', 'ormesbdev98', 'ormesbdev99'];
	$scope.hasErrorsOnLayer = _.sample([false], $scope.servernames.length+1);
	$scope.elementsCache = []; // elementsCache[1].EPR-identity  -> identity node on server ormesbdev02

	// data grouped by systems
	$scope.systems = null; // systems.EPR.instances[2] -> EPR in server ormesbdev98


	datasource.loadNodes().then(function (systemsByServer) {

		// regroup data, generate summary layer, update error statuses, generate elements cache
		$scope.prepareData(systemsByServer);

		// run template layout to prepare system node's positions
		var defer = $q.defer();
		var whenTemplateReady = defer.promise;
		defer.resolve(); // in case we want to wait for other layout to finish first

		$('#maincy').cytoscape(gms.getTemplateGraphOptions(gms.generateTemplateGraph($scope.systems)/*, defer.resolve*/));


		// generate data for graph from summary layer (structure, names, initial colors reflecting statuses)
		var myNodes = [];
		var myEdges = [];
		_.each($scope.systems, function(system){
			gms.generateGraph(system.instances[0], myNodes, myEdges);
		});

		// lock screen position of system nodes as per template values
		whenTemplateReady.then(function(){
			//$scope.updateNodePositionFromOtherCy($('#maincy').cytoscape('get'), myNodes);
			$scope.makeCy(myNodes, myEdges);
		});


	});

	$scope.updateNodePositionFromOtherCy = function(otherCy, nodes){
		otherCy.nodes().each(function(i, node){
			var x = node.position("x");
			var y = node.position("y");
			var systemName = node.data("name");
			console.log(node);
			console.log("For system "+systemName+" coordinates "+x+", "+y);

			/*_.each(nodes, function(s){
				if (s.data.id == systemName || s.data.id.indexOf(systemName+"-")==0){
					s.locked = true;
					s.position = {x: x, y: y};
					s.data.x = x;
					s.data.y = y;
				}
			});*/

		});

		/*node.position = {x: templateNode.position('x'), y: templateNode.position('y')};*/

	};

	$scope.makeCy = function(nodes, edges){

		var cyEl = $('#maincy');
		cyEl.cytoscape(gms.getGraphOptions(nodes, edges, $scope.onCyReady, undefined, $scope.refreshCurrentLayer));
		$scope.cy = cyEl.cytoscape('get');

		$scope.refreshCurrentLayer();

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
	};

	$scope.prepareData = function(systemsByServer){
		console.log("Updating nodes");
		$scope.systems = dms.groupSystemsByName(systemsByServer);

		dms.addMockDataToReport(datasource.getOtherSystemNodes(), $scope.systems);
		dms.addMockDataToReport(datasource.getAnotherSystemNodes(), $scope.systems);

		console.log("All systems clear");
		console.log($scope.systems);

		// just initializing with N values
		$scope.hasErrorsOnLayer = $scope.getNObjects($scope.servernames.length+1, function(){ return false});
		$scope.elementsCache = $scope.getNObjects($scope.servernames.length+1, function(){ return {}});

		console.log("Running chaos monkey and merging...");
		_.each($scope.systems, function(system){
			dms.runChaosMonkey(system);
			dms.createSummaryLayer(system);
			// add system's data to layers cache
			for (var i = 0; i<system.instances.length; i++){
				$scope.hasErrorsOnLayer[i] = $scope.hasErrorsOnLayer[i] | system.hasErrors[i];
				_.extend($scope.elementsCache[i], system.caches[i]);
			}
		});

		console.log("Graph data ready");
		console.log($scope.systems);
	};

	$scope.refreshCurrentLayer = function(){
		console.log("Refreshing layer "+$scope.layer);
		console.log($scope.elementsCache[$scope.layer]);
		gms.refreshNodes($scope.cy, $scope.elementsCache[$scope.layer]);
	};

	$scope.onCyReady = function(){
		console.log("Cy ready");
		window.globalCy = this;
	};

	$scope.toggleLayer = function(layer){
		$scope.layer = layer;
		console.log("Showing layer "+layer);
		$scope.refreshCurrentLayer();
		$scope.dialogShow = false;
	};

	$scope.$watch('maincy', function(){
		if ($scope.maincy){
			if ($scope.cy) $scope.cy.forceRender();
		}else{
			var cy = $('#hiddency').cytoscape('get');
			cy.reset(); cy.resize(); cy.forceRender(); // nothing works :(
		}
	});

	$scope.getNObjects = function(n, factory){
		var result = [];
		for (var i=0; i<n; i++){
			result.push(factory());
		}
		return result;
	}
}];
