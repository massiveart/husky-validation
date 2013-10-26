requirejs.config({
    baseUrl: '../../',
    paths: {
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'globalize'], function(Form) {
    var language = 'de';

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    var form = new Form($('#content-form'));
    form.mapper.addArrayFilter('phones', function(item) {
        return item.phone != '';
    });

    $('#content-form').on('submit', function() {
        console.log(form.mapper.getData());

        return false;
    });

    setTimeout(function() {
        form.mapper.setData({})
    }, 2000);
});
