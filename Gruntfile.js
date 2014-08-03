module.exports = function(grunt) {

  /*grunt.initConfig({
  concat: {
    options: {
      separator: ';',
    },
    dist: {
      src: ['scripts/libs/underscore-min.js', 'scripts/libs/jquery.min.js', 
	  'scripts/libs/angular.min.js', 'scripts/libs/arbor.js', 'scripts/libs/cytoscape.js'],
      dest: 'dist/third-party.js',
    },
  },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  
  // Default task(s).
  grunt.registerTask('default', ['concat']);*/
  

  concat:
    generated: {
      files: [
        {
          dest: '.tmp/concat/js/app.js',
          src: [
            'app/js/app.js',
            'app/js/controllers/thing-controller.js',
            'app/js/models/thing-model.js',
            'app/js/views/thing-view.js'
          ]
        }
      ]
    }
  },
  uglify: {
    generated: {
      files: [
        {
          dest: 'dist/js/app.js',
          src: [ '.tmp/concat/js/app.js' ]
        }
      ]
    }
  }

  grunt.registerTask('build', [
  'useminPrepare',
  'concat:generated',
  'cssmin:generated',
  'uglify:generated',
  'filerev',
  'usemin'
]);

};