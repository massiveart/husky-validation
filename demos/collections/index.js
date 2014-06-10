require.config({
    baseUrl: '../../',
    paths: {
        // Globalize dependencies paths.
        cldr: 'bower_components/cldrjs/dist/cldr',

        // CLDR JSON content paths.
        // (a) cldr is the JSON content itself,
        cldrdata: 'demos/cldr',
        // (b) json is the require.js plugin we'll use to fetch CLDR JSON content,
        json: 'bower_components/requirejs-plugins/src/json',
        // (c) text is json's dependency.
        text: 'bower_components/requirejs-text/text',

        // Globalize path. Note it's already available on this repository. If it's not, read Usage on Getting Started on the root's README.md.
        globalize: 'bower_components/globalize/dist/globalize',

        underscore: 'bower_components/underscore/underscore'
    }
});

require([
    'globalize',

    // CLDR content.
    'json!cldrdata/main/en/ca-gregorian.json',
    'json!cldrdata/main/en/numbers.json',
    'json!cldrdata/supplemental/likelySubtags.json',
    'json!cldrdata/supplemental/timeData.json',
    'json!cldrdata/supplemental/weekData.json',

    // Add form dependencies
    'js/form',
    'underscore',

    // Extend Globalize with Date and Number modules.
    'globalize/date',
    'globalize/number'
], function(Globalize, enGregorian, enNumbers, likelySubtags, timeData, weekData, Form) {

    'use strict';

    // At this point, we have Globalize loaded. But, before we can use it, we need to feed it on the appropriate I18n content (Unicode CLDR).
    // Read Requirements on Getting Started on the root's README.md for more information.
    Globalize.load(enGregorian);
    Globalize.load(enNumbers);
    Globalize.load(likelySubtags);
    Globalize.load(timeData);
    Globalize.load(weekData);

    // Set "en" as our default locale.
    Globalize.locale('en');

    var form = new Form($('#content-form'), {debug: true});

    $('#set-value').on('click', function() {
        form.mapper.setData({
            persons: [
                {
                    firstName: 'Johannes',
                    lastName: 'Wachter'
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
        });
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
});
