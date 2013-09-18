requirejs.config({
    baseUrl: '../../'
});

define(['js/form'], function(Form) {
    var validation = new Form($('#contact-form'), {
        debug: true
    });
});
