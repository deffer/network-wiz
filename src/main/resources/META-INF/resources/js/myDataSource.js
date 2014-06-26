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
							"name": "AlwaysDownSubscribers",
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
							"name": "AbsentSubscribers",
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
		node4.entities[1].applications = [node4.entities[1].applications[0], node4.entities[1].applications[2], node4.entities[1].applications[3]];
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

	service.getFixedCoordinates = function(){
		return {"EPR":{"x":533.1435246728331,"y":366.2455065829705},"EPR-identity":{"x":642.83608982893,"y":364.2339275217706},"EPR-identity-FacultyOfEducationSubscribers":{"x":717.361336248686,"y":268.5727027632762},"EPR-identity-FacultyOfEducationSubscribers-FedssPerson":{"x":788.8033964883234,"y":203.66967984682032},"EPR-identity-HRSubscribers":{"x":786.4630880825864,"y":468.3480650587014},"EPR-identity-HRSubscribers-HREmployee":{"x":724.8985608933745,"y":524.4931230756863},"EPR-identity-HRSubscribers-HRApplicant":{"x":883.2424389433363,"y":511.2279314014688},"EPR-identity-HRSubscribers-UnresolvedEmployee":{"x":681.7976089435224,"y":489.4692875544031},"EPR-identity-HRSubscribers-UnresolvedApplicant":{"x":814.6571469761377,"y":545.5890638432811},"EPR-identity-StudentAccommodationSubscribers":{"x":773.8772399363374,"y":308.24703240939573},"EPR-identity-StudentAccommodationSubscribers-StudentAccommodationPerson":{"x":842.3043712680919,"y":260.16190677006193},"EPR-identity-StudentAdminSubscribers":{"x":794.3969049596233,"y":357.8014758573771},"EPR-identity-StudentAdminSubscribers-StudentAdminPerson":{"x":899,"y":355.9520976831825},"EPR-identity-VolunteerSubscribers":{"x":799.0417177472168,"y":412.04510255890636},"EPR-identity-VolunteerSubscribers-VolunteerPerson":{"x":884.3563994580268,"y":430.1392803454896},"IDCards":{"x":73.16819139927446,"y":533.2820040601459},"IDCards-idcardTopic":{"x":183.06956274534753,"y":599.0335898598843},"IDCards-idcardTopic-StudentIDTAdminSubscribers":{"x":309.04768175461504,"y":746.8057250575763},"IDCards-idcardTopic-StudentIDTAdminSubscribers-StudentAdminIDTPerson":{"x":422.7804660651432,"y":774},"IDCards-idcardTopic-StudentIDTAccommodationSubscribers":{"x":142.46452795878773,"y":694.878146723236},"IDCards-idcardTopic-StudentIDTAccommodationSubscribers-StudentAccommodationIDTPerson":{"x":97.04569371350823,"y":762.7232826561025},"IDCards-idcardTopic-FacultyOfEducationIDTSubscribers":{"x":334.6039764885234,"y":683.2819691661105},"IDCards-idcardTopic-FacultyOfEducationIDTSubscribers-FedssIDTPerson":{"x":468.61224859133307,"y":715.345391899823},"IDCards-idcardTopic-AlwaysDownSubscribers":{"x":204.9953884126757,"y":783.1260811820413},"IDCards-idcardTopic-AlwaysDownSubscribers-HRIDTEmployee":{"x":393.88433153630217,"y":824.0210646498863},"IDCards-idcardTopic-AlwaysDownSubscribers-HRIDTApplicant":{"x":170.2526512233049,"y":844.4010524103242},"IDCards-idcardTopic-AlwaysDownSubscribers-IDTUnresolvedVisitor":{"x":287,"y":844.7483116160743},"IDCards-idcardQueue":{"x":198.65368918967027,"y":526.2608098560743},"IDCards-idcardQueue-AbsentSubscribers":{"x":360.1744639376417,"y":532.0233474387808},"IDCards-idcardQueue-AbsentSubscribers-StudentAdminIDPerson":{"x":484.0538630513672,"y":552.400352128067},"IDCards-idcardQueue-StudentIDAccommodationSubscribers":{"x":360.4789751403946,"y":626.3158678969646},"IDCards-idcardQueue-StudentIDAccommodationSubscribers-StudentAccommodationIDPerson":{"x":493.15449344326044,"y":663.3251284033238},"IDCards-idcardQueue-FacultyOfEducationIDSubscribers":{"x":373.38240973668815,"y":580.1673124773795},"IDCards-idcardQueue-FacultyOfEducationIDSubscribers-FedssIDPerson":{"x":503.56740804083574,"y":600.1414141208668},"IDCards-idcardQueue-HRIDSubscribers":{"x":346.4576236365781,"y":483.30349714669615},"IDCards-idcardQueue-HRIDSubscribers-HRIDEmployee":{"x":398.69930014130694,"y":423.84851494742134},"IDCards-idcardQueue-HRIDSubscribers-HRIDApplicant":{"x":466.6435095866218,"y":499.3564732626993},"IDCards-idcardQueue-HRIDSubscribers-IDUnresolvedVisitor":{"x":449.28467826971064,"y":456.4506958691194},"Voyager":{"x":86.84060802941713,"y":100.51099291142324},"Voyager-library":{"x":136.12057134102554,"y":204.2257009483821},"Voyager-library-StudentVjAdminSubscribers":{"x":100.66478386948438,"y":323.68152904755925},"Voyager-library-StudentVjAdminSubscribers-StudentAdminVjPerson":{"x":92.64427964946515,"y":393},"Voyager-library-StudentVjAccommodationSubscribers":{"x":210.56875382928945,"y":345.0830652469599},"Voyager-library-StudentVjAccommodationSubscribers-StudentAccommodationVjPerson":{"x":238.13427298762667,"y":419.29304320515314},"Voyager-library-FacultyOfEducationVjSubscribers":{"x":267.85120947221935,"y":291.297407282692},"Voyager-library-FacultyOfEducationVjSubscribers-FedssVjPerson":{"x":385.8833560899035,"y":331.1612367312314},"Voyager-library-HRVjSubscribers":{"x":280.70210412575045,"y":206.12287597246416},"Voyager-library-HRVjSubscribers-HRVjEmployee":{"x":410.16147910462814,"y":136.41777917530294},"Voyager-library-HRVjSubscribers-HRVjApplicant":{"x":404.6713300712057,"y":260.6412150737726},"Voyager-library-HRVjSubscribers-VjUnresolvedVisitor":{"x":389.56893462310654,"y":73.77843906589351},"Voyager-library-HRVjSubscribers-VjResolvedVisitor":{"x":408.97815118674725,"y":196.55427743194417}}
	};
	return service;
}]);
