//var $ = require('jquery');
//var bootstrap = require('bootstrap');

$('h1').text('Hello World');

$('#myButton').on('click', function() {
    var $btn = $(this).button('loading');
    // business logic...
    //$btn.button('reset');

    $('#infoModel').html(require('./view/info.html'));
})
