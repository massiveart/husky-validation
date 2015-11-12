/*
 * This file is part of Husky Validation.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define(function() {
    'use strict';

    return function() {
        var elements = [];

        return {
            addElement: function(element) {
                elements.push(element);
            }
        };
    }
});
