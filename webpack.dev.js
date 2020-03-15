const merge = require("webpack-merge");
const common = require("./webpack.common.js");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//https://webpack.js.org/configuration/devtool/
const path = require('path');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');



module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        // new BundleAnalyzerPlugin()
        new WebpackBuildNotifierPlugin({
            title: "ELMO",
            logo: path.resolve("dist/assets/logo.png"),
        }),
    ]
});
