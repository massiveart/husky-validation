define(['jquery', 'form'], function($, Form) {

    'use strict';

    describe('Husky Validation', function() {

        $('body').append('<form id="form"><input type="text" id="field"/></form>');

        var spy = jasmine.createSpyObj('spy', ['then']),
            form;

        it('init form', function() {
            form = new Form('#form');

            expect(form.initialized.then).toBeDefined();

            form.initialized.then(spy.then);
        });

        it('init should call then', function() {
            expect(spy.then).toHaveBeenCalled();
        });

        it('should create form-object', function() {
            expect($('#form').data('form-object')).toBeDefined();
        });

        it('should init input field', function(){
            expect($('#field').attr('class')).toBe('husky-validate');
            expect($('#field').data('element')).toBeDefined();
        });
    });
});
