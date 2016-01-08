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
                        newChild, collection, emptyTemplate,
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
                            throw 'no valid mapper-property value';
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
                        element: element,
                        items: []
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

                        newChild = {tpl: $child.html(), id: $child.attr('id'), collection: collection};
                        element.$children[i] = newChild;

                        for (x = -1, len = property.length; ++x < len;) {
                            if (property[x].tpl === newChild.id) {
                                propertyName = property[x].data;
                                emptyTemplate = property[x]['empty-tpl'];
                            }
                            // if child has empty template, set to empty templates
                            if (property[x]['empty-tpl'] && property[x]['empty-tpl'] === newChild.id) {
                                this.emptyTemplates[property[x].data] = {
                                    id: property[x]['empty-tpl'],
                                    tpl: $child.html()
                                };
                            }
                        }
                        // check if template is set
                        if (!!propertyName) {
                            newChild.propertyName = propertyName;
                            propertyCount = collection.element.getType().getMinOccurs();
                            this.templates[propertyName] = {
                                tpl: newChild,
                                collection: collection,
                                emptyTemplate: emptyTemplate,
                            };
                            // init default children
                            for (x = collection.element.getType().getMinOccurs() + 1; --x > 0;) {
                                that.appendChildren.call(this, collection, newChild).then(function() {
                                    // set counter
                                    $('#current-counter-' + propertyName).text(collection.element.getType().getChildren(newChild.id).length);
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
                        that.appendChildren.call(this, collection, tpl).then(function() {
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
                        result,
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
                                var elements = $(value).data('collection').childElements,
                                    elementGroups = $(value).data('collection').childElementGroups,
                                    data = {};

                                elements.forEach(function(child) {
                                    that.addDataFromElement.call(this, child, data, returnMapperId);
                                });

                                for (key in elementGroups) {
                                    if (elementGroups.hasOwnProperty(key)) {
                                        data[key] = elementGroups[key].getValue();
                                    }
                                }

                                // only set mapper-id if explicitly set
                                if (!!returnMapperId) {
                                    data.mapperId = value.dataset.mapperId;
                                }

                                var keys = Object.keys(data);
                                if (keys.length === 1) { // for value only collection
                                    if (data[keys[0]] !== '') {
                                        result.push(data[keys[0]]);
                                    }
                                } else if (!filtersAction || filtersAction(data)) {
                                    result.push(data);
                                }
                            }
                        }.bind(this));
                        return result;
                    }
                },

                setCollectionData: function(data, collection) {
                    // remember first child remove the rest
                    var $element = collection.$element,
                        child = this.templates[collection.key].tpl,
                        count = data.length,
                        dfd = $.Deferred(),
                        resolve = function() {
                            count--;
                            if (count === 0) {
                                dfd.resolve();
                            }
                        },
                        x,
                        length;

                    // no element in collection
                    if (count === 0) {
                        // check if empty template exists for that element and show it
                        that.addEmptyTemplate.call(this, $element, child.propertyName);
                        dfd.resolve();
                    } else {
                        if (data.length < collection.element.getType().getMinOccurs()) {
                            for (x = collection.element.getType().getMinOccurs() + 1, length = data.length; --x > length;) {
                                data.push({});
                            }
                        }

                        // FIXME the old DOM elements should be reused, instead of generated over and over again
                        // remove all prefilled items from the collection, because the DOM elements are recreated
                        collection.items = [];

                        // foreach collection elements: create a new dom element, call setData recursively
                        $.each(data, function(key, value) {
                            that.appendChildren.call(this, collection, child, value).then(function($newElement) {
                                that.setData.call(this, value, $newElement).then(function() {
                                    resolve();
                                }.bind(this));
                            }.bind(this));
                        }.bind(this));
                    }

                    // set current length of collection
                    $('#current-counter-' + $element.attr('id')).text(data.length);
                    that.checkFullAndEmpty.call(this, collection.property[0].data);
                    return dfd.promise();
                },

                appendChildren: function(collection, child, tplOptions, data, insertAfter) {
                    var clonedChild = $.extend(true, {}, child),
                        index = clonedChild.collection.element.getType().getChildren(clonedChild.id).length,
                        options = $.extend({}, {index: index}, tplOptions || {}),
                        template = _.template(clonedChild.tpl, options, form.options.delimiter),
                        $template = $(template),
                        $newFields = Util.getFields($template),
                        $radioFields = Util.getRadios($template),
                        $checkboxFields = Util.getCheckboxes($template),
                        dfd = $.Deferred(),
                        counter = $newFields.length,
                        $element = collection.$element,
                        $lastElement,
                        element;

                    // adding
                    $template.attr('data-mapper-property-tpl', clonedChild.id);
                    $template.attr('data-mapper-id', _.uniqueId());

                    // add template to element
                    if (insertAfter && ($lastElement = $element.find('*[data-mapper-property-tpl="' + clonedChild.id + '"]').last()).length > 0) {
                        $lastElement.after($template);
                    } else {
                        $element.append($template);
                    }

                    clonedChild.collection.childElements = [];
                    clonedChild.collection.childElementGroups = {};
                    // add fields
                    if ($newFields.length > 0) {
                        $newFields.each(function(key, field) {
                            element = form.createField($(field));
                            clonedChild.collection.childElements.push(element);
                            element.initialized.then(function() {
                                counter--;
                                if (counter === 0) {
                                    dfd.resolve($template);
                                }
                            });
                        }.bind(this));
                    } else {
                        dfd.resolve($template);
                    }

                    if (_.size($radioFields) > 0) {
                        $.each($radioFields, function(key, field) {
                            clonedChild.collection.childElementGroups[key] = form.createFieldGroup(field, true);
                        });
                    }
                    if (_.size($checkboxFields) > 0) {
                        $.each($checkboxFields, function(key, field) {
                            clonedChild.collection.childElementGroups[key] = form.createFieldGroup(field, false);
                        });
                    }

                    $template.data('collection', clonedChild.collection);

                    // if automatically set data after initialization ( needed for adding elements afterwards)
                    if (!!data) {
                        dfd.then(function() {
                            that.setData.call(this, data, $newFields);
                        }.bind(this));
                    }

                    collection.items.push($template);

                    return dfd.promise();
                },

                /**
                 * Returns a collection element for a given mapper-id
                 * @param {number} mapperId
                 * @return {Object|null} the dom object or null
                 **/
                getElementByMapperId: function(mapperId) {
                    for (var i = -1, iLength = this.collections.length; ++i < iLength;) {
                        for (var j = -1, jLength = this.collections[i].items.length; ++j < jLength;) {
                            if (this.collections[i].items[j].data('mapper-id') === mapperId) {
                                return this.collections[i].items[j];
                            }
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
                    var templateName;

                    $.each(this.collections, function(i, collection) {
                        $.each(collection.items, function(j, item) {
                            if (item.data('mapper-id').toString() !== mapperId.toString()) {
                                return true;
                            }

                            templateName = item.attr('data-mapper-property-tpl');
                            item.remove();
                            collection.items.splice(j, 1);

                            return false;
                        });
                    }.bind(this));

                    return templateName;
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
                                collection.key = key;

                                // if first element of collection, clear collection
                                if (!this.collectionsSet.hasOwnProperty(collection.id)) {
                                    collection.$element.children().each(function(key, value) {
                                        $(value).remove();
                                    }.bind(this));
                                }
                                this.collectionsSet[collection.id] = true;

                                that.setCollectionData.call(this, value, collection).then(function() {
                                    resolve();
                                });
                            } else if (form.elementGroups.hasOwnProperty(key)) {
                                form.elementGroups[key].setValue(value);
                                resolve();
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

                addDataFromElement: function(element, data, returnMapperId) {
                    var $element = element.$el,
                        property = $element.data('mapper-property'),
                        parts;

                    if (!property) {
                        return;
                    }

                    if ($.isArray(property)) {
                        $.each(property, function(i, prop) {
                            data[prop.data] = that.processData.call(this, $element, prop, returnMapperId);
                        }.bind(this));
                    } else if (property.match(/.*\..*/)) {
                        parts = property.split('.');
                        data[parts[0]] = {};
                        data[parts[0]][parts[1]] = that.processData.call(this, $element);
                    } else {
                        // process it
                        data[property] = that.processData.call(this, $element);
                    }
                },

                getDataFromElements: function(elements, elementGroups, returnMapperId) {
                    var data = {};

                    elements.forEach(function(element) {
                        that.addDataFromElement.call(this, element, data, returnMapperId);
                    }.bind(this));

                    for (var key in elementGroups) {
                        if (elementGroups.hasOwnProperty(key)) {
                            data[key] = elementGroups[key].getValue();
                        }
                    }

                    return data;
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
                 * @param {Object} [$el=undefined] element to select data from
                 * @param {Boolean} [returnMapperId=false] returnMapperId
                 */
                getData: function($el, returnMapperId) {
                    if (!!$el && !!$el.data('mapper-id')) {
                        var collection = that.getElementByMapperId.call(this, $el.data('mapper-id')).data('collection');
                        return that.getDataFromElements(
                            collection.childElements,
                            collection.childElementGroups,
                            returnMapperId
                        );
                    } else {
                        return that.getDataFromElements(form.elements, form.elementGroups, returnMapperId);
                    }
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
                    if (!append) {
                        insertAfterLast = true;
                    }
                    // check if empty template is set and lookup in dom
                    if (template.emptyTemplate) {
                        $emptyTpl = $(element).find('#' + template.emptyTemplate);
                        if ($emptyTpl) {
                            $emptyTpl.remove();
                        }
                    }

                    that.appendChildren.call(this, template.collection, template.tpl, data, data, insertAfterLast).then(function($element) {
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
