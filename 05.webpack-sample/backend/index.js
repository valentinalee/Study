const _ = require('lodash');

module.exports = function(req, res) {
    // UglifyJs cannot support let
    var arr = JSON.parse(req.query.arr || '[]');
    res.send(_.map(arr, function(x) {
        return x + 1; }));
};
