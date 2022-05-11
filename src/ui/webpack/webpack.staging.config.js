const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');

module.exports = (env, argv) => {
  env = env || {};
  env.mode = 'staging';
  return merge(common(env, argv), {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new webpack.DefinePlugin({
        BUILD_INFO: {
          BUILD_DATE: JSON.stringify((new Date()).toISOString())
        },
        WEBPACK_HEADER_LOGO_PATH: JSON.stringify('src/core/static/Header_BCLogo_Test.png')
      })
    ]
  });
};