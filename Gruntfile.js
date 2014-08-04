module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({

		useminPrepare: {
			html: 'scripts/index.html',

			options: {
				dest: 'dist',
				staging: 'dist',
				flow: {
					html: {
						steps: {
							js: ['concat']
						},
						post: []
					}
				}
			}
		},

		copy: {
			html: {
				src: 'scripts/index.html',
				dest: 'dist/index.html'
			}
		},

		usemin: {
			html: 'dist/index.html',
			options: {
				assetsDirs: ['dist']
			}
		}
	});

	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('build', [
		'useminPrepare',
		'concat:generated',
		'copy:html',
		'usemin'
	]);

};