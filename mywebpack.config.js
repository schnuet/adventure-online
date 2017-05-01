var path = require('path');

module.exports = {
    entry: './src/scripts/game.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'eval',
    devServer: {
        contentBase: path.resolve(__dirname, './src'),  // New
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [{
                    loader: 'babel-loader',
                    options: { presets: ['es2015'] },
                }],
            },

            // Loaders for other file types can go here

        ],
    },
};
