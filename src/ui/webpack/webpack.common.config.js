require('dotenv').config();

const path = require('path');
const webpack = require('webpack');

const DotenvPlugin = require('webpack-dotenv-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//const JsDocPlugin = require('jsdoc-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const BabelEnvDepsPlugin = require('webpack-babel-env-deps');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const defaultPort = 3000;

const UI_CONFIGURATION_FOLDER = 'siteconfig';
const UI_CONFIGURATION_FILENAME = 'ui-configuration';
const UI_COMMON_OUTPUT_FOLDER = 'Common';

module.exports = (env, argv) => {

  // Drops console commands except console.trace
  const DMS_DROP_CONSOLE = !!(typeof argv === 'object' && argv.DMS_DROP_CONSOLE);
  const ip = env.APP_IP || '0.0.0.0';
  const port = (+env.APP_PORT) || defaultPort;

  const INTAKE_SITE_NAME = 'intake';
  const PRODUCTION_ENV_NAME = "production";

  const SITE_TO_BUILD = env.SITE || INTAKE_SITE_NAME;
  const output_dir = path.join(__dirname, '../public', env.RELATIVE_OUTPUT_DIR_OVERRIDE ? env.RELATIVE_OUTPUT_DIR_OVERRIDE : SITE_TO_BUILD);
  const isDebug = env.mode !== PRODUCTION_ENV_NAME;
  const IS_WEBPACK_DEV_SERVER = !!process.argv.find(v => v.includes('webpack-dev-server'));
  const GENERAL_CSS_LOADERS_USE = [
    { loader: isDebug ? 'style-loader' : MiniCssExtractPlugin.loader },
    { loader: 'css-loader' },
    { loader: 'postcss-loader' },
  ];

  const config = {
    context: path.join(__dirname),
    entry: {
      app: [path.join(__dirname, '../src', SITE_TO_BUILD, 'application')]
    },
    output: {
      path: output_dir,
      filename: '[name].[fullhash].js',
    },
    resolve: {
      modules: [path.resolve(__dirname, '../src'), 'node_modules'],
      alias: {
        'jquery': path.resolve(path.join(__dirname, '../node_modules', 'jquery')),
        'jquery-ui/widget': 'blueimp-file-upload/js/vendor/jquery.ui.widget.js',
        'trumbowyg/colors': 'trumbowyg/plugins/colors/trumbowyg.colors.js',
        'trumbowyg/table': 'trumbowyg/plugins/table/trumbowyg.table.js',
        'jquery-timepickerjs': 'jquery-timepicker/jquery.timepicker.js',
        'colresizablejs': 'colresizable/colResizable-1.6.min.js',
        'cleave-addons/phone-formatter': 'cleave.js/dist/addons/cleave-phone.i18n'
      }
    },
  
    optimization: {
      minimizer: [
        new TerserPlugin(DMS_DROP_CONSOLE ? {
          terserOptions: {
            compress: { pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'] }
          },
        } : {}),
        new OptimizeCssAssetsPlugin()
      ],
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
            enforce: true
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      },
      moduleIds: 'named',
    },
  
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: path.resolve(output_dir, 'index.html'),
        template: path.resolve(__dirname, '../src', SITE_TO_BUILD, 'index_dev.html'),
        inject: false,//'body;',
        //alwaysWriteToDisk: true,
      }),
      new webpack.DefinePlugin({ IS_WEBPACK_DEV_SERVER }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        _: 'underscore',
        Moment: 'moment'
      }),
      new HtmlWebpackHarddiskPlugin(),
      new MiniCssExtractPlugin({
        filename: isDebug ? '[name].css' : '[name].[fullhash].css',
        chunkFilename: isDebug ? '[id].css' : '[id].[fullhash].css',
      }),
      /*
      new JsDocPlugin({
        conf: './jsdoc.conf'
      }),
      */
  
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      }),

      new CopyWebpackPlugin({
        patterns: [
          { from: path.join('..', 'src', 'common'), to: path.join(output_dir, '..', UI_COMMON_OUTPUT_FOLDER) },
        ]
      }),
    ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          use: {
            loader: 'babel-loader',
            options: {
              // Add ability to parse JSX in js files
              presets: ['@babel/react']
            },
          },

          //exclude: [BabelEnvDepsPlugin.exclude({ except: ['scrollbooster'] })],
          //include: [BabelEnvDepsPlugin.include()]
        },
        {
          test: /\.css$/,
          use: GENERAL_CSS_LOADERS_USE
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            //'style-loader',
            { loader: isDebug ? 'style-loader' : MiniCssExtractPlugin.loader },

            // Translates CSS into CommonJS
            'css-loader',
            
            // Fixes relative url() calls in css files which mess up SASS imports
            'resolve-url-loader',

            // Compiles Sass to CSS
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              }
            }
          ],
        },
        /* Give all loaders a limit=1 so that no images are replaced inline with "data:..." */
        { test: /\.ico(n)?$/, use: [
          { 
            loader: 'url-loader',
            options: {
              prefix: 'images',
              limit: 1,
              mimeType: 'image/png'
            }
          }]
        },
        { test: /\.png$/, use: [
          { 
            loader: 'url-loader',
            options: {
              prefix: 'images',
              limit: 1,
              mimeType: 'image/png'
            }
          }]
        },
        { test: /\.jp(e)?g$/, use: [
          { 
            loader: 'url-loader',
            options: {
              prefix: 'images',
              limit: 1,
              mimeType: 'image/jpeg'
            }
          }]
        },
        { test: /\.gif$/, use: [
          { 
            loader: 'url-loader',
            options: {
              prefix: 'images',
              limit: 1,
              mimeType: 'image/gif'
            }
          }]
        },
        { test: /\.svg$/, use: [
          { 
            loader: 'url-loader',
            options: {
              prefix: 'images',
              limit: 1,
              mimeType: 'image/jpeg'
            }
          }]
        },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: [
          { 
            loader: 'url-loader',
            options: {
              prefix: 'fonts',
              limit: 8000,
              mimeType: 'application/font-woff'
            }
          }]
        },
        { test: /\.(eot|ttf)$/, use: [
          { 
            loader: 'file-loader?prefix=fonts/',
            options: {
              prefix: 'images',
              limit: 1,
              mimeType: 'image/png'
            }
          }]
        },
        { test: /\.tpl$/, exclude: /node_modules/, use: [
          { loader: 'underscore-loader', options: { engine: `var _ = { escape: require('underscore') };\n` } },
        ]},

        // This file is targetted so webpack can create the ui configuration folder for deploys, where it doesn't initially exist
        {
          type: 'javascript/auto',
          test: new RegExp(`${UI_CONFIGURATION_FILENAME}-deploy\.json`),
          use: [{
            loader: 'file-loader',
            options: {
              name: () => `${UI_CONFIGURATION_FILENAME}.[ext]`,
              publicPath: path.join(output_dir, '..'),
              outputPath: `./${UI_CONFIGURATION_FOLDER}`
            }
          }],
        },
        
        // Used for any local webpack dev-server runs
        {
          type: 'javascript/auto',
          test: new RegExp(`${UI_CONFIGURATION_FILENAME}-local\.json`),
          use: [ 'file-loader' ]
        },

        // Move config files over
        {
          type: 'javascript/auto',
          test: /\.json$/,
          use: [{
            loader: 'file-loader',
            options: {
              outputPath: 'config'
            }
          }],
          include: /[\\/]config[\\/]/
        },
      ]
    }
  };
  
  if (IS_WEBPACK_DEV_SERVER) {
    config.devServer = {
      // publicPath: config.output.publicPath, --> deprecated, unsure if this is needed/what the replacement looks like
      host: ip,
      port,
      hot: true,
      // inline: true, --> deprecated, unsure if this is needed/what the replacement looks like
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'src'),
        watch: true,
      },
      compress: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    config.stats = {
      errorDetails: true
    }
    
    // config.plugins = config.plugins.concat([ --> deprecated, hot: true now automatically passes in HMR
    //   new webpack.HotModuleReplacementPlugin(),
    // ]);
  }

  return config;
};