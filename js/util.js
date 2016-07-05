/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define([], function() {

    'use strict';

    var ignoredKeys = [
        'form',
        'validation'
    ];

    return {
        debugEnabled: false,

        // get form fields
        getFields: function(element) {
            return $(element).find('input:not([data-form="false"], [type="submit"], [type="button"], [type="checkbox"], [type="radio"]), textarea:not([data-form="false"]), select:not([data-form="false"]), *[data-form="true"], *[data-type="collection"], *[contenteditable="true"]');
        },

        findGroupedFieldsBySelector: function(element, filter) {
            var groupedFields = {}, fieldName;

            $(element).find(filter).each(function(key, field) {
                fieldName = $(field).data('mapper-property');
                if (!groupedFields[fieldName]) {
                    groupedFields[fieldName] = [];
                }
                groupedFields[fieldName].push(field);
            });

            return groupedFields;
        },

        getCheckboxes: function(element) {
            return this.findGroupedFieldsBySelector(element, 'input[type="checkbox"]');
        },

        getRadios: function(element) {
            return this.findGroupedFieldsBySelector(element, 'input[type="radio"]');
        },

        /**
         * Parses the data of a element
         * Inspired by aurajs <http://aurajs.com>
         */
        parseData: function(el, namespace, defaults) {
            var $el = $(el);
            return this.buildOptions($el.data(), namespace, '', defaults);
        },

        /**
         * Build options for given data
         * Inspired by aurajs <http://aurajs.com>
         *
         * TODO Example
         */
        buildOptions: function(data, namespace, subNamespace, defaults) {
            if (!subNamespace) {
                subNamespace = '';
            }

            if (!defaults) {
                defaults = {};
            }

            var options = $.extend({}, defaults, {}),
                fullNamespace = namespace + this.ucFirst(subNamespace);

            $.each(data, function(key, value) {
                var regExp = new RegExp('^' + fullNamespace);
                if (regExp.test(key)) {
                    if ($.inArray(key, ignoredKeys) === -1) {
                        if (key !== fullNamespace) {
                            key = key.replace(regExp, '');
                        } else {
                            key = key.replace(new RegExp('^' + namespace), '');
                        }
                        if (key !== '') {
                            key = this.lcFirst(key);
                            options[key] = value;
                        }
                    }
                }
            }.bind(this));

            return options;
        },

        /**
         * returns true if .val can be used to this dom object
         * @param el {String|Object} valid selector or dom-object
         * @returns {Boolean}
         */
        isValueField: function(el) {
            var $el = $(el);

            return $el.is('input, select, textarea, option, button');
        },

        /**
         * returns true if element is checkbox
         * @param el {String|Object} valid selector or dom-object
         * @returns {Boolean}
         */
        isCheckbox: function(el) {
            var $el = $(el);

            return $el.is(':checkbox');
        },

        /**
         * Returns input values for elements
         * @param el {String|Object} valid selector or dom-object
         * @returns {String} value or empty string
         */
        getValue: function(el) {
            var $el = $(el);
            if (this.isCheckbox($el)) {
                return $el.prop('checked');
            } else if (this.isValueField($el)) {
                return $el.val();
            } else {
                return $el.html();
            }
        },

        /**
         * Sets a value for an element
         * @param el {String|Object} valid selector or dom-object to set the value for
         * @param value {String|Number} value to insert
         */
        setValue: function(el, value) {
            var $el = $(el);
            if (this.isCheckbox($el)) {
                $el.prop('checked', value);
            } else if (this.isValueField($el)) {
                $el.val(value);
            } else {
                $el.html(value);
            }
        },

        debug: function(p1, p2, p3) {
            if (!!this.debugEnabled) {
                if (!!p1) {
                    if (!!p2) {
                        if (!!p3) {
                            console.log('Husky Validation:', p1, p2, p3);
                        } else {
                            console.log('Husky Validation:', p1, p2);
                        }
                    } else {
                        console.log('Husky Validation:', p1);
                    }
                } else {
                    console.log('Husky Validation');
                }
            }
        },

        /**
         *  JavaScript equivalent of PHP’s ucfirst
         *  inspired by http://kevin.vanzonneveld.net
         */
        ucFirst: function(str) {
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        },

        lcFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        startsWith: function(str, starts) {
            return str.indexOf(starts) === 0;
        },

        /**
         * Prints object
         */
        print: function(object, stage) {
            if (!stage) {
                stage = 1;
            }

            var str = '',
                oneIndent = '&nbsp;&nbsp;&nbsp;&nbsp;',
                property, value,
                indent = '',
                i = 0;

            while (i < stage) {
                indent += oneIndent;
                i++;
            }

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    value = object[property];
                    if (typeof value === 'string') {
                        if (this.isNumeric(value)) {
                            str += indent + property + ': ' + value + '; </br>';
                        } else {
                            if (value.length > 7) {
                                value = value.substring(0, 6) + ' ...';
                            }
                            str += indent + property + ': \'' + value + '\'; </br>';
                        }
                    } else {
                        str += indent + property + ': { </br>' + indent + oneIndent + print(value, stage++) + '}';
                    }
                }
            }

            return str;
        },

        isNumeric: function(str) {
            return str.match(/-?\d+(.\d+)?/);
        }
    };
});
