requirejs.config({
    baseUrl: '../../'
});

define(['js/form'], function(Form) {
    var form = new Form($('#contact-form'));

    $('#contact-form').on('submit', function() {
        console.log(form.mapper.getData());

        return false;
    });

    setTimeout(function() {
        form.mapper.setData({
            firstName: 'Johannes',
            lastName: 'Wachter',
            birthDay: '2013-05-05',
            wage: 1500,
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
        })
    }, 1000);
});
