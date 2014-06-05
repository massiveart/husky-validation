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
                /**
                 * initialize collection
                 */
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

                /**
                 * maps given array (value) with given templates to this.$el
                 * @param {object} templates includes tpl and empty template
                 * @param {array} value array of data
                 * @param {string} propertyName name of property
                 * @returns {object} deferred objects that´s indicates end of asynchronous functions
                 */
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

                        this.addChild(i, item, templates.tpl, propertyName).then(resolve);
                    }

                    return dfd.promise();
                },

                /**
                 * add a child to this.$el but on
                 * @param {number} index for resulting $item dom element
                 * @param {object} item data for resulting $item dom element
                 * @param {string} template to render $item
                 * @param {string} propertyName name of property
                 * @returns {object} deferred objects that´s indicates end of asynchronous functions
                 */
                addChild: function(index, item, template, propertyName) {
                    var options, $template, dfd = $.Deferred();

                    if (typeof index === 'undefined' || index === null) {
                        index = this.getChildren(propertyName).length;
                    }

                    if (this.canAdd()) {
                        // render child
                        options = $.extend({}, {index: index}, item);
                        template = _.template(template, options, form.options.delimiter);
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

                /**
                 * map value to this.$el
                 * @param {array} data
                 * @param {string }propertyName
                 * @returns {object} deferred objects that´s indicates end of asynchronous functions
                 */
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

                /**
                 * validates this type of data
                 * @returns {boolean}
                 */
                validate: function() {
                    return true;
                },

                /**
                 * indicates data to validate
                 * @returns {boolean}
                 */
                needsValidation: function() {
                    return false;
                },

                /**
                 * returns childs for given property
                 * @param {string} propertyName
                 * @returns {array}
                 */
                getChildren: function(propertyName) {
                    return this.$el.find('*[data-mapper-property-tpl="' + propertyName + '"]');
                },

                /**
                 * returns min occurs
                 * @returns {number}
                 */
                getMinOccurs: function() {
                    return this.options.min;
                },

                /**
                 * returns min occurs
                 * @returns {number}
                 */
                getMaxOccurs: function() {
                    return this.options.max;
                },

                /**
                 * returns TRUE if a child can be added for given property
                 * @returns {boolean}
                 */
                canAdd: function(propertyName) {
                    var length = this.getChildren(propertyName).length;
                    return this.getMaxOccurs() === null || length < this.getMaxOccurs();
                },

                /**
                 * returns TRUE if a child can be removed for given property
                 * @returns {boolean}
                 */
                canRemove: function(propertyName) {
                    var length = this.getChildren(propertyName).length;
                    return length > this.getMinOccurs();
                }
            };

        return new Default($el, defaults, options, 'collection', subType, form);
    };
});
