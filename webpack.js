var path = require('path');
module.exports = {
    entry: './client/index.js',
    output: {
        path: __dirname,
        filename: 'client/app.js'
    },
    module: {
        loaders: [
            {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel?presets[]=es2015&presets[]=react'
            }
        ]
    }
};
