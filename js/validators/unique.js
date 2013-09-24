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
    'validator/default',
    'form/util'
], function(Default, Util) {

    return function($el, form, options) {

        var defaults = {
        };

        var result = $.extend({}, new Default($el, form, defaults, options, 'unique'), {
            validate: function() {

                var uniqueValue = $($el).val();
                    uniqueGroup = $el.data('validation-unique'),
                    counter = 0;

                $.each(form.elements, function(index, element){
                    var group = element.options.validationUnique,
                        value = element.getValue();

                    if(uniqueGroup === group){
                        if(uniqueValue === value) {
                            counter++;
                        }
                    }
                    
                    return counter <= 1;

                });

                if(counter > 1) {
                    return false;    
                }

                return true;
                
            }
        });

        result.initialize();
        return result;
    };

});
