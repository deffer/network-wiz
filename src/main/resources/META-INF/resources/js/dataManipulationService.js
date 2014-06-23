/**
 * Created by iben883 on 23/06/14.
 */
angular.module("dataManipulation", []).factory("dataManipulationService", [function(){

	var service = {};

	service.mergeLayers = function(nodes){
		var result = $.extend(true, {}, nodes[1], nodes[2], nodes[3], nodes[4]);
		console.log("After merging");
		console.log(result);
		return result;
		/*myNodes.push( {data: service.generateNodeData(1, network.name, 'fixed', 75, -30, 'system')});
		for(var cEntities = 0; cEntities < network.entities.length; cEntities ++) {
			var entity = network.entities[cEntities];
			myNodes.push( {data: service.generateNodeData(2, entity.name, 'fixed', 55, column2)});
			myEdges.push( { data: { source: 'system', target: entity.name, faveColor: service.colorMap[2], strength: 90 } } );
			column2 =  column2==0 ? -20 : 0;

			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				myNodes.push({data: service.generateNodeData(3, application.name, application.status, 35+aCount, column3)});
				myEdges.push({ data: { source: entity.name, target: application.name, faveColor: service.colorMap[3], strength: 90 }});
				column3 = column3==0 ? -20 : 0;

				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
					myNodes.push({data: service.generateNodeData(4, subscriber.name, subscriber.status, 15+sCount*5, column4)});
					myEdges.push({ data: { source: application.name, target: subscriber.name, faveColor: service.colorMap[4], strength: 90 }});
					column4 = column4 ==0? -20 : 0;
				}
			}
		}*/
	};

	service.runChaosMonkey = function(nodes){

		_.each(nodes[2].entities[0].applications, function(app){
			app.status = 'running';
		});
		console.log(nodes[2]);

		_.each(nodes[3].entities[0].applications, function(app){
			app.status = 'stopped';
		});
		console.log(nodes[3]);

	};
	return service;
}]);