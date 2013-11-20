define(['jquery', 'form', 'text!tests/templates/date.html', 'globalize'], function($, Form, fixture) {

    'use strict';

    describe('Type Date [EN]:', function() {
        $('body').html(fixture);

        var form, initiated = false,
            $date, dateElement;

        beforeEach(function() {
            $('body').html(fixture);

            runs(function() {
                initiated  = false;
                form = new Form('#form');
                form.initialized.then(function() {
                    $date = $('#date');
                    dateElement = $date.data('element');

                    initiated = true;
                });
            });

            waitsFor(function() {
                return initiated;
            }, 'form should be initiated', 500);
        });

        it('is valid en', function() {
            dateElement.setValue(new Date());

            expect(form.validation.validate(true)).toBeTruthy();
        });

        it('is unvalid en', function() {
            $date.val('adsf');

            expect(form.validation.validate(true)).toBeFalsy();
        });

    });

    describe('Type Date [DE]:', function() {
        var language = 'de',
            loaded;

        beforeEach(function() {
            loaded = false;
            require(['cultures/globalize.culture.' + language], function() {
                Globalize.culture(language);
                loaded = true;
            }.bind(this));

            waitsFor(function() {
                return loaded;
            }, 'file should be loaded', 500);
        });

    });
});
