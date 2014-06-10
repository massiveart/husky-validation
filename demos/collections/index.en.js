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

    'demos/collections/index',

    // Add form dependencies
    'underscore',

    // Extend Globalize with Date and Number modules.
    'globalize/date',
    'globalize/number'
], function(Globalize, gregorian, numbers, likelySubtags, timeData, weekData, index) {

    'use strict';

    // At this point, we have Globalize loaded. But, before we can use it, we need to feed it on the appropriate I18n content (Unicode CLDR).
    // Read Requirements on Getting Started on the root's README.md for more information.
    Globalize.load(gregorian);
    Globalize.load(numbers);
    Globalize.load(likelySubtags);
    Globalize.load(timeData);
    Globalize.load(weekData);

    // Set "en" as our default locale.
    Globalize.locale('en');

    index();
});
