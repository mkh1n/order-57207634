const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/app.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].bundle.js',
    publicPath: '/',
    // Убрали assetModuleFilename, чтобы не создавать resource папку
  },
  
  module: {
    rules: [
      // Обработка JavaScript с Babel
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
      
      // Обработка CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      // Обработка изображений
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          // Теперь все идет в resources, а не resource
          filename: 'resources/images/[hash][ext]'
        }
      },
      
      // Обработка шрифтов
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'resources/fonts/[hash][ext]'
        }
      },
      
      // Обработка HTML
      {
        test: /\.html$/i,
        use: {
          loader: 'html-loader',
          options: {
            sources: {
              list: [
                {
                  tag: 'img',
                  attribute: 'src',
                  type: 'src',
                },
                {
                  tag: 'img',
                  attribute: 'srcset',
                  type: 'srcset',
                },
                {
                  tag: 'source',
                  attribute: 'srcset',
                  type: 'srcset',
                }
              ],
              urlFilter: (attribute, value, resourcePath) => {
                if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('//')) {
                  return true;
                }
                
                if (value.startsWith('./') || value.startsWith('../') || value.startsWith('/')) {
                  try {
                    const fs = require('fs');
                    let absolutePath;
                    
                    if (value.startsWith('/')) {
                      absolutePath = path.resolve(process.cwd(), value.substring(1));
                    } else {
                      absolutePath = path.resolve(path.dirname(resourcePath), value);
                    }
                    
                    if (fs.existsSync(absolutePath)) {
                      return true;
                    } else {
                      console.log(`⚠️  Изображение не найдено, игнорируем: ${value}`);
                      return false;
                    }
                  } catch (error) {
                    console.log(`⚠️  Ошибка при проверке файла ${value}:`, error.message);
                    return false;
                  }
                }
                
                return true;
              }
            },
            minimize: false
          }
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
    }),
    
    // Копируем статические файлы ТОЛЬКО если они существуют
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: 'assets',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/Thumbs.db']
          }
        },
        {
          from: 'src/resources',
          to: 'resources',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/Thumbs.db']
          }
        }
      ]
    })
  ],
  
  resolve: {
    extensions: ['.js', '.css', '.scss']
  },
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 3000,
    open: true,
    hot: true
  },
  
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  
  stats: {
    errorDetails: true,
    warningsFilter: [
      /asset size limit/,
      /entrypoint size limit/
    ]
  }
};