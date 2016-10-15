var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    devtool: 'source-map',
    entry: './backend/main.js',
    target: 'node',
    output: {
        path: __dirname + "/dist/back",
        filename: 'index.js'
    },
    externals: nodeModules,
    plugins: [
        new uglifyJsPlugin({ compress: { warnings: false } }),
        new webpack.IgnorePlugin(/\.(css|less)$/),
        new webpack.BannerPlugin('require("source-map-support").install();', { raw: true, entryOnly: false })
    ]
}
