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
	$scope.randomCoordinates = false;
	$scope.lockedNodes = true;
	$scope.cyReInitialized = true;
	$scope.suppressEvents = false;

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

		//$('#tempcy').cytoscape(gms.getTemplateGraphOptions(gms.generateTemplateGraph($scope.systems)/*, defer.resolve*/));


		// generate data for graph from summary layer (structure, names, initial colors reflecting statuses)
		var myNodes = [];
		var myEdges = [];
		_.each($scope.systems, function(system){
			gms.generateGraph(system.instances[0], myNodes, myEdges);
		});

		// lock screen position of system nodes as per template values
		whenTemplateReady.then(function(){
			var allFixed = false;
			if (!$scope.randomCoordinates)
				allFixed = $scope.updateNodePositionToFixedCoordinates(datasource.getFixedCoordinates(), myNodes);

			if (!allFixed){
				var x = datasource.getFixedMostRightCoord();
				var newSimulationBounds = [x, 0, $('#maincy').width(), $('#maincy').height()];
				$scope.makeCy(myNodes, myEdges, allFixed, newSimulationBounds);
			}else
				$scope.makeCy(myNodes, myEdges, allFixed);

		});


	});

	$scope.updateNodePositionToFixedCoordinates = function(coordsMap, nodes, realtime){
		var allFixed = true;
		_.each(nodes, function(node){
			var name = realtime? node.data("id"): node.data.id;
			var coordinates = coordsMap[name];
			if (coordinates){
				if (realtime){
					node.position(coordinates);
					node.lock();
				}else{
					node.position = {x: coordinates.x, y: coordinates.y};
					node.locked = true;
				}
			}else{
				allFixed = false;
				console.log("Fixed coordinates for "+name+" aren't available");

				if (realtime){
					node.unlock()
				} else{
					node.locked = false;
				}
			}
		});
		return allFixed;
	};


	$scope.onLayoutStop = function(){
		console.log("Rendering stopped");
		$scope.suppressEvents = false;
		$scope.$apply();
		if ($scope.cyReInitialized){
			$scope.cyReInitialized = false;
			$scope.refreshCurrentLayer();
		}
		if ($scope.lockedNodes){
			$scope.cy.nodes().lock();
		}else{
			$scope.cy.nodes().unlock();
		}
	};

	$scope.makeCy = function(nodes, edges, allFixed, newSimulationBounds){

		$scope.suppressEvents = true; // onLayoutStop will restore it
		var cyEl = $('#maincy');
		var options = gms.getGraphOptions(nodes, edges, $scope.onCyReady, undefined, $scope.onLayoutStop, allFixed);
		if (newSimulationBounds)
			options.layout.simulationBounds = newSimulationBounds;
		cyEl.cytoscape(options); // <----------------------
		$scope.cy = cyEl.cytoscape('get');

		$scope.cy.on('click', 'node', function(evt) {
			if ($scope.suppressEvents)
				return $scope.logSuppress("node click");

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
				if ($scope.suppressEvents)
					return $scope.logSuppress("background click");

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

	$scope.onRandomFlagChange = function(){
		if ($scope.cy && !$scope.cyReInitialized){
			$scope.suppressEvents = true;

			$scope.cy.nodes().unlock();  // to let us change coordinates programatically
			if ($scope.randomCoordinates){
				$scope.cy.layout(gms.getArborLayout(undefined, $scope.onLayoutStop, false));
			}else{
				var allFixed = $scope.updateNodePositionToFixedCoordinates(datasource.getFixedCoordinates(), $scope.cy.nodes(), true);
				var newOptions = gms.getArborLayout(undefined, $scope.onLayoutStop, allFixed);
				newOptions.simulationBounds = undefined;

				if (allFixed){
					$scope.cy.forceRender(); // but we still want to call layout() to kick in onStop function and toggle suppressEvents
				} else {
					// change simulationBounds
					var x = datasource.getFixedMostRightCoord();
					var newSimulationBounds = [x, 0, $scope.cy.container().clientWidth, $scope.cy.container().clientHeight];
					console.log(newSimulationBounds);
					newOptions.simulationBounds = newSimulationBounds;
				}
				$scope.cy.layout(newOptions);
			}

		}
	};

	$scope.onLockedFlagChange = function(){
		if (!$scope.cyReInitialized){
			if ($scope.lockedNodes)
				$scope.cy.nodes().lock();
			else
				$scope.cy.nodes().unlock();
		}
	};

	$scope.$watch('maincy', function(){
		if ($scope.maincy){
			if ($scope.cy) $scope.cy.layout();
		}else{
			var cy = $('#hiddency').cytoscape('get');
			cy.layout();
		}
	});

	$scope.$watch('randomCoordinates', $scope.onRandomFlagChange);
	$scope.$watch('lockedNodes', $scope.onLockedFlagChange);

	$scope.makeLegendCy = function(){
		$("#legendcy").cytoscape(gms.getLegendGraphOptions());
	};

	$scope.getNObjects = function(n, factory){
		var result = [];
		for (var i=0; i<n; i++){
			result.push(factory());
		}
		return result;
	};

	$scope.dumpCoordinates = function(){
		var result = {};
		$scope.cy.nodes().each(function(i, node){
			result[node.data("id")] = node.position();
		});

		console.log(JSON.stringify(result));
	};

	$scope.logSuppress = function(evt){
		console.log("Ignoring "+evt+" - Events are disabled");
		return false;
	};



	$scope.makeLegendCy();
}];
