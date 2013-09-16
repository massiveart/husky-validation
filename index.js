require.config({
    paths : {
        jquery: 'bower_components/jquery/jquery'
    }
});

define(['js/validation'], function(Validation) {
    var validation = new Validation($('#content'));

    setTimeout(function() {
        validation.deleteConstraint('#firstName', 'required');
        validation.addConstraint('#lastName', 'minlength', {minlength:6});
    }, 200);

});
