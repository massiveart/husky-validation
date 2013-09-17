'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var requireJS = {
        baseUrl: '.',
        preserveLicenseComments: false,
        paths: {
            'validation': 'js/validation',
            'validation-element': 'js/element',

            'type/default': 'js/types/default',
            'type/date': 'js/types/date',
            'type/decimal': 'js/types/decimal',
            'type/email': 'js/types/email',
            'type/url': 'js/types/url',

            'validator/default': 'js/validators/default',
            'validator/min': 'js/validators/min',
            'validator/max': 'js/validators/max',
            'validator/minlength': 'js/validators/minlength',
            'validator/maxlength': 'js/validators/maxlength',
            'validator/required': 'js/validators/required'
        },
        include: [
            'validation',

            'type/default',
            'type/date',
            'type/decimal',
            'type/email',
            'type/url',

            'validator/default',
            'validator/min',
            'validator/max',
            'validator/minlength',
            'validator/maxlength',
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
