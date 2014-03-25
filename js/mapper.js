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

                    this.collections = [];
                    this.templates = {};

                    form.initialized.then(function() {
                        var selector = '*[data-type="collection"]',
                            $elements = form.$el.find(selector);

                        $elements.each(that.initCollection.bind(this));
                    }.bind(this));
                },

                initCollection: function(key, value) {
                    var $element = $(value),
                        element = $element.data('element'),
                        property = $element.data('mapper-property'),
                        $newChild, collection, x;

                    if (!$.isArray(property)) {
                        if (typeof property === 'object') {
                            property = [property];
                            $element.data('mapper-property', property);
                        } else {
                            throw "no valid mapper-property value";
                        }
                    }

                    // get templates
                    element.$children = $element.children().clone(true);

                    collection = {
                        property: property,
                        $element: $element,
                        element: element
                    };

                    // iterate through collection
                    element.$children.each(function(i, child) {
                        var $child = $(child), propertyName, x, len;

                        // attention: template has to be markuped as 'script'
                        if (!$child.is('script')) {
                            throw 'template has to be defined as <script>';
                        }

                        $newChild = {tpl: $child.html(), id: $child.attr('id')};
                        element.$children[i] = $newChild;

                        for (x = -1, len = property.length; ++x < len;) {
                            if (property[x].tpl === $newChild.id) {
                                propertyName = property[x].data;
                            }
                        }
                        if (!!propertyName) {
                            this.templates[propertyName] = {tpl: $newChild, collection: collection};
                            // init default children
                            for (x = collection.element.getType().getMinOccurs() + 1; --x > 0;) {
                                that.appendChildren.call(this, collection.$element, $newChild).then(function() {
                                    // set counter
                                    $('#current-counter-' + propertyName).text(collection.element.getType().getChildren($newChild.id).length);
                                }.bind(this));
                            }
                        }
                    }.bind(this));

                    // add to collections
                    this.collections.push(collection);

                    $.each(property, function(i, item) {
                        // init add button
                        form.$el.on('click', '*[data-mapper-add="' + item.data + '"]', that.addClick.bind(this));

                        // init remove button
                        form.$el.on('click', '*[data-mapper-remove="' + item.data + '"]', that.removeClick.bind(this));
                    }.bind(this));
                },

                addClick: function(event) {
                    var $addButton = $(event.currentTarget),
                        propertyName = $addButton.data('mapper-add'),
                        tpl = this.templates[propertyName].tpl,
                        collection = this.templates[propertyName].collection;

                    if (collection.element.getType().canAdd(tpl.id)) {
                        that.appendChildren.call(this, collection.$element, tpl).then(function() {
                            // set counter
                            $('#current-counter-' + propertyName).text(collection.element.getType().getChildren(tpl.id).length);
                        }.bind(this));
                    }
                },

                removeClick: function(event) {
                    var $removeButton = $(event.currentTarget),
                        propertyName = $removeButton.data('mapper-remove'),
                        tpl = this.templates[propertyName].tpl,
                        collection = this.templates[propertyName].collection,
                        $element = $removeButton.closest('.' + propertyName + '-element');

                    if (collection.element.getType().canRemove(tpl.id)) {
                        that.remove.call(this, $element);
                        // set counter
                        $('#current-counter-' + propertyName).text(collection.element.getType().getChildren(tpl.id).length);
                    }
                },

                processData: function(el, collection) {
                    // get attributes
                    var $el = $(el),
                        type = $el.data('type'),
                        property = $el.data('mapper-property'),
                        element = $el.data('element'),
                        result, item,
                        filtersAction;


                    if (collection && !!filters[collection.data]) {
                        filtersAction = filters[collection.data];
                    } else if (!!filters[property]) {
                        filtersAction = filters[property];
                    }

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
                            if (!collection || collection.tpl === value.dataset.mapperPropertyTpl) {
                                item = form.mapper.getData($(value));

                                var keys = Object.keys(item);
                                if (keys.length === 1) { // for value only collection
                                    if (item[keys[0]] !== '') {
                                        result.push(item[keys[0]]);
                                    }
                                } else if (!filtersAction || filtersAction(item)) {
                                    result.push(item);
                                }
                            }
                        });
                        return result;
                    }
                },

                setCollectionData: function(collection, collectionElement) {

                    // remember first child remove the rest
                    var $element = collectionElement.$element,
                        $child = collectionElement.$child.get(0),
                        count = collection.length,
                        dfd = $.Deferred(),
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        },
                        x, len;

                    // no element in collection
                    if (count === 0) {
                        dfd.resolve();
                    } else {
                        // remove children
                        $element.children().each(function(key, value) {
                            that.remove.call(this, $(value));
                        }.bind(this));

                        if (collection.length < collectionElement.element.getType().getMinOccurs()) {
                            for (x = collectionElement.element.getType().getMinOccurs() + 1, len = collection.length; --x > len;) {
                                collection.push({});
                            }
                        }

                        // foreach collection elements: create a new dom element, call setData recursively
                        $.each(collection, function(key, value) {
                            that.appendChildren($element, $child, value).then(function($newElement) {
                                form.mapper.setData(value, $newElement).then(function() {
                                    resolve();
                                });
                            });
                        });
                    }

                    // set current length of collection
                    $('#current-counter-' + $element.attr('id')).text(collection.length);

                    return dfd.promise();
                },

                appendChildren: function($element, $child, value) {
                    value = value || {};
                    var template = _.template($child.tpl, value, form.options.delimiter),
                        $template = $(template),
                        $newFields = Util.getFields($template),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        element;

                    // adding
                    $template.attr('data-mapper-property-tpl', $child.id);

                    // add fields
                    $.each($newFields, function(key, field) {
                        element = form.addField($(field));
                        element.initialized.then(function() {
                            counter--;
                            if (counter === 0) {
                                $element.append($template);
                                dfd.resolve($template);
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

                    var dfd = $.Deferred(),
                        selector,
                        $element,
                        element,
                        count = 1,
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        };

                    if (typeof data !== 'object') {
                        selector = '*[data-mapper-property]';
                        $element = $el.find(selector);
                        element = $element.data('element');
                        // if element is not in form add it
                        if (!element) {
                            element = form.addField($element);
                            element.initialized.then(function() {
                                element.setValue(data);
                                // resolve this set data
                                resolve();
                            });
                        } else {
                            element.setValue(data);
                            // resolve this set data
                            resolve();
                        }
                    } else if (data !== null && !$.isEmptyObject(data)) {
                        count = Object.keys(data).length;
                        $.each(data, function(key, value) {
                            var $element, element, colprop,
                            // search for occurence  in collections
                                collection = $.grep(this.collections, function(col) {
                                    // if collection is array and "data" == key
                                    if ($.isArray(col.property) && (colprop = $.grep(col.property, function(prop) {
                                        return prop.data === key;
                                    })).length > 0) {
                                        // get template of collection
                                        col.$child = $($.grep(col.element.$children, function(el) {
                                            return (el.id === colprop[0].tpl);
                                        })[0]);
                                        return true;
                                    }
                                    return false;
                                });

                            // if field is a collection
                            if ($.isArray(value) && collection.length > 0) {
                                that.setCollectionData.call(this, value, collection[0]).then(function() {
                                    resolve();
                                });
                            } else {
                                // search field with mapper property
                                selector = '*[data-mapper-property="' + key + '"]';
                                $element = $el.find(selector);
                                element = $element.data('element');

                                if ($element.length > 0) {
                                    // if element is not in form add it
                                    if (!element) {
                                        element = form.addField($element);
                                        element.initialized.then(function() {
                                            element.setValue(value);
                                            resolve();
                                        });
                                    } else {
                                        element.setValue(value);
                                        resolve();
                                    }
                                } else {
                                    resolve();
                                }
                            }
                        }.bind(this));
                    } else {
                        dfd.resolve();
                    }

                    return dfd.promise();
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

                        if ($.isArray(property)) {
                            $.each(property, function(i, prop) {
                                data[prop.data] = that.processData.call(this, $childElement, prop);
                            });
                        } else if (property.match(/.*\..*/)) {
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
