'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var requireJS = {
        baseUrl: '.',
        paths: {
            'validation': 'js/validation',
            'validation-element': 'js/validation',

            'type/default': 'js/types/default',
            'type/date': 'js/types/date',
            'type/decimal': 'js/types/decimal',
            'type/email': 'js/types/email',
            'type/url ': 'js/types/url',

            'validator/default': 'js/validators/default',
            'validator/min': 'js/validators/min',
            'validator/max': 'js/validators/max',
            'validator/minlength': 'js/validators/minlength',
            'validator/maxlength': 'js/validators/maxlength',
            'validator/required': 'js/validators/required'
        },
        include: [
            'validation',
            'element',

            'type/default',
            'type/date',
            'type/decimal',
            'type/email',
            'type/url',

            'validator/default',
            'validator/max',
            'validator/maxlength',
            'validator/min',
            'validator/minlength',
            'validator/required'
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
