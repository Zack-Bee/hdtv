const path = require('path');
const common = require("./webpack.common.js")
const merge = require("webpack-merge")
const CleanWebpackPlugin = require("clean-webpack-plugin")

const config = merge(common, {
    output: {
        filename: "[name].[chunkhash].js",
        path: path.resolve(__dirname, "../dist"),
        publicPath: "/"
    },
    mode: "production",
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: "babel-loader",
            include: path.resolve(__dirname, "../src"),
            options: {
                presets: [
                    ["react"],
                    ["env", {
                        "targets": [
                            "safari >= 9",
                            "ie >= 11"
                        ]
                    }]
                ]
            },
            exclude: path.resolve("node_modules")
        }]
    },
    plugins: [
        new CleanWebpackPlugin("./dist", {
            root: path.resolve(__dirname, "../")
        })
    ]
})

module.exports = config