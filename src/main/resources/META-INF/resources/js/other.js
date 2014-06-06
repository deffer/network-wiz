var network = {
	"system": {
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
						"subscribers": {
							"subscriber": {
								"name": "StudentAdminPerson",
								"context": "StudentAdminPerson",
								"endpoint": "https://esb.dev.mw.auckland.ac.nz/StudentAdmin/StudentAdminService"
							}
						}
					},
					{
						"name": "StudentAccommodationSubscribers",
						"status": "running",
						"version": "2.16",
						"subscribers": {
							"subscriber": {
								"name": "StudentAccommodationPerson",
								"context": "StudentAccommodationPerson",
								"endpoint": "https://ormadmpre01.pre.mw.auckland.ac.nz:8004/StudentAccommodation/StudentAccommodationService"
							}
						}
					},
					{
						"name": "FacultyOfEducationSubscribers",
						"status": "running",
						"version": "1.18",
						"subscribers": {
							"subscriber": {
								"name": "FedssPerson",
								"context": "FedssPerson",
								"endpoint": "https://esb.dev.mw.auckland.ac.nz/FacultyOfEducation/FedssService"
							}
						}
					},
					{
						"name": "HRSubscribers",
						"status": "stopped",
						"version": "1.8",
						"subscribers": {
							"subscriber": [
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
					}
				]
			}
		]
	}
};

            var myNodes = [];
            var myEdges = [];

            myNodes.push( {data: {id: 'system', weight: 75, faveColor: '#86B342', faveShape: 'octagon', name: network.system.name}});
            for(var cEntities = 0; cEntities < network.system.entities.length; cEntities ++) {
                var entity = network.system.entities[cEntities];
                myNodes.push( {data: {id: entity.name, weight: 45, faveColor: '#EDA1ED', faveShape: 'ellipse', name: entity.name}});
                myEdges.push( { data: { source: 'system', target: entity.name, faveColor: '#EDA1ED', strength: 90 } } );
                for(var aCount = 0; aCount < entity.applications.length; aCount ++) {
                    var application = entity.applications[aCount];
                    myNodes.push({data: {id: application.name, weight: 35, faveColor: '#F5A45D', faveShape: 'rectangle', name: application.name}});
                    myEdges.push({ data: { source: entity.name, target: application.name, faveColor: '#F5A45D', strength: 90 }});
                }
            }
