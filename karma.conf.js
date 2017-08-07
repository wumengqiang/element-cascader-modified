const path = require('path');
const webpackConfig = require('./webpack.config.js');


delete webpackConfig.entry;
delete webpackConfig.externals;
webpackConfig.plugins.splice(1,1);
module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      { pattern: 'test/unit/*.js', watched: false }
    ],
    reporters: ['progress'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome_with_debugging'],
    customLaunchers: {
      Chrome_with_debugging: {
        base: 'ChromeHeadless',
        chromeDataDir: path.resolve(__dirname, '.chrome')
      }
    },
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: false
    },
    autoWatch: false,
    // singleRun: false, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity
  })
}