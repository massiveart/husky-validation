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
], function(Util) {

    'use strict';

    return function(form) {

        var filters = {},

        // private functions
            that = {
                initialize: function() {
                    Util.debug('INIT Mapper');

                    form.initialized.then(function() {
                        var selector = '*[data-type="array"]',
                            $elements = form.$el.find(selector);

                        $elements.each(that.initArray.bind(this));
                    });
                },

                initArray: function(key, value) {
                    var $element = $(value),
                        element = $element.data('element');

                    // save first child element
                    element.$children = $element.children().first().clone();

                    // init add button
                    form.$el.on('click', '*[data-mapper-add="' + $element.data('mapper-property') + '"]', that.addClick.bind(this));

                    // init remove button
                    form.$el.on('click', '*[data-mapper-remove="' + $element.data('mapper-property') + '"]', that.removeClick.bind(this));
                },

                addClick: function(event) {
                    var $addButton = $(event.currentTarget),
                        propertyName = $addButton.data('mapper-add'),
                        $arrayElement = $('#' + propertyName),
                        arrayElement = $arrayElement.data('element');

                    if (arrayElement.getType().canAdd()) {
                        that.appendChildren.call(this, $arrayElement, arrayElement.$children);

                        $('#current-counter-' + $arrayElement.data('mapper-property')).text($arrayElement.children().length);
                    }
                },

                removeClick: function(event) {
                    var $removeButton = $(event.currentTarget),
                        propertyName = $removeButton.data('mapper-remove'),
                        $arrayElement = $('#' + propertyName),
                        $element = $removeButton.closest('.' + propertyName + '-element'),
                        arrayElement = $arrayElement.data('element');

                    if (arrayElement.getType().canRemove()) {
                        that.remove.call(this, $element);
                    }
                },

                processData: function(el) {
                    // get attributes
                    var $el = $(el),
                        type = $el.data('type'),
                        property = $el.data('mapper-property'),
                        element = $el.data('element'),
                        result, item;

                    // if type == array process children, else get value
                    if (type !== 'array') {
                        if (!!element) {
                            return element.getValue();
                        } else {
                            return null;
                        }
                    } else {
                        result = [];
                        $.each($el.children(), function(key, value) {
                            item = form.mapper.getData($(value));

                            var keys = Object.keys(item);
                            if (keys.length === 1) { // for value only array
                                if (item[keys[0]] !== '') {
                                    result.push(item[keys[0]]);
                                }
                            } else if (!filters[property] || (!!filters[property] && filters[property](item))) {
                                result.push(item);
                            }
                        });
                        return result;
                    }
                },

                setArrayData: function(array, $element) {
                    // remember first child remove the rest
                    var arrayElement = $element.data('element'),
                        $child = arrayElement.$children;

                    // remove children
                    $element.children().each(function(key, value) {
                        that.remove.call(this, $(value));
                    }.bind(this));

                    // foreach array elements: create a new dom element, call setData recursively
                    $.each(array, function(key, value) {
                        that.appendChildren($element, $child).then(function($newElement) {
                            form.mapper.setData(value, $newElement);
                        });
                    });
                },

                appendChildren: function($element, $child) {
                    var $newElement = $child.clone(),
                        $newFields = Util.getFields($newElement),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        element;

                    $element.append($newElement);

                    // add fields
                    $.each($newFields, function(key, field) {
                        element = form.addField($(field));
                        element.initialized.then(function() {
                            counter--;
                            if (counter === 0) {
                                dfd.resolve($newElement);
                            }
                        });
                    }.bind(this));

                    return dfd.promise();
                },

                remove: function($element) {
                    // remove all fields of element
                    $.each(Util.getFields($element), function(key, value) {
                        form.removeField(value);
                    }.bind(this));

                    // remove element
                    $element.remove();
                }

            },

        // define mapper interface
            result = {
                setData: function(data, $el) {
                    if (!$el) {
                        $el = form.$el;
                    }

                    $.each(data, function(key, value) {
                        // search field with mapper property
                        var selector = '*[data-mapper-property="' + key + '"]',
                            $element = $el.find(selector),
                            element = $element.data('element');

                        if ($element.length > 0) {
                            // if field is an array
                            if ($.isArray(value)) {
                                that.setArrayData.call(this, value, $element);
                            } else {
                                // if element is not in form add it
                                if (!element) {
                                    element = form.addField($element);
                                    element.initialized.then(function() {
                                        element.setValue(value);
                                    });
                                } else {
                                    element.setValue(value);
                                }
                            }
                        }
                    }.bind(this));
                },

                getData: function($el) {
                    if (!$el) {
                        $el = form.$el;
                    }

                    var data = { }, $childElement, property, parts,

                    // search field with mapper property
                        selector = '*[data-mapper-property]',
                        $elements = $el.find(selector);

                    // do it while elements exists
                    while ($elements.length > 0) {
                        // get first
                        $childElement = $($elements.get(0));
                        property = $childElement.data('mapper-property');

                        if (property.match(/.*\..*/)) {
                            parts = property.split('.');
                            data[parts[0]] = {};
                            data[parts[0]][parts[1]] = that.processData.call(this, $childElement);
                        } else {
                            // process it
                            data[property] = that.processData.call(this, $childElement);
                        }

                        // remove element itself
                        $elements = $elements.not($childElement);

                        // remove child elements
                        $elements = $elements.not($childElement.find(selector));
                    }

                    return data;
                },

                addArrayFilter: function(name, callback) {
                    filters[name] = callback;
                },

                removeArrayFilter: function(name) {
                    delete filters[name];
                }

            };

        that.initialize.call(result);
        return result;
    };

});
