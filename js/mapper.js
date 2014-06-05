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
                    this.emptyTemplates = {};
                    this.templates = {};
                    this.elements = [];
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

                addEmptyTemplate: function($element, propertyName) {
                    if (this.emptyTemplates.hasOwnProperty(propertyName)) {
                        var $emptyTemplate = $(this.emptyTemplates[propertyName].tpl);
                        $emptyTemplate.attr('id', this.emptyTemplates[propertyName].id);
                        $element.append($emptyTemplate);
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
                        that.emitRemoveEvent(propertyName, null);
                    }
                    that.checkFullAndEmpty.call(this, propertyName);
                },

                checkFullAndEmpty: function(propertyName) {
                    var $addButton = $("[data-mapper-add='" + propertyName + "']"),
                        $removeButton = $("[data-mapper-remove='" + propertyName + "']"),
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

                processData: function(el, collection, returnMapperId) {
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
                                item = that.getData($(value));
                                // only set mapper-id if explicitly set
                                if (!!returnMapperId) {
                                    item.mapperId = value.dataset.mapperId;
                                }

                                var keys = Object.keys(item);
                                if (keys.length === 1) { // for value only collection
                                    if (item[keys[0]] !== '') {
                                        result.push(item[keys[0]]);
                                    }
                                } else if (!filtersAction || filtersAction(item)) {
                                    result.push(item);
                                }
                            }
                        }.bind(this));
                        return result;
                    }
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
                 * @return {boolean|string} if an element was found and deleted it returns its template-name, else it returns false
                 **/
                deleteElementByMapperId: function(mapperId) {
                    var i, length, templateName;
                    for (i = -1, length = this.elements.length; ++i < length;) {
                        if (this.elements[i].data('mapper-id').toString() === mapperId.toString()) {
                            templateName = this.elements[i].attr('data-mapper-property-tpl');
                            this.elements[i].remove();
                            this.elements.splice(i, 1);
                            return templateName;
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

                getData: function($el, returnMapperId) {
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
                                data[prop.data] = that.processData.call(this, $childElement, prop, returnMapperId);
                            }.bind(this));
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
                                element.setValue(data, 'TODO').then(function() {
                                    // resolve this set data
                                    resolve();
                                });
                            }.bind(this));
                        } else {
                            element.setValue(data, 'TODO').then(function() {
                                // resolve this set data
                                resolve();
                            });
                        }
                    } else if (data !== null && !$.isEmptyObject(data)) {
                        count = Object.keys(data).length;
                        $.each(data, function(key, value) {
                            var $element, element;

                            // search field with mapper property
                            selector = '*[data-mapper-property*="' + key + '"]';
                            $element = $el.andSelf().find(selector);

                            element = $element.data('element');

                            if ($element.length > 0) {
                                // if element is not in form add it
                                if (!element) {
                                    element = form.addField($element);
                                    element.initialized.then(function() {
                                        element.setValue(value, key).then(function() {
                                            resolve();
                                        });
                                    }.bind(this));
                                } else {
                                    element.setValue(value, key).then(function() {
                                        resolve();
                                    });
                                }
                            } else {
                                resolve();
                            }
                        }.bind(this));
                    } else {
                        dfd.resolve();
                    }

                    return dfd.promise();
                }

            },

        // define mapper interface
            result = {

                setData: function(data, $el) {
                    this.collectionsSet = {};

                    return that.setData.call(this, data, $el);
                },

                /**
                 * extracts data from $element or default form element
                 *  @param {Object} [$el=undefined] element to select data from
                 *  @param {Boolean} [returnMapperId=false] returnMapperId
                 */
                getData: function($el, returnMapperId) {
                    return that.getData.call(this, $el, returnMapperId);
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
                        lastElement,
                        $emptyTpl,
                        dfd = $.Deferred();

                    // check if element exists and put it after last
                    if (!append && (lastElement = element.find('*[data-mapper-property-tpl="' + template.tpl.id + '"]').last()).length > 0) {
                        element = lastElement;
                        insertAfterLast = true;
                    }
                    // check if empty template is set and lookup in dom
                    if (template.emptyTemplate) {
                        $emptyTpl = $(element).find('#' + template.emptyTemplate);
                        if ($emptyTpl) {
                            $emptyTpl.remove();
                        }
                    }

                    that.appendChildren.call(this, element, template.tpl, data, data, insertAfterLast).then(function($element) {
                        dfd.resolve($element);
                    }.bind(this));

                    return dfd;
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
                    var i,
                        templateName = that.deleteElementByMapperId.call(this, mapperId);

                    // check if collection still has elements with propertyName, else render empty Template
                    if (form.$el.find('*[data-mapper-property-tpl=' + templateName + ']').length < 1) {
                        // get collection with is owner of templateName
                        for (i in this.templates) {
                            // if emptyTemplates is set
                            if (this.templates[i].tpl.id === templateName) {
                                that.addEmptyTemplate.call(this, this.templates[i].collection.$element, i);
                                return;
                            }
                        }
                    }

                }
            };

        that.initialize.call(result);
        return result;
    };

});
