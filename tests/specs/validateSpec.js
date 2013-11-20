define(['jquery', 'form', 'text!tests/templates/validate_simple.html', 'globalize'], function($, Form, fixture) {

    'use strict';

    describe('Husky Validation', function() {
        $('body').html(fixture);

        var form,
            initialized,
            $name ,
            $date ,
            $decimal,
            $email,
            $url;

        beforeEach(function() {
            $('body').html(fixture);

            initialized = false;
            runs(function() {
                form = new Form('#form');
                form.initialized.then(function() {
                    $name = $('#name');
                    $date = $('#date');
                    $decimal = $('#decimal');
                    $email = $('#email');
                    $url = $('#url');

                    initialized = true;
                });
            });

            waitsFor(function() {
                return initialized;
            }, 'init should call then', 500);
        });

        it('should return be a valid situation', function() {
            $name.val('i am a name');
            $date.val('01/01/2013');
            $decimal.val('1');
            $email.val('a@a.at');
            $url.val('www.a.at');

            expect(form.validation.validate()).toBeTruthy();
            expect($('.husky-validate-success').length).toBe(5);
        });

        it('should return be a unvalid situation', function() {
            $name.val('i am a name');
            $date.val('01/01/a');
            $decimal.val('1');
            $email.val('a@a.at');
            $url.val('www');

            expect(form.validation.validate()).toBeFalsy();
            expect($('.husky-validate-success').length).toBe(3);
            expect($('.husky-validate-error').length).toBe(2);
        });
    });
});
