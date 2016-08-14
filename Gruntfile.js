module.exports = function (grunt) {
	grunt.initConfig({
	  watch: {
	  	options:{
	  		livereload:true
	  	},
	  	sass:{
	  		files:[ 'public/stylesheets/sass/*.scss'],
	  		tasks: ['sass']
	  	},
	    express: {
	      files:  [ 'public/api/*.js',
	      			'public/api/public_api/*.js',
	      			'public/javascripts/*.js',
	      			'public/javascripts/controllers/*.js',
	      			'public/javascripts/directives/*.js',
	      			'public/javascripts/factories/*.js',
	      			'public/javascripts/*.js',
	      			'public/html/*.html', 
	      			'public/stylesheets/*.css',
	      			'public/stylesheets/sass/*.scss',
	      			'views/*.jade',
	      			'public/routes/*.js',
	      			'app.js',
	      			'bin/www' 
	      		],
	      tasks:  [ 'express:all:stop','express:all' ],
	      options:{
	      	spawn:false
	      }	      
	    }
	  },
	  sass:{
	    	dist: {                            // Target
      			files: {                         // Dictionary of files
        					'public/stylesheets/uikit.css': 'public/stylesheets/sass/uikit.scss'
      			}
    		}
	    },
	  express:{
	  	all:{
	  		options:{
	  			script:'./bin/www',
	  			delay:0.5
	  		},
	  		stop:{}
	  	}
	  }
});


	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.registerTask('server', ['sass','express','watch' ]);
};