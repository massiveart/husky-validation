requirejs.config({
    baseUrl: '../../',
    paths: {
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'globalize'], function(Form) {

    'use strict';

    var language = 'de',
        form = new Form($('#content-form'));

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    form.mapper.addCollectionFilter('phones', function(item) {
        return item.phone !== '';
    });

    $('#content-form').on('form-add', function(e, property) {
        console.log(property, 'added element');
    });
    $('#content-form').on('form-remove', function(e, property) {
        console.log(property, 'removed element');
    });
    $('#content-form').on('form-collection-init', function(e, property) {
        console.log(property, 'initiated');
    });

    $('#content-form').on('submit', function() {
        var object = form.mapper.getData();
        console.log(object);

        return false;
    });

    $('#setnull').on('click', function() {
        console.log('started setnull');

        form.initialized.then(function() {
            form.mapper.setData({}).then(
                function() {
                    console.log('resolved setnull');
                }
            );
        });
    });

    $('#setdata').on('click', function() {
        console.log('started setdata');

        form.initialized.then(function() {
            form.mapper.setData({
                "title": "That´s my title",
                "url": "/",
                "article": "Article writing is boring",
                "interest": [
                    "interest2"
                ],
                "gender": "female",
                "block1": [
                    {
                        "title": "The first article",
                        "article": "Thats my realy big article text"
                    }
                ]
            }).then(
                function() {
                    console.log('resolved setdata');
                }
            );
        });
    });
});
