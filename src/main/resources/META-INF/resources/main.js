require.config({
	baseUrl: "libs",
	paths: {
		jquery: "jquery.min",
		angular: "angular.min",
		underscore: "underscore-min",
		arbor: "arbor",
		cytoscape: "cytoscape",
		myController: "../js/my",
		myDataSource: "../js/myDataSource",
		graphManipulationService: "../js/graphManipulationService",
		dataManipulationService: "../js/dataManipulationService",
		layoutsFactory: "../js/layoutsFactory"
	},
	shim: {
		angular: { deps: ["jquery"]},
		arbor : {deps: ["underscore", "angular"]},
		cytoscape : {deps: ["arbor"]},
		myController : {deps: ["cytoscape"]},
		myDataSource : {deps: ["cytoscape"]},
		graphManipulationService : {deps: ["cytoscape"]},
		dataManipulationService : {deps: ["cytoscape"]},
		layoutsFactory : {deps: ["myController", "myDataSource", "graphManipulationService", "dataManipulationService"]}
	}
});

requirejs(['layoutsFactory'],
	function   () {
		// when all modules are loaded
		angular.bootstrap(document, ['nwizApp']);
	}
);
