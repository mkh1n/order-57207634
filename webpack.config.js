const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/app.js',
  
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'js/bundle.[contenthash].js',
    publicPath: './', // 🔥 ВАЖНО: относительные пути для GitHub Pages
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
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },

      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext]' // 📁 Простая папка images
        }
      },
      
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext]' // 📁 Простая папка fonts
        }
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    
    new MiniCssExtractPlugin({
      filename: 'css/styles.[contenthash].css' // 📁 Папка css
    }),
    
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    
    // 🔥 Копируем статические файлы как есть
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/resources',
          to: 'resources',
          noErrorOnMissing: true
        },
        {
          from: 'src/assets', 
          to: 'assets',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 🗑️ Удаляем console.log
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  },
  
  // 🎯 Режим development для отладки, production для финальной сборки
  mode: 'production',
  
  devServer: {
    static: './docs',
    port: 3000,
    open: true
  }
};