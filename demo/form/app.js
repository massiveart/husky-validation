requirejs.config({
    baseUrl: '../../',
    paths: {
        'globalize': 'bower_components/globalize/lib/globalize',
        'cultures': 'bower_components/globalize/lib/cultures'
    }
});

define(['js/form', 'globalize'], function(Form) {
    var language = 'de',
        form = new Form($('#contact-form'));

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    form.mapper.addCollectionFilter('phones', function(item) {
        return item.phone !== '';
    });

    $('#contact-form').on('submit', function() {
        console.log(form.mapper.getData());

        return false;
    });

    $('#setdata').on('click', function() {
        form.mapper.setData({
            firstName: 'Johannes',
            lastName: 'Wachter',
            birthDay: '2013-09-18T08:05:00',
            wage: 1500,
            country: {
                id: 2,
                name: 'CH'
            },
            phones: [
                {
                    type: {
                        id: 5,
                        name: "Privat"
                    },
                    phone: "+43 676 3596681"
                },
                {
                    type: {
                        id: 5,
                        name: "Mobil"
                    },
                    phone: "+43 664 4119649"
                }
            ]
        }).then(
            function() {
                console.log('resolved');
            }
        );

        console.log('started');
    });
});
