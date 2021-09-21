const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//https://webpack.js.org/configuration/devtool/
const path = require('path')
const WebpackBuildNotifications = require('webpack-build-notifications')

// eslint-disable-next-line no-undef
module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',

  plugins: [
    // new BundleAnalyzerPlugin()
    new WebpackBuildNotifications({
      title: 'ELMO',
      logo: path.resolve('./dist/assets/logo.png'),
    }),
  ],
})
