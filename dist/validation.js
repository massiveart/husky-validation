
/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/util',[], function() {

    var ignoredKeys = [
        'form',
        'validation'
    ];

    return {
        debugEnabled: false,

        // get form fields
        getFields: function(element) {
            return $(element).find('input:not([data-form="false"], [type="submit"], [type="button"]), textarea:not([data-form="false"]), select:not([data-form="false"]), *[data-form="true"]');
        },

        /**
         * Parses the data of a element
         * Inspired by aurajs <http://aurajs.com>
         */
        parseData: function(el, namespace, defaults) {
            var name,
                $el = $(el);

            return this.buildOptions($el.data(), namespace, '', defaults);
        },

        /**
         * Build options for given data
         * Inspired by aurajs <http://aurajs.com>
         *
         * TODO Example
         */
        buildOptions: function(data, namespace, subNamespace, defaults) {
            if (!subNamespace)subNamespace = '';
            if (!defaults)defaults = {};

            var options = $.extend({}, defaults, {}),
                fullNamespace = namespace + this.ucFirst(subNamespace);

            $.each(data, function(key, value) {
                var regExp = new RegExp("^" + fullNamespace);
                if (regExp.test(key)) {
                    if ($.inArray(key, ignoredKeys) == -1) {
                        if (key !== fullNamespace) {
                            key = key.replace(regExp, "");
                        } else {
                            key = key.replace(new RegExp("^" + namespace), "");
                        }
                        if (key !== '') {
                            key = this.lcFirst(key);
                            options[key] = value;
                        }
                    }
                }
            }.bind(this));

            return options;
        },

        debug: function(p1, p2, p3) {
            if (!!this.debugEnabled) {
                if (!!p1) {
                    if (!!p2) {
                        if (!!p3) {
                            console.log("Husky Validation:", p1, p2, p3)
                        } else {
                            console.log("Husky Validation:", p1, p2)
                        }
                    } else {
                        console.log("Husky Validation:", p1)
                    }
                } else {
                    console.log("Husky Validation")
                }
            }
        },

        /**
         *  JavaScript equivalent of PHP’s ucfirst
         *  inspired by http://kevin.vanzonneveld.net
         */
        ucFirst: function(str) {
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        },

        lcFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        startsWith: function(str, starts) {
            return str.indexOf(starts) == 0;
        }
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/element',['form/util'], function(Util) {

    return function(el, options) {
        var defaults = {
                type: 'string',
                validationTrigger: 'focusout',                     // default validate trigger
                validationAddClasses: true,                        // add error and success classes
                validationSuccessClass: 'husky-validate-success',  // success class
                validationErrorClass: 'husky-validate-error',      // error class
                validation: true                                   // validation on/off
            },
            ignoredOptions = [
                'validation',
                'validationTrigger',
                'validationAddClasses',
                'validationSuccessClass',
                'validationErrorClass',
                'validationSubmitEvent'
            ],
            valid,
            validators = {},
            type,
            lastValue = null;

        var that = {
            initialize: function() {
                this.$el = $(el);

                // set data element
                this.$el.data('element', this);

                this.options = $.extend({}, defaults, options);

                // init validation if necessary
                if (!!this.options.validation) {
                    that.initValidation.call(this);
                }
            },

            initValidation: function() {
                that.bindValidationDomEvents.call(this);

                that.initValidators.call(this);
                that.initType.call(this);
            },

            bindValidationDomEvents: function() {
                // build trigger
                var triggers = ( !this.options.validationTrigger ? '' : this.options.validationTrigger );
                // break if no trigger is set
                if (triggers === '' || triggers === 'none') return;

                // always bind change event, for better UX when a select is invalid
                if (this.$el.is('select')) {
                    triggers += new RegExp('change', 'i').test(triggers) ? '' : ' change';
                }

                // trim triggers to bind them correctly with .on()
                triggers = triggers.replace(/^\s+/g, '').replace(/\s+$/g, '');

                // bind event
                this.$el.bind(triggers, this.validate.bind(this));
            },

            initValidators: function() {
                // create validators for each of the constraints
                $.each(this.options, function(key, val) {
                    // val not false
                    // key is not ignored
                    // and key starts with validation
                    if (!!val && $.inArray(key, ignoredOptions) == -1 && Util.startsWith(key, 'validation')) {
                        // filter validation prefix
                        var name = Util.lcFirst(key.replace('validation', ''));
                        require(['validator/' + name], function(Validator) {
                            var options = Util.buildOptions(this.options, 'validation', name);
                            validators[name] = new Validator(this.$el, options);
                            Util.debug('Element Validator', key, options);
                        }.bind(this));
                    }
                }.bind(this));
            },

            initType: function() {
                // if type exists
                if (!!this.options.type) {
                    require(['type/' + this.options.type], function(Type) {
                        var options = Util.buildOptions(this.options, 'type');
                        type = new Type(this.$el, options);
                        Util.debug('Element Type', type, options);
                    }.bind(this));
                }
            },

            hasConstraints: function() {
                return Object.keys(validators).length > 0 || (type != null && type.needsValidation());
            },

            needsValidation: function() {
                return lastValue !== this.$el.val();
            },

            reset: function() {
                this.$el.removeClass(this.options.validationSuccessClass);
                this.$el.removeClass(this.options.validationErrorClass);
            },

            setValid: function(state) {
                valid = state;
                if (!!this.options.validationAddClasses) {
                    that.reset.call(this);

                    if (!!state) {
                        this.$el.addClass(this.options.validationSuccessClass);
                    } else {
                        this.$el.addClass(this.options.validationErrorClass);
                    }
                }
            }
        };

        var result = {
            validate: function(force) {
                // only if value changed or force is set
                if (force || that.needsValidation.call(this)) {
                    if (!that.hasConstraints.call(this)) {
                        // delete state
                        that.reset.call(this);
                        return true;
                    }

                    var result = true;
                    // check each validator
                    $.each(validators, function(key, validator) {
                        if (!validator.validate()) {
                            result = false;
                            // TODO Messages
                        }
                    });

                    // check type
                    if (type != null && !type.validate()) {
                        result = false;
                    }

                    that.setValid.call(this, result);
                }
                return this.isValid();
            },

            isValid: function() {
                return valid;
            },

            updateConstraint: function(name, options) {
                if ($.inArray(name, Object.keys(validators)) > -1) {
                    validators[name].updateConstraint(options);
                    this.validate();
                } else {
                    throw "No constraint with name: " + name;
                }
            },

            deleteConstraint: function(name) {
                if ($.inArray(name, Object.keys(validators)) > -1) {
                    delete validators[name];
                    this.validate(true);
                } else {
                    throw "No constraint with name: " + name;
                }
            },

            addConstraint: function(name, options) {
                if ($.inArray(name, Object.keys(validators)) == -1) {
                    require(['validator/' + name], function(Validator) {
                        validators[name] = new Validator(this.$el, options);
                    }.bind(this));
                } else {
                    throw "Constraint with name: " + name + " already exists";
                }
            },

            setValue: function(value) {
                type.setValue(value);
            },

            getValue: function(data) {
                return type.getValue(data);
            }
        };

        that.initialize.call(result);
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/validation',[
    'form/util'
], function(Util) {

    return function(form) {
        var valid;

        // private functions
        var that = {
            initialize: function() {
                that.bindValidationDomEvents.call(this);

                Util.debug('INIT Validation');
            },

            bindValidationDomEvents: function() {
                if (!!form.options.validationSubmitEvent) {
                    // avoid submit if not valid
                    form.$el.on('submit', function() {
                        return form.validation.validate();
                    }.bind(this));
                }
            },

            setValid: function(state) {
                valid = state;
            }
        };

        // define validation interface
        var result = {
            validate: function(force) {
                var result = true;
                // validate each element
                $.each(form.elements, function(key, element) {
                    if (!element.validate(force)) {
                        result = false;
                    }
                });

                that.setValid.call(this, result);
                Util.debug('Validation', !!result ? 'success' : 'error');
                return result;
            },

            isValid: function() {
                return valid;
            },

            updateConstraint: function(selector, name, options) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $(selector).data('element').updateConstraint(name, options);
                } else {
                    throw 'No validation element';
                }
            },

            deleteConstraint: function(selector, name) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $element.data('element').deleteConstraint(name);
                } else {
                    throw 'No validation element';
                }
            },

            addConstraint: function(selector, name, options) {
                var $element = $(selector);
                if (!!$element.data('element')) {
                    $element.data('element').addConstraint(name, options);
                } else {
                    // create a new one
                    var element = form.addField(selector);
                    // add constraint
                    element.addConstraint(name, options);
                    form.elements.push(element);
                }
            }
        };

        that.initialize.call(result);
        return result;
    }

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('form/mapper',[
    'form/util'
], function(Util) {

    return function(form) {
        var valid;

        // private functions
        var that = {
            initialize: function() {
                Util.debug('INIT Mapper');
            },

            processData: function(el) {
                // get attributes
                var $el = $(el),
                    type = $el.data('type'),
                    element = $el.data('element');

                // if type == array process children, else get value
                if (type !== 'array') {
                    return element.getValue();
                } else {
                    var result = [];
                    $.each($el.children(), function(key1, value1) {
                        result.push(form.mapper.getData($(value1)));
                    });
                    return result;
                }
            }
        };

        // define mapper interface
        var result = {
            setData: function(data, $el) {
                if (!$el)$el = form.$el;
                $.each(data, function(key, value) {
                    // search field with mapper property
                    var selector = '*[data-mapper-property="' + key + '"]',
                        $element = $el.find(selector),
                        element = $element.data('element');

                    if ($element.length > 0) {
                        // if field is an array
                        if ($.isArray(value)) {
                            // remember first child remove the rest
                            var $child = $element.children().first();

                            // remove fields
                            $.each(Util.getFields($element), function(key, value) {
                                form.removeField(value);
                            }.bind(this));
                            $element.children().remove();

                            // foreach array elements: create a new dom element, call setData recursively
                            $.each(value, function(key1, value1) {
                                var $newElement = $child.clone();
                                $element.append($newElement);
                                var $newFields = Util.getFields($newElement);

                                $.each($newFields, function(key, value) {
                                    form.addField($(value));
                                }.bind(this));

                                // FIXME wait for type (async load)
                                setTimeout(function() {
                                    form.mapper.setData(value1, $newElement);
                                }, 100);
                            });
                        } else {
                            // if element is not in form add it
                            if (!element) {
                                element = form.addField($element);
                                // FIXME wait for type (async load)
                                setTimeout(function() {
                                    element.setValue(value);
                                }, 100);
                            } else {
                                element.setValue(value);
                            }
                        }
                    }
                }.bind(this));
            },

            getData: function($el) {
                if (!$el)$el = form.$el;
                var data = {};

                // search field with mapper property
                var selector = '*[data-mapper-property]',
                    $elements = $el.find(selector);

                // do it while elements exists
                while ($elements.length > 0) {
                    // get first
                    var $el = $($elements.get(0)),
                        property = $el.data('mapper-property');

                    if (property.match(/.*\..*/)) {
                        var parts = property.split('.');
                        data[parts[0]] = {};
                        data[parts[0]][parts[1]] = that.processData.call(this, $el);
                    } else {
                        // process it
                        data[property] = that.processData.call(this, $el);
                    }

                    // remove element itselve
                    $elements = $elements.not($el);
                    // remove child elements
                    $elements = $elements.not($el.find(selector))
                }
                return data;
            }
        };

        that.initialize.call(result);
        return result;
    }

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

require.config({
    paths: {
        'form': 'js/form',
        'form/mapper': 'js/mapper',
        'form/validation': 'js/validation',
        'form/element': 'js/element',
        'form/util': 'js/util',

        'type/default': 'js/types/default',
        'type/string': 'js/types/string',
        'type/date': 'js/types/date',
        'type/decimal': 'js/types/decimal',
        'type/email': 'js/types/email',
        'type/url': 'js/types/url',
        'type/label': 'js/types/label',

        'validator/default': 'js/validators/default',
        'validator/min': 'js/validators/min',
        'validator/max': 'js/validators/max',
        'validator/minLength': 'js/validators/min-length',
        'validator/maxLength': 'js/validators/max-length',
        'validator/required': 'js/validators/required'
    }
});

define('form',[
    'form/element',
    'form/validation',
    'form/mapper',
    'form/util'
], function(Element, Validation, Mapper, Util) {

    return function(el, options) {
        var defaults = {
                //language: 'de',               // language
                debug: false,                   // debug on/off
                validation: true,               // validation on/off
                validationTrigger: 'focusout',  // default validate trigger
                validationAddClasses: true,     // add error and success classes
                validationSubmitEvent: true,    // avoid submit if not valid
                mapper: true                    // mapper on/off
            },
            valid;

        // private functions
        var that = {
            initialize: function() {
                this.$el = $(el);
                this.options = $.extend(defaults, this.$el.data(), options);

                // set culture
                //require(['cultures/globalize.culture.' + this.options.language], function() {
                //    Globalize.culture(this.options.language);
                //}.bind(this));

                // enable / disable debug
                Util.debugEnabled = this.options.debug;

                that.initFields.call(this);

                if (!!this.options.validation) {
                    this.validation = new Validation(this);
                }

                if (!!this.options.mapper) {
                    this.mapper = new Mapper(this);
                }

                this.$el.data('form-object', this);
                Util.debug('Form', this);
                Util.debug('Elements', this.elements);
            },

            // initialize field objects
            initFields: function() {
                $.each(Util.getFields(this.$el), function(key, value) {
                    this.addField.call(this, value);
                }.bind(this));
            },

            bindValidationDomEvents: function() {
                if (!!this.options.validationSubmitEvent) {
                    // avoid submit if not valid
                    this.$el.on('submit', function() {
                        return this.validation.validate();
                    }.bind(this));
                }
            }
        };

        var result = {
            elements: [],
            options: {},
            validation: false,
            mapper: false,

            addField: function(selector) {
                var $element = $(selector),
                    options = Util.parseData($element, '', this.options),
                    element = new Element($element, options);

                this.elements.push(element);
                Util.debug('Element created', options);
                return element;
            },

            removeField: function(selector) {
                var $element = $(selector),
                    element = $element.data('element');

                this.elements.splice(this.elements.indexOf(element), 1);
            }
        };

        that.initialize.call(result);
        return result;
    }

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/default',[], function() {

    return function($el, defaults, options, name, typeInterface) {

        var that = {
                initialize: function() {
                    this.$el = $el;
                    this.options = $.extend({}, defaults, options);

                    if (!!this.initializeSub) this.initializeSub();
                }
            },
            defaultInterface = {
                name: name,

                needsValidation: function() {
                    return true;
                },

                updateConstraint: function(options) {
                    this.options = $.extend({}, this.options, options);
                },

                // mapper functionality set value into input
                setValue: function(value) {
                    this.$el.val(this.getViewData.call(this, value));
                },

                // mapper functionality get value from input
                getValue: function() {
                    return this.getModelData.call(this, this.$el.val());
                },

                // internationalization of view data: default none
                getViewData: function(value) {
                    return value;
                },

                // internationalization of model data: default none
                getModelData: function(value) {
                    return value;
                }
            },
            result = $.extend({}, defaultInterface, typeInterface);

        that.initialize.call(result);
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/string',[
    'type/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
        };

        var typeInterface = {
            needsValidation: function() {
                return false;
            },

            validate: function() {
                return true;
            }
        };

        return new Default($el, defaults, options, 'string', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/date',[
    'type/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            format: "d"     // possibilities f, F, t, T, d, D
        };

        var getDate = function(value) {
                return new Date(value);
            },
            toMysqlFormat = function(date) {
                return date.toISOString();
            };

        var subType = {
            validate: function() {
                var val = this.$el.val();
                if (val == "")return true;

                var date = Globalize.parseDate(val, this.options.format);
                return date != null;
            },

            // internationalization of view data: Globalize library
            getViewData: function(value) {
                return Globalize.format(getDate(value), this.options.format);
            },

            // internationalization of model data: Globalize library
            getModelData: function(value) {
                var date = Globalize.parseDate(this.$el.val(), this.options.format);
                return toMysqlFormat(date);
            }
        };

        return new Default($el, defaults, options, 'date', subType);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/decimal',[
    'type/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            regExp: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
        };

        var typeInterface = {
            initializeSub:function(){
                // TODO internationalization
            },

            validate: function() {
                var val = this.$el.val();
                if (val == "")return true;

                return this.options.regExp.test(this.$el.val());
            }
        };

        return new Default($el, defaults, options, 'decimal', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/email',[
    'type/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            regExp: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i
        };

        var typeInterface = {
            validate: function() {
                var val = this.$el.val();
                if (val == "")return true;

                return this.options.regExp.test(this.$el.val());
            }
        };

        return new Default($el, defaults, options, 'email', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/url',[
    'type/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            regExp: /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
        };

        var typeInterface = {
            validate: function() {
                var val = this.$el.val();
                if (val == "")return true;

                if (this.data['url-strict'] !== 'true') {
                    val = new RegExp('(https?|s?ftp|git)', 'i').test(val) ? val : 'http://' + val;
                }
                return this.options.regExp.test(val);
            }
        };

        return new Default($el, defaults, options, 'email', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('type/label',[
    'type/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            id: 'id',
            label: 'name'
        };

        var typeInterface = {
            setValue: function(value) {
                if (!!value[this.options.label]) {
                    this.$el.text(value[this.options.label])
                }

                if (!!value[this.options.id]) {
                    this.$el.data(this.options.id, value[this.options.id])
                }
            },

            getValue: function() {
                var result = {};
                result[this.options.id] = this.$el.data(this.options.id);
                result[this.options.label] = this.$el.text();
                return result
            },

            needsValidation: function() {
                return false;
            },

            validate: function() {
                return true;
            }
        };

        return new Default($el, defaults, options, 'label', typeInterface);
    };
});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/default',[], function() {

    return function($el, defaults, options, name) {

        return {
            name: name,

            initialize: function() {
                this.$el = $el;
                this.data = $.extend(defaults, this.$el.data(), options);
                this.updateData();

                if (!!this.initializeSub) this.initializeSub();
            },

            updateConstraint: function(options) {
                this.data = $.extend({}, this.data, options);
                this.updateData();
            },

            updateData: function() {
                $.each(this.data, function(key, value) {
                    this.$el.data(key, value);
                }.bind(this));
            }
        };

    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/min',[
    'validator/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            min: 0
        };

        var result = $.extend({}, new Default($el, defaults, options, 'min'), {
            validate: function() {
                var val = this.$el.val();
                return Number(val) >= this.data.min;
            }
        });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/max',[
    'validator/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            max: 999
        };

        var result = $.extend({}, new Default($el, defaults, options, 'max'), {
            validate: function() {
                var val = this.$el.val();
                return Number(val) <= this.data.max;
            }
        });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/minLength',[
    'validator/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            minLength: 0
        };

        var result = $.extend({}, new Default($el, defaults, options, 'min-length'), {
            validate: function() {
                var val = this.$el.val();
                return val.length >= this.data.minLength;
            }
        });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/maxLength',[
    'validator/default'
], function(Default) {

    return function($el, options) {
        var defaults = {
            maxLength: 999
        };

        var result = $.extend({}, new Default($el, defaults, options, 'max-length'), {
            validate: function() {
                var val = this.$el.val();
                return val.length <= this.data.maxLength;
            }
        });

        result.initialize();
        return result;
    };

});

/*
 * This file is part of the Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

define('validator/required',[
    'validator/default'
], function(Default) {

    return function($el, options) {
        var defaults = {};

        var result = $.extend({}, new Default($el, defaults, options, 'required'), {
            validate: function() {
                if (!!this.data.required) {
                    var val = this.$el.val();
                    // for checkboxes and select multiples. Check there is at least one required value
                    if ('object' === typeof val) {
                        for (var i in val) {
                            if (this.validate(val[i])) {
                                return true;
                            }
                        }
                        return false;
                    }
                    // parsleyJS notNull && notBlank
                    return val.length > 0 && '' !== val.replace(/^\s+/g, '').replace(/\s+$/g, '');
                }
                return true;
            }
        });

        result.initialize();
        return result;
    };

});
