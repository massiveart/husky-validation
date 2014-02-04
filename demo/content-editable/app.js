requirejs.config({
    baseUrl: '../../',
    paths: {
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'globalize'], function(Form) {

    'use strict';

    var language = 'de', form, $form;

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    $form = $('#content-form');
    form = new Form($form, {debug: true});

    $form.on('submit', function() {
        console.log(form.mapper.getData());

        return false;
    });
});
