/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 * @module husky-validation/type/collection
 */

// TODO [TESTS] min / max for each collection in config
// TODO [TESTS] add / remove handling (buttons)
// TODO [TESTS] check full and empty
// TODO [TESTS] empty template remove (set data add to collection)
// TODO add / remove from collection function
// TODO edit in collection

/**
 * @class Collection
 * @constructor
 *
 * @param {object} options configuration object
 * @param {number} [options.min] default min items
 * @param {number} [options.max] default max items
 * @param {string} [options.fullClass] class for container if collection item count more than minimum
 * @param {string} [options.emptyClass] class for container if collection item count is minimum
 * @param {string} [options.singleValue] property name of single value
 *
 * @param {object} options.config configuration object (key is property name)
 * @param {string} options.config.tpl id to template for each item
 * @param {string} [options.config.emptyTpl] id to empty template for collection
 * @param {string} [options.config.addButton] selector for add button
 * @param {string} [options.config.removeButton] selector for remove button
 * @param {string} [options.config.counter] selector for counter span
 * @param {string} [options.config.min] minimum count of items (overrides options.min)
 * @param {string} [options.config.max] maximum count of items (overrides options.max)
 * @param {string} [options.config.defaultData] data for new items
 */
define([
    'type/default',
    'form/util'
], function(Default, Util) {

    'use strict';

    return function($el, options, form) {
        var defaults = {
                min: 0,
                max: null,
                fullClass: 'full',
                emptyClass: 'empty',
                singleValue: false
            },

            /**
             * event emitted for new item in collection
             * @event form-add
             * @param {string} propertyName name of property has new item
             * @param {object} data data of new item
             */
            FORM_ADD = 'form-add',

            /**
             * event emitted for removed item in collection
             * @event form-add
             * @param {string} propertyName name of property has removed item
             * @param {object} data data of removed item
             */
            FORM_REMOVE = 'form-remove',

            subType = {
                /**
                 * initialize templates
                 * @method initializeSub
                 */
                initializeSub: function() {
                    var i, len, property, $tpl, $emptyTpl;

                    // get dom data
                    this.properties = $el.data('mapperProperty').split(',');
                    this.templates = {};

                    // extract templates from dom
                    for (i = 0, len = this.properties.length; i < len; i++) {
                        property = this.properties[i];

                        // bind dom events
                        this.bindDomEvents(property);

                        // load template from dom
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
                 * bind dom event-handler
                 * @method bindDomEvents
                 * @param {string} propertyName
                 */
                bindDomEvents: function(propertyName) {
                    if (!!this.options.config[propertyName].addButton) {
                        // init add button
                        this.form.$el.on('click', this.options.config[propertyName].addButton, {propertyName: propertyName}, this.addClickHandler.bind(this));
                    }

                    if (!!this.options.config[propertyName].removeButton) {
                        // init remove button
                        this.form.$el.on('click', this.options.config[propertyName].removeButton, {propertyName: propertyName}, this.removeClickHandler.bind(this));
                    }
                },

                /**
                 * event handle for add button
                 * @method addClickHandler
                 * @param {object} event
                 */
                addClickHandler: function(event) {
                    var propertyName = event.data.propertyName,
                        tpl = this.templates[propertyName].tpl,
                        data = this.options.config[propertyName].defaultData || {};

                    if (this.canAdd(propertyName)) {
                        this.addChild(null, data, tpl, propertyName).then(function() {
                            this.updateCounter(propertyName);
                            this.emitAddEvent(propertyName, data);
                        }.bind(this));
                    }

                    this.checkFullAndEmpty.call(this, propertyName);
                },

                /**
                 * event handler for remove button
                 * @method removeClickHandler
                 * @param {object} event
                 */
                removeClickHandler: function(event) {
                    var $removeButton = $(event.currentTarget),
                        propertyName = event.data.propertyName,
                        $element = $removeButton.closest('*[data-mapper-property-tpl="' + propertyName + '"]'),
                        data;

                    if (this.canRemove(propertyName)) {
                        data = this.form.mapper.getData($element, false);

                        this.remove($element);
                        this.updateCounter(propertyName);
                        this.emitRemoveEvent(propertyName, data);
                    }

                    this.checkFullAndEmpty(propertyName);
                },

                /**
                 * removes element from form and collection
                 * @method remove
                 * @param $element
                 */
                remove: function($element) {
                    // remove all fields of element
                    $.each(Util.getFields($element), function(key, value) {
                        this.form.removeField(value);
                    }.bind(this));

                    // remove element
                    $element.remove();
                },

                /**
                 * update counter span
                 * @method updateCounter
                 * @param propertyName
                 */
                updateCounter: function(propertyName) {
                    if (!!this.options.config[propertyName].counter) {
                        $(this.options.config[propertyName].counter).text(this.getChildren(propertyName).length);
                    }
                },

                /**
                 * emit add event
                 * @method emitAddEvent
                 * @param {string} propertyName
                 * @param {object} data
                 */
                emitAddEvent: function(propertyName, data) {
                    $(this.form.$el).trigger(FORM_ADD, [propertyName, data]);
                },

                /**
                 * emit remove event
                 * @method emitRemoveEvent
                 * @param {string} propertyName
                 * @param {object} data
                 */
                emitRemoveEvent: function(propertyName, data) {
                    $(this.form.$el).trigger(FORM_REMOVE, [propertyName, data]);
                },

                /**
                 * checks collection for full and empty
                 * @method checkFullAndEmpty
                 * @param propertyName
                 */
                checkFullAndEmpty: function(propertyName) {
                    var $addButton = $(this.options.config[propertyName].addButton),
                        $removeButton = $(this.options.config[propertyName].removeButton),
                        fullClass = this.options.fullClass,
                        emptyClass = this.options.emptyClass;

                    $addButton.removeClass(fullClass);
                    $addButton.removeClass(emptyClass);
                    $(this.$el).removeClass(fullClass);
                    $(this.$el).removeClass(emptyClass);

                    if (!!$addButton.length || !!$removeButton.length) {
                        // if no add is possible add full style-classes
                        if (!this.canAdd(propertyName)) {
                            $addButton.addClass(fullClass);
                            $(this.$el).addClass(fullClass);
                        }

                        // else, if no remove is possible add empty style-classes
                        if (!this.canRemove(propertyName)) {
                            $addButton.addClass(emptyClass);
                            $(this.$el).addClass(emptyClass);
                        }
                    }
                },

                /**
                 * maps given array (value) with given templates to this.$el
                 * @method internalSetValue
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
                    len = value.length < this.getMinOccurs(propertyName) ? this.getMinOccurs(propertyName) : value.length;
                    count = len;

                    for (i = 0; i < len; i++) {
                        item = value[i] || this.options.config[propertyName].defaultData || {};

                        this.addChild(i, item, templates.tpl, propertyName).then(resolve);
                    }

                    return dfd.promise();
                },

                /**
                 * add a child to this.$el but on
                 * @method addChild
                 * @param {number} index for resulting $item dom element
                 * @param {object} item data for resulting $item dom element
                 * @param {string} template to render $item
                 * @param {string} propertyName name of property
                 * @returns {object} deferred objects that´s indicates end of asynchronous functions
                 */
                addChild: function(index, item, template, propertyName) {
                    var options, $template, tmp, dfd = $.Deferred();

                    if (typeof index === 'undefined' || index === null) {
                        index = this.getChildren(propertyName).length;
                    }

                    if (this.canAdd()) {
                        // render child
                        options = $.extend({}, {index: index}, item);
                        template = _.template(template, options, form.options.delimiter);
                        $template = $(template);

                        // set attributes to identify item
                        $template.attr('data-mapper-property-tpl', propertyName);
                        $template.attr('data-mapper-id', _.uniqueId());

                        // insert child
                        Util.insertAt(index, '> *', this.$el, $template);

                        // init fields and set data
                        this.form.initFields($template).then(function() {
                            if (!!this.options.singleValue) {
                                tmp = item;
                                item = {};
                                item[this.options.singleValue] = tmp;
                            }

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
                 * @method setValue
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
                 * returns data array
                 * @method getValue
                 * @param {string} propertyName
                 * @param {string} returnMapperId
                 * @returns {array}
                 */
                getValue: function(propertyName, returnMapperId) {
                    var $children = this.getChildren(propertyName), i, len, item, keys, result = [];

                    for (i = 0, len = $children.length; i < len; i++) {
                        item = this.form.mapper.getData($children[i], returnMapperId);
                        if (!!returnMapperId) {
                            item.mapperId = $($children[i]).data('mapperId');
                        }

                        if (!!this.options.singleValue) {
                            // for value only collection
                            keys = Object.keys(item);
                            if (item[keys[0]] !== '') {
                                result.push(item[keys[0]]);
                            }
                        } else {
                            result.push(item);
                        }
                    }

                    return result;
                },

                /**
                 * validates this type of data
                 * @method validate
                 * @returns {boolean}
                 */
                validate: function() {
                    return true;
                },

                /**
                 * indicates data to validate
                 * @method needsValidation
                 * @returns {boolean}
                 */
                needsValidation: function() {
                    return false;
                },

                /**
                 * returns children for given property
                 * @method getChildren
                 * @param {string} propertyName
                 * @returns {array}
                 */
                getChildren: function(propertyName) {
                    return this.$el.find('*[data-mapper-property-tpl="' + propertyName + '"]');
                },

                /**
                 * returns min occurs
                 * @method getMinOccurs
                 * @param {string} propertyName
                 * @returns {number}
                 */
                getMinOccurs: function(propertyName) {
                    return this.options.config[propertyName].min || this.options.min;
                },

                /**
                 * returns min occurs
                 * @method getMaxOccurs
                 * @param {string} propertyName
                 * @returns {number}
                 */
                getMaxOccurs: function(propertyName) {
                    return this.options.config[propertyName].max || this.options.max;
                },

                /**
                 * returns TRUE if a child can be added for given property
                 * @method canAdd
                 * @returns {boolean}
                 */
                canAdd: function(propertyName) {
                    var length = this.getChildren(propertyName).length;
                    return this.getMaxOccurs(propertyName) === null || length < this.getMaxOccurs(propertyName);
                },

                /**
                 * returns TRUE if a child can be removed for given property
                 * @method canRemove
                 * @returns {boolean}
                 */
                canRemove: function(propertyName) {
                    var length = this.getChildren(propertyName).length;
                    return length > this.getMinOccurs(propertyName);
                }
            };

        return new Default($el, defaults, options, 'collection', subType, form);
    };
});
