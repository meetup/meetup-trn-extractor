var webpack = require('webpack')

module.exports = {
  target: 'node',
  entry: './lib/extractor',
  output: {
    library: 'TrnExtractor',
    path: 'lib',
    filename: 'extractor.java.js'
  },
  module: {
    loaders: [{ test: /\.json$/, loader: 'json' }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      test: /\.js$/
    })
  ]
}
