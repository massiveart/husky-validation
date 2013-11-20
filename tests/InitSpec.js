define(['jquery', 'form'], function($, Form) {

    'use strict';

    describe('Init Deferred', function() {

        var initialized = jasmine.createSpyObj('initialized', ['then']),
            form = new Form('#form'),
            then;

        beforeEach(function() {
            $('body').html('<form id="form"><input type="text" id="field"/></form>');

            then = false;
            runs(function() {
                form = new Form('#form');
            });
        });

        it('should call then', function() {

            runs(function() {
                form.initialized.then(function() {
                    then = true;
                    initialized.then();
                });
            });

            waitsFor(function() {
                return then;
            }, 'init should call then', 500);
        });

        describe('Init Data-objects', function() {
            var initialized = jasmine.createSpyObj('initialized', ['then']),
                form = new Form('#form'),
                then;

            beforeEach(function() {
                $('body').html('<form id="form"><input type="text" id="field"/></form>');

                then = false;
                runs(function() {
                    form = new Form('#form');
                    form.initialized.then(function() {
                        then = true;
                        initialized.then();
                    });
                });

                waitsFor(function() {
                    return then;
                }, 'init should call then', 500);
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
});
