define(['js/validation'], function(Validation) {
    var validation = new Validation($('#demo-form'));

    $('.sumbit').on('click', function() {
        if (!validation.validate()) {
            $('.messages').css('background-color', 'red');
            $('.messages').html('<p style="margin: 5px">Seems there are some errors.</p>');
        } else {
            $('.messages').css('background-color', 'green');
            $('.messages').html('<p style="margin: 5px">Everything OK</p>');
        }
    });
});
