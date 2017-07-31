var path = require('path')
var utils = require('./build/utils')
var vueLoaderConfig = require('./build/vue-loader.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  entry: {
    index: path.join(__dirname, './src/index.js'),
  },
  devtool: '#source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: utils.assetsPath('[id].js'),
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,

      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/element-ui')],
      },
    ]
  },
  plugins: [
      new webpack.DefinePlugin({
        'process.env': '"production"'
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true
      }),
      new ExtractTextPlugin({
        filename: utils.assetsPath('css/[name].css')
      }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'vendor',
      //   minChunks: function (module, count) {
      //     // any required modules inside node_modules are extracted to vendor
      //     return (
      //       module.resource &&
      //       /\.js$/.test(module.resource) &&
      //       module.resource.indexOf(
      //         path.join(__dirname, '../node_modules')
      //       ) === 0
      //     )
      //   }
      // }),
      // // extract webpack runtime and module manifest to its own file in order to
      // // prevent vendor hash from being updated whenever app bundle is updated
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'manifest',
      //   chunks: ['vendor']
      // }),
    ],
    externals: {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue'
      }
    }
}
