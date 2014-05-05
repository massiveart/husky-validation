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
                    this.collectionsSet = {};
                    this.templates = {};
                    this.elements = [];
                    this.collectionsInitiated = $.Deferred();

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
                        $newChild, collection,
                        dfd = $.Deferred(),
                        counter = 0,
                        resolve = function() {
                            counter--;
                            if (counter === 0) {
                                dfd.resolve();
                            }
                        };

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

                    // remove children
                    $element.html('');

                    // add to collections
                    collection = {
                        id: _.uniqueId('collection_'),
                        property: property,
                        $element: $element,
                        element: element
                    };
                    this.collections.push(collection);

                    counter += element.$children.length;
                    // iterate through collection
                    element.$children.each(function(i, child) {
                        var $child = $(child), propertyName, x, len,
                            propertyCount = 0,
                            resolveElement = function() {
                                propertyCount--;
                                if (propertyCount === 0) {
                                    resolve();
                                }
                            };

                        // attention: template has to be markuped as 'script'
                        if (!$child.is('script')) {
                            throw 'template has to be defined as <script>';
                        }

                        $newChild = {tpl: $child.html(), id: $child.attr('id'), collection: collection};
                        element.$children[i] = $newChild;

                        for (x = -1, len = property.length; ++x < len;) {
                            if (property[x].tpl === $newChild.id) {
                                propertyName = property[x].data;
                            }
                        }
                        if (!!propertyName) {
                            $newChild.propertyName = propertyName;
                            propertyCount = collection.element.getType().getMinOccurs();
                            this.templates[propertyName] = {tpl: $newChild, collection: collection};
                            // init default children
                            for (x = collection.element.getType().getMinOccurs() + 1; --x > 0;) {
                                that.appendChildren.call(this, collection.$element, $newChild).then(function() {
                                    // set counter
                                    $('#current-counter-' + propertyName).text(collection.element.getType().getChildren($newChild.id).length);
                                    resolveElement();
                                }.bind(this));
                            }
                        } else {
                            resolveElement();
                        }
                    }.bind(this));

                    $.each(property, function(i, item) {
                        // init add button
                        form.$el.on('click', '*[data-mapper-add="' + item.data + '"]', that.addClick.bind(this));

                        // init remove button
                        form.$el.on('click', '*[data-mapper-remove="' + item.data + '"]', that.removeClick.bind(this));

                        // emit collection init event after resolve
                        dfd.then(function() {
                            that.emitInitCollectionEvent(item.data);
                        });
                    }.bind(this));

                    that.checkFullAndEmpty.call(this, property[0].data);

                    dfd.then(function() {
                        Util.debug('collection resolved');
                    });

                    return dfd.promise();
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
                            that.emitAddEvent(propertyName, null);
                        }.bind(this));
                    }
                    that.checkFullAndEmpty.call(this, propertyName);
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
                        that.emitRemoveEvent(propertyName, null);
                    }
                    that.checkFullAndEmpty.call(this, propertyName);
                },

                checkFullAndEmpty: function(propertyName) {
                    var $addButton = $("[data-mapper-add='"+ propertyName +"']"),
                        $removeButton = $("[data-mapper-remove='"+ propertyName +"']"),
                        tpl = this.templates[propertyName].tpl,
                        collection = this.templates[propertyName].collection,
                        fullClass = collection.element.$el.data('mapper-full-class') || 'full',
                        emptyClass = collection.element.$el.data('mapper-empty-class') || 'empty';

                    $addButton.removeClass(fullClass);
                    $addButton.removeClass(emptyClass);
                    $(collection.element.$el).removeClass(fullClass);
                    $(collection.element.$el).removeClass(emptyClass);

                    if (!!$addButton.length || !!$removeButton.length) {
                        // if no add is possible add full style-classes
                        if (!collection.element.getType().canAdd(tpl.id)) {
                            $addButton.addClass(fullClass);
                            $(collection.element.$el).addClass(fullClass);

                        // else, if no remove is possible add empty style-classes
                        } else if (!collection.element.getType().canRemove(tpl.id)) {
                            $addButton.addClass(emptyClass);
                            $(collection.element.$el).addClass(emptyClass);

                        }
                    }
                },

                emitInitCollectionEvent: function(propertyName) {
                    $(form.$el).trigger('form-collection-init', [propertyName]);
                },

                emitAddEvent: function(propertyName, data) {
                    $(form.$el).trigger('form-add', [propertyName, data]);
                },

                emitRemoveEvent: function(propertyName, data) {
                    $(form.$el).trigger('form-remove', [propertyName, data]);
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
                                item.mapperId = value.dataset.mapperId;

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
                        $child = collectionElement.$child,
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
                        if (collection.length < collectionElement.element.getType().getMinOccurs()) {
                            for (x = collectionElement.element.getType().getMinOccurs() + 1, len = collection.length; --x > len;) {
                                collection.push({});
                            }
                        }

                        // foreach collection elements: create a new dom element, call setData recursively
                        $.each(collection, function(key, value) {
                            that.appendChildren.call(this, $element, $child, value).then(function($newElement) {
                                that.setData.call(this, value, $newElement).then(function() {
                                    resolve();
                                }.bind(this));
                            }.bind(this));
                        }.bind(this));
                    }

                    // set current length of collection
                    $('#current-counter-' + $element.attr('id')).text(collection.length);
                    that.checkFullAndEmpty.call(this, collectionElement.property[0].data);
                    return dfd.promise();
                },

                appendChildren: function($element, $child, tplOptions, data, insertAfter) {
                    var index = $child.collection.element.getType().getChildren($child.id).length,
                        options = $.extend({}, {index: index}, tplOptions || {}),
                        template = _.template($child.tpl, options, form.options.delimiter),
                        $template = $(template),
                        $newFields = Util.getFields($template),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        element;

                    // adding
                    $template.attr('data-mapper-property-tpl', $child.id);
                    $template.attr('data-mapper-id', _.uniqueId());

                    // add fields
                    $.each($newFields, function(key, field) {
                        element = form.addField($(field));
                        if (insertAfter) {
                            $element.after($template);
                        } else {
                            $element.append($template);
                        }
                        element.initialized.then(function() {
                            counter--;
                            if (counter === 0) {
                                dfd.resolve($template);
                            }
                        });
                    }.bind(this));

                    // if automatically set data after initialization ( needed for adding elements afterwards)
                    if (!!data) {
                        dfd.then(function() {
                            that.setData.call(this, data, $newFields);
                        });
                    }

                    // push element to global array
                    this.elements.push($template);

                    return dfd.promise();
                },

                /**
                 * Returns a collection element for a given mapper-id
                 * @param {number} mapperId
                 * @return {Object|null} the dom object or null
                 **/
                getElementByMapperId: function(mapperId) {
                    for (var i = -1, length = this.elements.length; ++i < length;) {
                        if (this.elements[i].data('mapper-id') === mapperId) {
                            return this.elements[i];
                        }
                    }
                    return null;
                },

                /**
                 * Delets an element from the DOM and the global object by a given unique-id
                 * @param {number} mapperId
                 * @return {boolean} true if an element was found and deleted
                 **/
                deleteElementByMapperId: function(mapperId) {
                    for (var i = -1, length = this.elements.length; ++i < length;) {
                        if (this.elements[i].data('mapper-id') === mapperId) {
                            this.elements[i].remove();
                            this.elements.splice(i, 1);
                            return true;
                        }
                    }
                    return false;
                },

                remove: function($element) {
                    // remove all fields of element
                    $.each(Util.getFields($element), function(key, value) {
                        form.removeField(value);
                    }.bind(this));

                    // remove element
                    $element.remove();
                },

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
                                element.setValue(data).then(function() {
                                    // resolve this set data
                                    resolve();
                                });
                            }.bind(this));
                        } else {
                            element.setValue(data).then(function() {
                                // resolve this set data
                                resolve();
                            });
                        }
                    } else if (data !== null && !$.isEmptyObject(data)) {
                        count = Object.keys(data).length;
                        $.each(data, function(key, value) {
                            var $element, element, collection;

                            // if field is a collection
                            if ($.isArray(value) && this.templates.hasOwnProperty(key)) {
                                collection = this.templates[key].collection;
                                collection.$child = this.templates[key].tpl;

                                // if first element of collection, clear collection
                                if (!this.collectionsSet.hasOwnProperty(collection.id)) {
                                    collection.$element.children().each(function(key, value) {
                                        that.remove.call(this, $(value));
                                    }.bind(this));
                                }
                                this.collectionsSet[collection.id] = true;

                                that.setCollectionData.call(this, value, collection).then(function() {
                                    resolve();
                                });
                            } else {
                                // search field with mapper property
                                selector = '*[data-mapper-property="' + key + '"]';
                                $element = $el.andSelf().find(selector);

                                element = $element.data('element');

                                if ($element.length > 0) {
                                    // if element is not in form add it
                                    if (!element) {
                                        element = form.addField($element);
                                        element.initialized.then(function() {
                                            element.setValue(value).then(function() {
                                                resolve();
                                            });
                                        }.bind(this));
                                    } else {
                                        element.setValue(value).then(function() {
                                            resolve();
                                        });
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

            },

        // define mapper interface
            result = {
                setData: function(data, $el) {
                    this.collectionsSet = {};

                    return that.setData.call(this, data, $el);
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
                },

                /**
                 * adds an element to a existing collection
                 * @param {String} propertyName property defined by 'data' attribute in data-mapper-property
                 * @param {Object} [data] Possibility to set data
                 * @param {Boolean} [append=false] Define if element should be added at the end of the collection. By default items are grouped by tpl name
                 */
                addToCollection: function(propertyName, data, append) {
                    var template = this.templates[propertyName],
                        element = template.collection.$element,
                        insertAfterLast = false,
                        lastElement;
                    // check if element exists and put it after last
                    if (!append && (lastElement = element.find('*[data-mapper-property-tpl="' + template.tpl.id + '"]').last()).length > 0) {
                        element = lastElement;
                        insertAfterLast = true;
                    }
                    that.appendChildren.call(this, element, template.tpl, data, data, insertAfterLast);
                },

                /**
                 * Edits a field in an collection
                 * @param mapperId {Number} the unique Id of the field
                 * @param data {Object} new data to apply
                 */
                editInCollection: function(mapperId, data) {
                    var $element = that.getElementByMapperId.call(this, mapperId);
                    that.setData.call(this, data, $element);
                },

                /**
                 * Removes a field from a collection
                 * @param mapperId {Number} the unique Id of the field
                 */
                removeFromCollection: function(mapperId) {
                    that.deleteElementByMapperId.call(this, mapperId);
                }
            };

        that.initialize.call(result);
        return result;
    };

});
