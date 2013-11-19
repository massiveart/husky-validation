define(['jquery', 'form', 'text!tests/templates/validate_simple.html'], function($, Form, fixture) {

    'use strict';

    describe('Husky Validation', function() {
        $('body').append(fixture);

        var form = new Form('#form');
    });
});
