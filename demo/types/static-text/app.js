requirejs.config({
    baseUrl: '../../../',
    paths: {
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'globalize'], function(Form) {
    var language = 'de', form;

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    form = new Form($('#content-form'), {debug: true});

    $('#content-form').on('submit', function() {
        console.log(form.mapper.getData());

        return false;
    });

    $('#set-data').on('click', function() {
        form.mapper.setData({
            title: 'Titel',

            country:'at',
            url: '/testurl',
            article: 'asdfasdf'
        });
    });
});
