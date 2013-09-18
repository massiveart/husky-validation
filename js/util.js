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

    ];

    return {
        debugEnabled: false,

        /**
         * Parses the component's options from its element's data attributes.
         * Inspired by aurajs <http://aurajs.com>
         *
         * @private
         * @param  {String} el           the element
         * @param  {String} namespace     current Component's detected namespace
         * @param  {String} defaults      an Object containing the base Component's options to extend.
         * @return {Object}               An object that contains the Component's options
         */
        parseOptions: function(el, namespace, defaults) {
            var name,
                $el = $(el),
                options = $.extend({}, defaults, {});

            $.each($el.data(), function(key, value) {
                var regExp = new RegExp("^" + namespace);
                if (regExp.test(key)) {
                    key = key.replace(new RegExp("^" + namespace), "");
                    key = key.charAt(0).toLowerCase() + key.slice(1);

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
