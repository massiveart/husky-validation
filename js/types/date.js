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

    return function($el, options) {
        var defaults = {
            language: 'de',
            languages: {
                de: /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/
            }
        };

        var subType = {
            initializeSub: function() {
                // TODO internationalization
            },

            validate: function() {
                // TODO return
                return this.options.languages[this.options.language].test(this.$el.val());
            },

            // internationalization of view data: default none
            getViewData: function(value) {
                // TODO option format
                return Globalize.format(this.getDate(value), "D");
            },

            getDate: function(value) {
                // FIXME better solution?
                var temp = value.split('T'),
                    dateParts = temp[0].split("-"),
                    timeParts = temp[1].split(':');

                return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2].split('+')[0]);
            }
        };

        return new Default($el, defaults, options, 'date', subType);
    };
});
