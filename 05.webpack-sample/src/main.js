//var $ = require('jquery');
//var bootstrap = require('bootstrap');

$('h1').text('Hello World');

$('#myButton').on('click', function() {
    var $btn = $(this).button('loading');
    var infoHtml = require('./view/info.html');
    var tmp = _.template(infoHtml);
    var result = tmp({title:'Hello'});
    $('#infoModel').html(result);

    //$btn.button('reset');
});
