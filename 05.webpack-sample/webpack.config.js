var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
    devtool: 'source-map',
    entry: {
        app: './src/main.js',
        vendor: ['jquery', 'bootstrap', 'bootstrap.css', 'bootstrap-theme.css', 'font-awesome'],
    },
    output: {
        filename: './dist/bundle.js'
    },
    module: {
        loaders: [
            { test: require.resolve("jquery"), loader: "expose?$!expose?jQuery" },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.(jpe?g|png|gif)$/i, loader: 'url-loader?limit=8192' },
            { test: /\.(woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url?limit=10000&name=dist/fonts/[hash:8].[name].[ext]' },
            { test: /\.html$/, loader: "html-loader" }
        ]
    },
    resolve: {
        alias: { //将常用的lib在这里设置别名
            "bootstrap.css": "bootstrap/dist/css/bootstrap.css",
            "bootstrap-theme.css": "bootstrap/dist/css/bootstrap-theme.css",
            "font-awesome": "font-awesome/css/font-awesome.css",
        }
    },
    plugins: [
        new uglifyJsPlugin({ compress: { warnings: false } }),
        new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ 'vendor', /* filename= */ './dist/vendor.js')
        // new webpack.ProvidePlugin({ $: "jquery", jQuery: "jquery", "window.jQuery": "jquery" }),
    ]
};
