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
                        var selector = '*[data-type="collection"]',
                            $elements = form.$el.find(selector);

                        $elements.each(that.initCollection.bind(this));
                    });
                },

                initCollection: function(key, value) {
                    var $element = $(value),
                        element = $element.data('element');

                    // save first child element
                    element.$children = $element.children().first().clone();
                    element.$children.find('*').removeAttr('id');

                    // init add button
                    form.$el.on('click', '*[data-mapper-add="' + $element.data('mapper-property') + '"]', that.addClick.bind(this));

                    // init remove button
                    form.$el.on('click', '*[data-mapper-remove="' + $element.data('mapper-property') + '"]', that.removeClick.bind(this));
                },

                addClick: function(event) {
                    var $addButton = $(event.currentTarget),
                        propertyName = $addButton.data('mapper-add'),
                        $collectionElement = $('#' + propertyName),
                        collectionElement = $collectionElement.data('element');

                    if (collectionElement.getType().canAdd()) {
                        that.appendChildren.call(this, $collectionElement, collectionElement.$children);

                        $('#current-counter-' + $collectionElement.data('mapper-property')).text($collectionElement.children().length);
                    }
                },

                removeClick: function(event) {
                    var $removeButton = $(event.currentTarget),
                        propertyName = $removeButton.data('mapper-remove'),
                        $collectionElement = $('#' + propertyName),
                        $element = $removeButton.closest('.' + propertyName + '-element'),
                        collectionElement = $collectionElement.data('element');

                    if (collectionElement.getType().canRemove()) {
                        that.remove.call(this, $element);

                        $('#current-counter-' + $collectionElement.data('mapper-property')).text($collectionElement.children().length);
                    }
                },

                processData: function(el) {
                    // get attributes
                    var $el = $(el),
                        type = $el.data('type'),
                        property = $el.data('mapper-property'),
                        element = $el.data('element'),
                        result, item;

                    // if type == collection process children, else get value
                    if (type !== 'collection') {
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
                            if (keys.length === 1) { // for value only collection
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

                setCollectionData: function(collection, $el) {

                    // remember first child remove the rest
                    var $element = $($el[0]),
                        collectionElement = $element.data('element'),
                        $child = collectionElement.$children;

                    // remove children
                    $element.children().each(function(key, value) {
                        that.remove.call(this, $(value));
                    }.bind(this));

                    // foreach collection elements: create a new dom element, call setData recursively
                    $.each(collection, function(key, value) {
                        that.appendChildren($element, $child).then(function($newElement) {
                            form.mapper.setData(value, $newElement);
                        });
                    });

                    // set current length of collection
                    $('#current-counter-' + $element.data('mapper-property')).text(collection.length);
                },

                appendChildren: function($element, $child) {
                    var $newElement =$child.clone(),
                        $newFields = Util.getFields($newElement),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        element;

                    // add fields
                    $.each($newFields, function(key, field) {
                        element = form.addField($(field));
                        element.initialized.then(function() {
                            counter--;
                            if (counter === 0) {
                                $element.append($newElement);
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

                    if (typeof data !== 'object') {
                        var selector = '*[data-mapper-property]',
                            $element = $el.find(selector),
                            element = $element.data('element');
                        // if element is not in form add it
                        if (!element) {
                            element = form.addField($element);
                            element.initialized.then(function() {
                                element.setValue(data);
                            });
                        } else {
                            element.setValue(data);
                        }
                    } else {
                        $.each(data, function(key, value) {
                            // search field with mapper property
                            var selector = '*[data-mapper-property="' + key + '"]',
                                $element = $el.find(selector),
                                element = $element.data('element');

                            if ($element.length > 0) {
                                // if field is an collection
                                if ($.isArray(value)) {
                                    that.setCollectionData.call(this, value, $element);
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
                    }
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

                addCollectionFilter: function(name, callback) {
                    filters[name] = callback;
                },

                removeCollectionFilter: function(name) {
                    delete filters[name];
                }

            };

        that.initialize.call(result);
        return result;
    };

});
