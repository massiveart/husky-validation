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
                min: 0,
                max: null
            },

            subType = {
                validate: function() {
                    return true;
                },

                needsValidation: function() {
                    return false;
                },

                getChildren: function(id) {
                    return this.$el.find('*[data-mapper-property-tpl="' + id + '"]');
                },

                getMinOccurs: function() {
                    return this.options.min;
                },

                getMaxOccurs: function() {
                    return this.options.max;
                },

                canAdd: function(id) {
                    var length = this.getChildren(id).length;
                    return this.getMaxOccurs() === null || length < this.getMaxOccurs();
                },

                canRemove: function(id) {
                    var length = this.getChildren(id).length;
                    return length > this.getMinOccurs();
                }
            };

        return new Default($el, defaults, options, 'collection', subType);
    };
});
