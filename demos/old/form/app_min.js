requirejs.config({
    baseUrl: '../../',
    paths: {
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'globalize'], function(Form) {
    var language = 'en-GB';

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    var form = new Form($('#contact-form'));


});
