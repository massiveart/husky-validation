/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

// TODO yui doc

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

                addEmptyTemplate: function($element, propertyName) {
                    if (this.emptyTemplates.hasOwnProperty(propertyName)) {
                        var $emptyTemplate = $(this.emptyTemplates[propertyName].tpl);
                        $emptyTemplate.attr('id', this.emptyTemplates[propertyName].id);
                        $element.append($emptyTemplate);
                    }
                },

                processData: function(el, propertyName, returnMapperId) {
                    // get attributes
                    var $el = $(el),
                        element = $el.data('element'),
                        filterAction = filters[propertyName],
                        value = element.getValue(propertyName, returnMapperId),
                        result = [],
                        i, len;

                    // filter result
                    if (!!filterAction) {
                        if ($.isArray(value)) {
                            for (i = 0, len = value.length; i < len; i++) {
                                if (filterAction(value[i])) {
                                    result.push(value[i]);
                                }
                            }
                        } else {
                            if (filterAction(value)) {
                                result = value;
                            } else {
                                result = null;
                            }
                        }
                    } else {
                        result = value;
                    }

                    return result;
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

                getData: function($el, returnMapperId) {
                    if (!$el) {
                        $el = form.$el;
                    }
                    // fix dom node bug
                    $el = $($el);

                    var data = {}, $childElement, properties, parts, i, len, property,

                    // search field with mapper property
                        selector = '*[data-mapper-property]',
                        $elements = $el.find(selector);

                    // do it while elements exists
                    while ($elements.length > 0) {
                        // get first
                        $childElement = $($elements.get(0));
                        properties = $childElement.data('mapperProperty').split(',');

                        for (i = 0, len = properties.length; i < len; i++) {
                            property = properties[i];

                            if (property.match(/.*\..*/)) {
                                parts = property.split('.');
                                data[parts[0]] = {};
                                data[parts[0]][parts[1]] = that.processData.call(this, $childElement, parts[0], returnMapperId);
                            } else {
                                data[property] = that.processData.call(this, $childElement, property, returnMapperId);
                            }
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
