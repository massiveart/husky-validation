require.config({
    baseUrl: '../../'
});

define([
    'js/form'
], function(Form) {

    'use strict';

    return function() {
        var form = new Form($('#content-form'), {debug: true}),
            data = {
                firstName: 'Johannes',
                lastName: 'Wachter',
                birthday: '2014-06-02T15:52:59+0200',
                persons: [
                    {
                        firstName: 'Thomas',
                        lastName: 'Schedler'
                    },
                    {
                        firstName: 'Daniel',
                        lastName: 'Rotter'
                    },
                    {
                        firstName: 'Michael',
                        lastName: 'Zangerle'
                    }
                ]
            };

        $('#set-value').on('click', function() {
            form.mapper.setData(data);

            $('#json').text(JSON.stringify(data, null, 4));
        });

        $('#set-empty-value').on('click', function() {
            form.mapper.setData({
                persons: []
            });
        });

        $('#set-empty-object').on('click', function() {
            alert('Should reset form!');
            form.mapper.setData({});
        });

        $('#get-value').on('click', function() {
            $('#json').text(JSON.stringify(form.mapper.getData(), null, 4));
        });
    };
});
