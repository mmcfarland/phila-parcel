'use strict';
var path = require('path');

module.exports = function (grunt) {

    var debug = typeof grunt.option('release') === "undefined",
        cssRoot         = "css/",
        staticRoot      = "static/",
        bundleJs        = staticRoot + "js/parcel.js",
        bundleJsMin     = staticRoot + "js/parcel.min.js",
        appSass         = cssRoot + "sass/styles.scss",
        appCss          = staticRoot + "css/app.css",
        vendorCss       = cssRoot + "vendor/", 
        bundleCss       = staticRoot + 'css/parcel.css',
        bundleCssMin    = staticRoot + 'css/parcel.min.css';

    function aliasDir(dir) {
        var files = grunt.file.expand(dir + '/*.js');
        return files.map(function(f) {
            return f + ":" + path.basename(f, '.js');
        });
    }

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-devserver');


    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('js', debug ? ['browserify'] : ['browserify', 'uglify']);
    grunt.registerTask('css', debug ? ['sass', 'concat'] : ['sass', 'concat', 'cssmin']);
    grunt.registerTask('default', ['js', 'css']);

    grunt.initConfig({
        browserify: {
            parcel: {
                options: {
                    alias: aliasDir('js/src'),
                    transform: ['browserify-shim']
                },
                src: [],
                dest: bundleJs,
            }
        },

        jshint: {
            options: {
                jshintrc: '../.jshintrc'
            },
            parcel: ['Gruntfile.js', 'src/*.js']
        },

        uglify: {
            parcel: {
                src: [bundleJs],
                dest: bundleJsMin
            }
        }, 
        sass: {
            parcel: {
                src: [appSass],
                dest: appCss
            }
        },

        concat: {
            options: {
                stripBanners: true,
                banner: '/* Compiled <%= grunt.template.today() %> */',
            },
            parcel: {
                src: [vendorCss + '*.css', appCss],
                dest: bundleCss 
            }
        },

        cssmin: {
            parcel: {
                options: {
                    stripBanners: true,
                    banner: '/* Compiled <%= grunt.template.today() %> */',
                },
                src: [bundleCss],
                dest: bundleCssMin
            }
        },

        devserver: {
            server: {}
        },

        watch: {
            scripts: {
                files: ['js/src/*.js'],
                tasks: ['browserify', 'jshint']
            },
            styles: {
                files: ['css/sass/*.scss'],
                tasks: ['sass:parcel', 'concat:parcel']
            }
        }
    });
};
