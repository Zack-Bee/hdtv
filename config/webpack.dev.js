const path = require('path');
const common = require("./webpack.common.js")
const merge = require("webpack-merge")

const config = merge(common, {
    mode: "development",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "../dist"),
        publicPath: "/v2/"
    },
    devtool: "inline-source-map",
    devServer: {
        contentBase: path.join(__dirname, '../dist'),
        compress: true,
        historyApiFallback: true,
        hot: true,
        https: false,
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: "babel-loader",
            include: path.resolve(__dirname ,"../src"),
            options: {
                presets: ["react"]
            },
            exclude: path.resolve(__dirname, "../node_modules")
        }]
    },
    devServer: {
        host: "127.0.0.1",
        open: true,
        historyApiFallback: {
            index: "/v2/index.html"
        },
        publicPath: "/v2/",
        openPage: "v2/"
    }
})

module.exports = config