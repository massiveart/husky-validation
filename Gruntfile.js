'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var requireJS = {
        baseUrl: '.',
        include: [
            'js/validation',
            'js/element',

            'js/types/date',
            'js/types/decimal',
            'js/types/email',
            'js/types/url',

            'js/validators/default',
            'js/validators/max',
            'js/validators/maxlength',
            'js/validators/min',
            'js/validators/minlength',
            'js/validators/required'
        ],
        out: 'dist/validation.js'
    };

    // project configuration
    grunt.initConfig({
        requirejs: {
            validation: {
                options: requireJS
            }
        }
    });

    grunt.registerTask('build', [
        'requirejs:validation'
    ]);
};
