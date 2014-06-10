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
        form = new Form($('#contact-form')),
        data = {
            firstName: 'Johannes',
            lastName: 'Wachter',
            birthDay: '2013-09-18T08:05:00',
            wage: "1500",
            disabled: 1,
            country: {
                id: 2,
                name: 'CH'
            },
            empty: [],
            emails: [
                {
                    email: 'office@asdf.at'
                },
                {
                    email: 'office2@asdf.at'
                }
            ],
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
                    phone: "+43 664 4119649",
                    attributes: {
                        something: true,
                        somethingElse: 'asdf',
                        hereIsANumber: 42
                    }
                }
            ],
            faxes: [
                {
                    type: {
                        id: 5,
                        name: "Privat"
                    },
                    fax: "+43 676 3596681-2"
                },
                {
                    type: {
                        id: 5,
                        name: "Mobil"
                    },
                    fax: "+43 664 4119649-4"
                }
            ],
            jobs: [
                'Developer',
                'Maintainer'
            ]
        };

    require(['cultures/globalize.culture.' + language], function() {
        Globalize.culture(language);
    }.bind(this));

    form.mapper.addCollectionFilter('phones', function(item) {
        return item.phone !== '';
    });

    $('#contact-form').on('form-collection-init', function(e, property) {
        console.log(property, 'initiated');
    });

    $('#contact-form').on('submit', function() {
        var newData = form.mapper.getData();
        console.log(newData);

        console.log(array_diff(data, newData));

        return false;
    });

    $('#send-mapperid').on('click', function() {
        console.log(form.mapper.getData(undefined, true));

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

    $('#addemail').on('click', function() {
        form.mapper.addToCollection('emails', {email: 'test@test.com'}).then(function($element) {
            console.log($element);
        });
    });

    $('#addempty').on('click', function() {
        form.mapper.addToCollection('empty', {value: 'dudldu'}).then(function($element) {
            console.log($element);
        });
    });

    $('#removeempty').on('click', function() {
        var mapperId = $('body').find('*[data-mapper-property-tpl=empty-tpl]').eq(0).attr('data-mapper-id');
        if (mapperId) {
            form.mapper.removeFromCollection(parseInt(mapperId, 10));
        }
    });

    $('#addemailend').on('click', function() {
        form.mapper.addToCollection('emails', {email: ''}, true);
    });

    $('#deleteemail').on('click', function() {
        form.mapper.removeFromCollection(9);
    });

    $('#editphone').on('click', function() {
        form.mapper.editInCollection(11, {
            type: {
                id: 5,
                name: "Home"
            }
        });
    });

    $('#addphone').on('click', function() {
        form.mapper.addToCollection('phones', {
            type: {
                id: 5,
                name: "Privat"
            },
            phone: "+43 676 3596681"
        });
    });

    $('#setdata').on('click', function() {
        console.log('started setdata');

        form.initialized.then(function() {
            form.mapper.setData(data).then(
                function() {
                    console.log('resolved setdata');
                }
            );
        });
    });
});

function array_diff(arr1) {
    //  discuss at: http://phpjs.org/functions/array_diff/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Sanjoy Roy
    //  revised by: Brett Zamir (http://brett-zamir.me)
    //   example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
    //   returns 1: {0:'Kevin'}

    var retArr = {},
        argl = arguments.length,
        k1 = '',
        i = 1,
        k = '',
        arr = {};

    arr1keys: for (k1 in arr1) {
        for (i = 1; i < argl; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1]) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}
