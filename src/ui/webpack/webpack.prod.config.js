const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config');

const PROD_HEADER_PATH = 'src/core/static/Header_BCLogo.png';
const PRE_PROD_HEADER_PATH = 'src/core/static/Header_BCLogo_Preprod_OLD.jpg';

module.exports = (env, argv) => {
  env = env || {};
  env.mode = 'production';
  if (typeof argv === 'object') {
    argv.DMS_DROP_CONSOLE = true;
  }

  const isPreProd = !!env.preprod;
  return merge(common(env, argv), {
    mode: 'production',
    devtool: false,
    plugins: [
      new webpack.DefinePlugin({
        BUILD_INFO: {
          BUILD_DATE: JSON.stringify((new Date()).toISOString())
        },
        WEBPACK_HEADER_LOGO_PATH: JSON.stringify( isPreProd ? PRE_PROD_HEADER_PATH : PROD_HEADER_PATH )
      })
    ]
  });
};