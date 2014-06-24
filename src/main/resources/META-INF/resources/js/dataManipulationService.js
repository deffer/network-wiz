/**
 * Created by iben883 on 23/06/14.
 */
angular.module("dataManipulation", []).factory("dataManipulationService", [function(){

	var service = {};

	service.addMockDataToReport = function(nodes, report){
		for (var i = 0; i<nodes.length; i++){
			service.addToReport(report, nodes[i], i+1);
		}
	};

	/**
	 * Returns mapping System Name --> list of instances.
	 * Value in the map is itself a map, as its used in the controller: {instances: [], hasErrors: ?, something: ?}
	 * Note, instances are counting from 1 (0 is reserved for merged layout)
	 * @param allSystems
	 * @returns {string:{}}
	 */
	service.groupSystemsByName = function(allSystems){
		var report = {};

		for (var i = 0; i<allSystems.length; i++){
		 	var systems = allSystems[i];
			_.each(systems, function(system){
				if (system){
					service.addToReport(report, system, i+1);
				}
			});
		}
		return report;
	};

	/**
	 *
	 * @param report
	 * @param system
	 * @param index starts with 1 since 0 is reserved for merged layout
	 */
	service.addToReport = function(report, system, index){
		var sysGroup = report[system.name];
		if (!sysGroup){
			sysGroup = {instances:[], hasErrors: false};
			report[system.name] = sysGroup;
		}
		sysGroup.instances[index] = system;
	};

	service.mergeLayers = function(system){
		var nodes = system.instances;
		var result = $.extend(true, {}, nodes[1], nodes[2], nodes[3], nodes[4]);
		// TODO if some layers are missing a member, need to replace it with unavailable statuse
		nodes[0] = result;

		service.mergeLists(result.entities, nodes[1].entities, nodes[2].entities, nodes[3].entities, nodes[4].entities);

		for (var cEntities = 0; cEntities < result.entities.length; cEntities ++){
			var entity = result.entities[cEntities];
			var otherEntities = service.getOtherEntities(nodes, entity.name);
			service.mergeLists(entity.applications,
				otherEntities[1].applications,
				otherEntities[2].applications,
				otherEntities[3].applications,
				otherEntities[4].applications);

			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				var otherApplications = service.getOtherApplications(otherEntities, application.name);
				service.mergeLists(application.subscribers,
					otherApplications[1].subscribers,
					otherApplications[2].subscribers,
					otherApplications[3].subscribers,
					otherApplications[4].subscribers);
			}
		}

		system.instances[0] = result;

		/* network is current system, ex. EPR on one of the servers
		for(var cEntities = 0; cEntities < network.entities.length; cEntities ++) {
			var entity = network.entities[cEntities];
			for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
				var application = entity.applications[aCount];
				for(var sCount = 0; sCount < application.subscribers.length; sCount ++) {
					var subscriber = application.subscribers[sCount];
				}
			}
		}*/
	};


	service.getOtherApplications = function(otherEntities, aName){
		var result = [];
		for (var i = 0; i<otherEntities.length; i++){
			result.push(service.getApplication(otherEntities[i], aName));
		}
		return result;
	};

	service.getOtherEntities = function(nodes, eName){
		var result = [];
		for (var i = 0; i<nodes.length; i++){
			result.push(service.getEntity(nodes[i], eName));
		}
		return result;
	};

	service.getApplication = function(entry, appName){
		var result = _.find(entry.applications, function(app){
			return app.name == appName;
		});
		return result? result : {};
	};

	service.getEntity = function(entry, entityName){
		var result = _.find(entry.entities, function(entity){
			return entity.name == entityName;
		});
		return result? result : {};
	};

	/**
	 * Any number of arguments (at least 1)
	 *
	 * Every argument is a list of objects that have name and status.
	 * First argument is the destination list. All elements of this list will have their status updated with
	 *   the combined value of all other statuses (statuses that were found in the the other lists under the same object name)
	 */
	service.mergeLists = function ( ){
		var masterList = arguments[0];
		var otherLists = [];
		for (var i = 1; i<arguments.length; i++){
			otherLists.push(arguments[i]);
		}


		for (var entityIndex=0; entityIndex<masterList.length; entityIndex++){
			var name = masterList[entityIndex].name;

			var statuses = _.map(otherLists, function(list){
				var against = _.find(list, function(another){
					return another.name == name;
				});
				if (against)
					return against.status;
				else
					return undefined;
			});

			masterList[entityIndex].status = service.mergeStatus(statuses);
		}
	};

	service.mergeStatus = function(statuses){
		var result = null;

		_.each(statuses, function(status){
			if (service.statusIsGoodOrUndefined(result) && !service.statusIsGoodOrUndefined(status)){
				result = "warning";
			}
		});

		return result;
	};

	service.statusIsGoodOrUndefined = function(status){
		return !status || status == "running" || status == "fixed"
	};

	service.runChaosMonkey = function(system){
		var nodes = system.instances;

		_.each(nodes[2].entities[0].applications, function(app){
			app.status = 'running';
		});

		_.each(nodes[3].entities[0].applications, function(app){
			if (app.name != 'StudentAccommodationSubscribers' && app.name != "StudentAdminSubscribers")
				app.status = 'stopped';
		});

	};
	return service;
}]);