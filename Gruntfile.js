module.exports = function (grunt) {

	grunt.initConfig({

		/*useminPrepare: {
			html: 'index.html'
		},*/

		concat: {
			generated: {
				files: [
					{ dest: 'dist/third-party.js',
						src: [
							'scripts/libs/underscore-min.js', 'scripts/libs/jquery.min.js',
							'scripts/libs/angular.min.js', 'scripts/libs/arbor.js', 'scripts/libs/cytoscape.js'
						]
					},
					{ dest: 'dist/app.js',
						src: [
							'scripts/js/my.js', 'scripts/js/myDataSource.js',
							'scripts/js/graphManipulationService.js', 'scripts/js/dataManipulationService.js', 'scripts/js/layoutsFactory.js'
						]
					}
				]
			}
		}

	});

	grunt.loadNpmTasks('grunt-usemin');

	grunt.registerTask('build', [
		'useminPrepare',
		'concat:generated',
		'filerev',
		'usemin'
	]);

};