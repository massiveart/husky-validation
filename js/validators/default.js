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
    'jquery'
], function($) {

    return function($el, defaults, options, name) {

        return {
            name: name,

            initialize: function() {
                this.$el = $el;
                this.data = $.extend(defaults, this.$el.data(), options);

                if (!!this.initializeSub) this.initializeSub();
            },

            updateConstraint: function(options) {
                this.data = $.extend({}, this.data, options);
            }
        };

    };

});
