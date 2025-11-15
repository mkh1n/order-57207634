const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/js/app.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].bundle.js',
    publicPath: './', // ⚠️ ИЗМЕНИТЕ С '/' НА './' для GitHub Pages
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'resources/images/[hash][ext]',
          publicPath: './' // ⚠️ ДОБАВЬТЕ ДЛЯ ИЗОБРАЖЕНИЙ
        }
      },
      
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'resources/fonts/[hash][ext]',
          publicPath: './' // ⚠️ ДОБАВЬТЕ ДЛЯ ШРИФТОВ
        }
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    })
  ]
};