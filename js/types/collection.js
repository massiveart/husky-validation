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
    'type/default',
    'form/util'
], function(Default, Util) {

    'use strict';

    return function($el, options, form) {
        var defaults = {
                min: 0,
                max: null
            },

            subType = {
                initializeSub: function() {
                    var i, len, property, $tpl, $emptyTpl;

                    // get dom data
                    this.properties = $el.data('mapperProperty').split(',');
                    this.templates = {};

                    // extract templates from dom
                    for (i = 0, len = this.properties.length; i < len; i++) {
                        property = this.properties[i];
                        $tpl = $('#' + this.options.config[property].tpl);
                        $emptyTpl = $('#' + this.options.config[property].emptyTpl);

                        // save content from tpl
                        this.templates[property] = {
                            tpl: $tpl.html(),
                            emptyTpl: $emptyTpl.html()
                        };
                    }
                },

                internalSetValue: function(templates, value, propertyName) {
                    var i, len, count, item,
                        dfd = $.Deferred(),
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        };

                    // remove children for this property
                    this.getChildren(propertyName).remove();

                    // get important values
                    len = value.length < this.getMinOccurs() ? this.getMinOccurs() : value.length;
                    count = len;

                    for (i = 0; i < len; i++) {
                        item = value[i] || {};

                        this.addChild(i, item, templates).then(resolve);
                    }

                    return dfd.promise();
                },

                addChild: function(index, item, templates, propertyName) {
                    var options, template, $template, dfd = $.Deferred();

                    if (typeof index === 'undefined' || index === null) {
                        index = this.getChildren().length;
                    }

                    if (this.canAdd()) {
                        // if index exists remove it
                        this.$el.find('> *[data-mapper-property-tpl="' + propertyName + '"]:nth-child(' + (index + 1) + ')').remove();

                        // render child
                        options = $.extend({}, {index: index}, item);
                        template = _.template(templates.tpl, options, form.options.delimiter);
                        $template = $(template);
                        $template.attr('data-mapper-property-tpl', propertyName);

                        // insert child
                        Util.insertAt(index, '> *', this.$el, $template);

                        // init fields and set data
                        this.form.initFields($template).then(function() {
                            this.form.mapper.setData(item, $template).then(function() {
                                dfd.resolve();
                            }.bind(this));
                        }.bind(this));
                    } else {
                        dfd.resolve();
                    }

                    return dfd.promise();
                },

                setValue: function(data, propertyName) {
                    var templates = this.templates[propertyName], dfd;
                    if (data.length === 0) {
                        dfd = $.Deferred();
                        this.$el.append(_.template(templates.emptyTpl));

                        // resolve now
                        dfd.resolve();
                        return dfd.promise();
                    } else {
                        return this.internalSetValue(templates, data, propertyName);
                    }
                },

                validate: function() {
                    return true;
                },

                needsValidation: function() {
                    return false;
                },

                getChildren: function(propertyName) {
                    return this.$el.find('*[data-mapper-property-tpl="' + propertyName + '"]');
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

        return new Default($el, defaults, options, 'collection', subType, form);
    };
});
