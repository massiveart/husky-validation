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
    'form/util'
],function(Util) {

    'use strict';

    return function($el, defaults, options, name, typeInterface, form) {

        var that = {
                initialize: function() {
                    this.$el = $el;
                    this.options = $.extend({}, defaults, options);

                    var dfd = $.Deferred();
                    this.requireCounter = 0;
                    this.initialized = dfd.promise();

                    if (!!this.initializeSub) {
                        this.initializeSub();
                    }
                    dfd.resolve();
                }
            },

            defaultInterface = {
                name: name,

                form: form,

                needsValidation: function() {
                    return true;
                },

                updateConstraint: function(options) {
                    $.extend(this.options, options);
                },

                // mapper functionality set value into input
                setValue: function(value) {
                    Util.setValue(this.$el, this.getViewData.call(this, value));
                },

                // mapper functionality get value from input
                getValue: function() {
                    return this.getModelData.call(this, Util.getValue(this.$el));
                },

                // internationalization of view data: default none
                getViewData: function(value) {
                    return value;
                },

                // internationalization of model data: default none
                getModelData: function(value) {
                    return value;
                }
            },
            result = $.extend({}, defaultInterface, typeInterface);

        that.initialize.call(result);

        return result;
    };

});
