// production config
const merge = require('webpack-merge');
const { resolve } = require('path');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './index.tsx',
  output: {
    filename: 'cardboardbutler.[hash].min.js',
    chunkFilename: '[name].[hash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/',
  },
  devtool: 'source-map',
  plugins: [],
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
          name: "vendor",
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /node_modules/
        }
      }
    }
  }
});
