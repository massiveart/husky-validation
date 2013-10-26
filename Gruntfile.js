'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var clone = grunt.util._.clone,
        requireJS = {
            baseUrl: '.',
            preserveLicenseComments: false,
            paths: {
                'form': 'js/form',
                'form/mapper': 'js/mapper',
                'form/validation': 'js/validation',
                'form/element': 'js/element',
                'form/util': 'js/util',

                'type/default': 'js/types/default',
                'type/string': 'js/types/string',
                'type/date': 'js/types/date',
                'type/decimal': 'js/types/decimal',
                'type/email': 'js/types/email',
                'type/url': 'js/types/url',
                'type/label': 'js/types/label',
                'type/select': 'js/types/select',
                'type/array': 'js/types/array',

                'validator/default': 'js/validators/default',
                'validator/min': 'js/validators/min',
                'validator/max': 'js/validators/max',
                'validator/minLength': 'js/validators/min-length',
                'validator/maxLength': 'js/validators/max-length',
                'validator/required': 'js/validators/required',
                'validator/unique': 'js/validators/unique',
                'validator/equal': 'js/validators/equal',
                'validator/regex': 'js/validators/regex',

                'globalize': 'bower_components/globalize/lib/globalize',
                'cultures': 'bower_components/globalize/lib/cultures'
            },
            include: [
                'form',

                'type/string',
                'type/date',
                'type/decimal',
                'type/email',
                'type/url',
                'type/label',
                'type/select',
                'type/array',

                'validator/min',
                'validator/max',
                'validator/minLength',
                'validator/maxLength',
                'validator/required',
                'validator/unique',
                'validator/equal',
                'validator/regex'
            ],
            out: 'dist/validation.js',
            optimize: grunt.option('dev') ? "none" : "uglify"
        },
        getOptions = function(dev) {
            var _s = clone(requireJS);
            _s.out = 'dist/validation' + (dev ? '' : '.min') + ".js";
            _s.optimize = (dev ? 'none' : 'uglify');
            return _s;
        };

    // project configuration
    grunt.initConfig({
        requirejs: {
            dist: {
                options: getOptions(false)
            },
            dev: {
                options: getOptions(true)
            }
        }
    });

    grunt.registerTask('build', [
        'requirejs:dist',
        'requirejs:dev'
    ]);
};
