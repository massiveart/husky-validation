require.config({
    paths : {
        jquery: 'bower_components/jquery/jquery'
    }
});

define(['js/validation'], function(Validation) {
    var validation = new Validation($('#content'));
});
