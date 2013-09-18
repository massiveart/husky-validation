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

    var ignoredKeys = [
        'form'
    ];

    return {
        debugEnabled: false,

        /**
         * Parses the data of a element
         * Inspired by aurajs <http://aurajs.com>
         */
        parseData: function(el, namespace, defaults) {
            var name,
                $el = $(el);

            return this.buildOptions($el.data(), namespace, defaults);
        },

        /**
         * Build options for given data
         * Inspired by aurajs <http://aurajs.com>
         */
        buildOptions: function(data, namespace, defaults) {
            var options = $.extend({}, defaults, {});

            $.each(data, function(key, value) {
                var regExp = new RegExp("^" + namespace);
                if (regExp.test(key)) {
                    if (key !== namespace) {
                        key = key.replace(new RegExp("^" + namespace), "");
                        key = key.charAt(0).toLowerCase() + key.slice(1);
                    }
                    if ($.inArray(key, ignoredKeys) == -1) {
                        options[key] = value;
                    }
                }
            });

            return options;
        },

        debug: function(p1, p2, p3) {
            if (!!this.debugEnabled) {
                if (!!p1) {
                    if (!!p2) {
                        if (!!p3) {
                            console.log("Husky Validation: ", p1, p2, p3)
                        } else {
                            console.log("Husky Validation: ", p1, p2)
                        }
                    } else {
                        console.log("Husky Validation: ", p1)
                    }
                } else {
                    console.log("Husky Validation")
                }
            }
        }
    };

});
