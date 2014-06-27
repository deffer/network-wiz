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
	 * Returns mapping System Name --> all we know about it (list of instances, errors, etc)
	 * Value in the map is itself a map, as its used in the controller: {instances: [], hasErrors: [], caches: []}
	 * Note, instances are counting from 1 (0 is reserved for summary layout). For example:
	 *
	 *  report.EPR.instances[3] - is an EPR instance from server ormesbdev98
	 *  report.IDCards.hasErrors[1] - indicates that IDCards on server ormesbdev02 has some errors
	 *
	 * @param allSystems an array - one element per server. each element is itself and array of systems.
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
	 * Adds a system info into total structure.
	 * @param report total structure
	 * @param system system instance. For example EPR on server ormesbdev98
	 * @param index server index. Starts with 1 since 0 is reserved for merged layout
	 */
	service.addToReport = function(report, system, index){
		var sysGroup = report[system.name];

		if (!sysGroup){
			sysGroup = {instances:[], hasErrors:[], caches:[]};
			report[system.name] = sysGroup;
		}
		sysGroup.instances[index] = system;
	};

	/**
	 * Takes array of system's instances and generates a summary instance (under index 0 in the array) which has the most
	 *   complete information about systems (all available children nodes and summary statuses for them)
	 * Assigns unique ids to all nodes in all instances.  Also makes a cache of nodes for faster access by id.
	 *
	 * @param system
	 */
	service.createSummaryLayer = function(system){
		var nodes = system.instances; // its just shorter

		nodes[0] = {};
		for (var i = 1; i<nodes.length; i++){
			service.extendInstance(nodes[0], nodes[i]);
		}
		var summary = nodes[0];

		service.mergeLists(summary.entities, nodes[1].entities, nodes[2].entities, nodes[3].entities, nodes[4].entities);

		for (var cEntities = 0; cEntities < summary.entities.length; cEntities ++){
			var entity = summary.entities[cEntities];
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

		for (i=0; i<nodes.length; i++){
			var stats = service.makeCacheAndGetStats(nodes[i]);
			system.caches[i] = stats.cache;
			system.hasErrors[i] = stats.hasErrors;
		}
	};

	service.extendInstance = function(dest, instance){
		service.extendObjectRecursive(dest, instance, 0);
	};

	service.depthCollectionNames = ['entities', 'applications', 'subscribers'];
	service.extendObjectRecursive = function(dest, other, depth, nameContext){
		other.id = nameContext? nameContext+'-'+other.name : other.name;

		if (depth>=service.depthCollectionNames.length) {
			$.extend(dest, other);
			return;
		}

		var collectionName = service.depthCollectionNames[depth];
		var collection = other[collectionName];
		if (!collection || collection.length == 0){
			return;
		}

		var shallow = _.omit(other, collectionName);
		$.extend(dest, shallow);

		if (!dest[collectionName]){
			dest[collectionName] = [];
		}

		for (var i = 0; i < collection.length; i ++){
			var entity = collection[i];
			var partner = _.find(dest[collectionName], function(s){return s.name == entity.name});
			if (!partner) {
				partner = {};
				dest[collectionName].push(partner);
			}
			service.extendObjectRecursive(partner, entity, depth+1, other.id);
		}
	};


	/**
	 *
	 * @param system one system on one server (layer)
	 * @returns {{cache: {}, hasErrors: boolean}}
	 */
	service.makeCacheAndGetStats = function(system){
		var stats = {cache: {}, hasErrors: false};
		service.updateCacheAndGetStatsRecursive(system, 0, stats);
		return stats;
	};

	service.updateCacheAndGetStatsRecursive = function(object, depth, stats){
		stats.cache[object.id] = object;

		if (!service.statusIsGoodOrUndefined(object.status))
			stats.hasErrors = true;

		if (depth>=service.depthCollectionNames.length)
			return;

		var collectionName = service.depthCollectionNames[depth];
		var collection = object[collectionName];
		if (!collection || collection.length == 0){
			return;
		}

		for (var i = 0; i < collection.length; i ++){
			var entity = collection[i];
			service.updateCacheAndGetStatsRecursive(entity, depth+1, stats);
		}
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
					return "unavailable";
			});

			masterList[entityIndex].status = service.mergeStatus(statuses);
		}
	};

	service.mergeStatus = function(statuses){
		var result = null;

		var hasHealthy = false;
		var hasFaulty = false;
		_.each(statuses, function(status){
			if (service.statusIsGoodOrUndefined(status)){
				hasHealthy = true;
			}else{
				hasFaulty = true;
				result = status;
			}
			if (service.statusIsGoodOrUndefined(result) && !service.statusIsGoodOrUndefined(status)){
				result = "warning";
			}
		});

		if (hasHealthy && hasFaulty)
			return "warning";
		else if (hasHealthy)
			return 'running';
		else return result;
	};

	service.statusIsGoodOrUndefined = function(status){
		return !status || status == "running" || status == "fixed"
	};

	service.runChaosMonkey = function(system){
		var nodes = system.instances;

		_.each(nodes[2].entities, function(entity){
			_.each(entity.applications, function(app){
				if (app.name.indexOf("AlwaysDownSubscribers")<0)
					app.status = 'running';
				else
					app.status = "stopped";
			});
		});


		if (nodes[1].name == "EPR"){
			console.log("Cant touch me.   I'm EPR.");
			return;
		}
		_.each(nodes[3].entities[0].applications, function(app){
			app.status = 'stopped';
		});

	};
	return service;
}]);