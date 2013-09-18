requirejs.config({
    baseUrl: '../../'
});

define(['js/form'], function(Form) {
    var form = new Form($('#contact-form'));

    $('#contact-form').on('submit', function() {
        return false;
    });
});
