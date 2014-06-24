/**
 * Created by iben883 on 20/06/14.
 */
angular.module("datasource", []).factory("datasource", ['$http', '$q', function($http, $q){
	var service = {};

	service.loadNodes = function () {
		var promises = [];
		var servers = [];
		var serversNames = ['01', '02', '98', '99'];

		for(var i = 0; i < serversNames.length; i ++) {
			var defer = $q.defer();
			var promise = defer.promise;
			promises.push(promise);
			$http({method: 'GET', url: 'http://applogdev01.its.auckland.ac.nz:9200/integration/weathermap/ormesbdev'+serversNames[i]}).
				success(service.getSuccessFunc(i, servers, defer)).error(service.getErrorFunc(0, servers, defer));
		}

		var deferResult = $q.defer();
		var promiseResult = deferResult.promise;
		$q.all(promises).then(function(){
			deferResult.resolve(servers);
		});
		return promiseResult;
	};

	service.getSuccessFunc = function(index, servers, defer){
		return function(data, status, headers, config){
			if (_.isUndefined(data) || _.isEmpty(data) || _.isNull(data) || data == 'null') {
				console.log("Empty response. IGNORE for "+index);
				servers[index] = [{}];
			}else{
				servers[index] = data._source.systems;
			}
			defer.resolve();
		};
	};

	service.getErrorFunc = function(index, servers, defer){
		return function(data, status, headers, config){
			console.log("Error from server. IGNORE for "+index);
			servers[index] = [{}];
			defer.reject();
		}
	};

	service.getNodes = function(){
		var node1 = {
				"name": "EPR",
				"entities": [
					{
						"name": "identity",
						"topic": "nz.ac.auckland.jms.identity.person",
						"applications":  [
							{
								"name": "StudentAdminSubscribers",
								"status": "running",
								"version": "2.15",
								"subscribers": [{
									"name": "StudentAdminPerson",
									"context": "StudentAdminPerson",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/StudentAdmin/StudentAdminService"
								}
								]
							},
							{
								"name": "StudentAccommodationSubscribers",
								"status": "running",
								"version": "2.16",
								"subscribers": [{
									"name": "StudentAccommodationPerson",
									"context": "StudentAccommodationPerson",
									"endpoint": "https://ormadmpre01.pre.mw.auckland.ac.nz:8004/StudentAccommodation/StudentAccommodationService"
								}
								]
							},
							{
								"name": "FacultyOfEducationSubscribers",
								"status": "running",
								"version": "1.18",
								"subscribers": [
									{
										"name": "FedssPerson",
										"context": "FedssPerson",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/FacultyOfEducation/FedssService"
									}]
							},
							{
								"name": "HRSubscribers",
								"status": "stopped",
								"version": "1.8",
								"subscribers": [
									{
										"name": "HREmployee",
										"context": "HREmployee",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
									},
									{
										"name": "HRApplicant",
										"context": "HRApplicant",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
									},
									{
										"name": "UnresolvedVisitor",
										"context": "HREmployee",
										"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
									}
								]
							}
						]
					}
				]
		};

		var node2 = $.extend(true, {}, node1);
		node2.entities[0].applications[3].status='running';
		node2.entities[0].applications[0].status='running';
		node2.entities[0].applications[2].status='stopped';
		return [node1, node2];
	};

	service.getOtherSystemNodes = function(){
		var node1 = {
			"name": "IDCards",
			"entities": [{
					"name": "idcardTopic",
					"topic": "nz.ac.auckland.jms.identity.person",
					"applications": [
						{
							"name": "StudentIDTAdminSubscribers",
							"status": "running",
							"version": "2.15",
							"subscribers": [
								{
									"name": "StudentAdminIDTPerson",
									"context": "StudentAdminPerson",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/StudentAdmin/StudentAdminService"
								}
							]
						},
						{
							"name": "StudentIDTAccommodationSubscribers",
							"status": "running",
							"version": "2.16",
							"subscribers": [
								{
									"name": "StudentAccommodationIDTPerson",
									"context": "StudentAccommodationPerson",
									"endpoint": "https://ormadmpre01.pre.mw.auckland.ac.nz:8004/StudentAccommodation/StudentAccommodationService"
								}
							]
						},
						{
							"name": "FacultyOfEducationIDTSubscribers",
							"status": "running",
							"version": "1.18",
							"subscribers": [
								{
									"name": "FedssIDTPerson",
									"context": "FedssPerson",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/FacultyOfEducation/FedssService"
								}
							]
						},
						{
							"name": "HRIDTSubscribers",
							"status": "stopped",
							"version": "1.8",
							"subscribers": [
								{
									"name": "HRIDTEmployee",
									"context": "HREmployee",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
								},
								{
									"name": "HRIDTApplicant",
									"context": "HRApplicant",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
								},
								{
									"name": "IDTUnresolvedVisitor",
									"context": "HREmployee",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
								}
							]
						}
					]
				}, {
					"name": "idcardQueue",
					"topic": "nz.ac.auckland.jms.identity.person",
					"applications": [
						{
							"name": "StudentIDAdminSubscribers",
							"status": "running",
							"version": "2.15",
							"subscribers": [
								{
									"name": "StudentAdminIDPerson",
									"context": "StudentAdminPerson",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/StudentAdmin/StudentAdminService"
								}
							]
						},
						{
							"name": "StudentIDAccommodationSubscribers",
							"status": "running",
							"version": "2.16",
							"subscribers": [
								{
									"name": "StudentAccommodationIDPerson",
									"context": "StudentAccommodationPerson",
									"endpoint": "https://ormadmpre01.pre.mw.auckland.ac.nz:8004/StudentAccommodation/StudentAccommodationService"
								}
							]
						},
						{
							"name": "FacultyOfEducationIDSubscribers",
							"status": "running",
							"version": "1.18",
							"subscribers": [
								{
									"name": "FedssIDPerson",
									"context": "FedssPerson",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/FacultyOfEducation/FedssService"
								}
							]
						},
						{
							"name": "HRIDSubscribers",
							"status": "stopped",
							"version": "1.8",
							"subscribers": [
								{
									"name": "HRIDEmployee",
									"context": "HREmployee",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
								},
								{
									"name": "HRIDApplicant",
									"context": "HRApplicant",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
								},
								{
									"name": "IDUnresolvedVisitor",
									"context": "HREmployee",
									"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
								}
							]
						}
					]
				}
			]
		};

		var node2 = $.extend(true, {}, node1);
		node2.entities[0].applications[3].status='running';
		node2.entities[0].applications[0].status='running';
		node2.entities[0].applications[2].status='stopped';

		var node3 = $.extend(true, {}, node1);
		var node4 = $.extend(true, {}, node1);
		return [node1, node2, node3, node4];
	};

	service.getAnotherSystemNodes = function(){
		var node1 = {
			"name": "Voyager",
			"entities": [ {
				"name": "library",
				"topic": "nz.ac.auckland.jms.identity.person",
				"applications":  [{
					"name": "StudentVjAdminSubscribers",
					"status": "running",
					"version": "2.15",
					"subscribers": [{
						"name": "StudentAdminVjPerson",
						"context": "StudentAdminPerson",
						"endpoint": "https://esb.dev.mw.auckland.ac.nz/StudentAdmin/StudentAdminService"
					}
					]
				},{
					"name": "StudentVjAccommodationSubscribers",
					"status": "running",
					"version": "2.16",
					"subscribers": [{
						"name": "StudentAccommodationVjPerson",
						"context": "StudentAccommodationPerson",
						"endpoint": "https://ormadmpre01.pre.mw.auckland.ac.nz:8004/StudentAccommodation/StudentAccommodationService"
					}
					]
				},{
					"name": "FacultyOfEducationVjSubscribers",
					"status": "running",
					"version": "1.18",
					"subscribers": [
						{
							"name": "FedssVjPerson",
							"context": "FedssPerson",
							"endpoint": "https://esb.dev.mw.auckland.ac.nz/FacultyOfEducation/FedssService"
						}]
				},{
					"name": "HRVjSubscribers",
					"status": "stopped",
					"version": "1.8",
					"subscribers": [{
						"name": "HRVjEmployee",
						"context": "HREmployee",
						"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
					},{
						"name": "HRVjApplicant",
						"context": "HRApplicant",
						"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
					},{
						"name": "VjUnresolvedVisitor",
						"context": "HREmployee",
						"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
					},{
						"name": "VjResolvedVisitor",
						"context": "HREmployee",
						"endpoint": "https://esb.dev.mw.auckland.ac.nz/HR/HRService"
					}
					]
				}
				]
			}
			]
		};

		var node2 = $.extend(true, {}, node1);
		node2.entities[0].applications[1].status='running';
		node2.entities[0].applications[0].status='running';
		node2.entities[0].applications[3].status='stopped';

		var node3 = $.extend(true, {}, node1);
		var node4 = $.extend(true, {}, node1);
		return [node1, node2, node3, node4];
	};
	return service;
}]);
