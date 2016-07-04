/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define([
    'type/default'
], function(Default) {

    'use strict';

    return function($el, options) {
        var defaults = {
                format: 'n', // n, d, c, p
                regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
                nullable: false
            },

            typeInterface = {
                initializeSub: function() {
                },

                validate: function() {
                    var val = this.getValue();

                    if (val === '' || (this.options.nullable === true && val === null)) {
                        return true;
                    }

                    return this.options.regExp.test(val);
                },

                getModelData: function(val) {
                    if(val === '') {
                        if (this.options.nullable === true) {
                            return null;
                        }
                        
                        return '';
                    }
                    return Globalize.parseFloat(val);
                },

                getViewData: function(val) {
                    if(typeof val === 'string'){
                        if(val === '') {
                            return '';
                        }
                        val = parseFloat(val);
                    }
                    return Globalize.format(val, this.options.format);
                }
            };

        return new Default($el, defaults, options, 'decimal', typeInterface);
    };
});
