const path = require("path")
const WebpackPwaManifest = require('webpack-pwa-manifest')
const HtmlWebpackPlugin = require("html-webpack-plugin")

const config = {
    entry: {
        app: "./src/index.jsx",
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/index.html"),
        }),
        new WebpackPwaManifest({
            name: "东北大学HDTV",
            short_name: "HDTV",
            publicPath: '/',
            start_url: "./"
        }),

    ],
    module: {
        rules: [{
            test: /\.css$/,
            loader: "style-loader!css-loader",
            // include: path.resolve(__dirname, "../src"),
            // exclude: path.resolve(__dirname, "../node_modules")
        }, {
            test: /\.(png|jpg|gif|svg|woff2|ttf|woff|eot|swf)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[hash].[ext]',
            }
        }]
    }
}

module.exports = config
