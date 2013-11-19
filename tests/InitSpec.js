define(['jquery', 'form'], function($, Form) {

    'use strict';

    describe('Husky Validation', function() {

        $('body').append('<form id="form"><input type="text" id="field"/></form>');

        var initialized = jasmine.createSpyObj('initialized', ['then']),
            form,
            then = false;

        it('init form', function() {
            form = new Form('#form');

            expect(form.initialized.then).toBeDefined();

            form.initialized.then(function() {
                then = true;
                initialized.then();
            });
        });

        waitsFor(function() {
            return then;
        }, 'init should call then', 500);

        it('init should call then', function() {
            expect(initialized.then).toHaveBeenCalled();
        });

        it('should create form-object', function() {
            expect($('#form').data('form-object')).toBeDefined();
        });

        it('should init input field', function() {
            expect($('#field').attr('class')).toBe('husky-validate');
            expect($('#field').data('element')).toBeDefined();
        });
    });
});
