const fs = require('fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = {
  entry: require.resolve('./main.js'),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {

          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true
        },
      },
      {
        test: /\.scss$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          {
            loader: require.resolve('postcss-loader'),
            options: {
              // Necessary for external CSS imports to work
              // https://github.com/facebookincubator/create-react-app/issues/2677
              ident: 'postcss',
              plugins: () => [
                autoprefixer({
                  browsers: [ 'last 6 versions' ]
                }),
              ],
            },
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  }
}
