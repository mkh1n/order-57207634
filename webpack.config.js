const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Кастомный плагин для шифрования DOM и классов
class DomObfuscatorPlugin {
  constructor(options = {}) {
    this.options = options;
    this.classMap = new Map();
    this.idMap = new Map();
    this.counter = 0;
  }
  
  apply(compiler) {
    // Обрабатываем HTML
    compiler.hooks.emit.tap('DomObfuscatorPlugin', (compilation) => {
      Object.keys(compilation.assets).forEach((filename) => {
        if (filename.endsWith('.html')) {
          let content = compilation.assets[filename].source();
          
          // Шифруем классы
          content = this.obfuscateClasses(content);
          
          // Шифруем ID
          content = this.obfuscateIds(content);
          
          // Шифруем data-атрибуты
          content = this.obfuscateDataAttributes(content);
          
          // Минифицируем HTML структуру
          content = this.minifyHtml(content);
          
          compilation.assets[filename] = {
            source: () => content,
            size: () => content.length
          };
        }
      });
    });

    // Обрабатываем CSS - синхронизируем имена классов
    compiler.hooks.emit.tap('DomObfuscatorPlugin', (compilation) => {
      Object.keys(compilation.assets).forEach((filename) => {
        if (filename.endsWith('.css')) {
          let content = compilation.assets[filename].source();
          
          // Заменяем классы в CSS
          content = this.obfuscateCssClasses(content);
          
          compilation.assets[filename] = {
            source: () => content,
            size: () => content.length
          };
        }
      });
    });
  }
  
  obfuscateClasses(html) {
    return html.replace(/class="([^"]*)"/g, (match, classes) => {
      const newClasses = classes.split(/\s+/)
        .filter(className => className.trim())
        .map(className => {
          if (!this.classMap.has(className)) {
            this.classMap.set(className, `c${this.generateHash(className + this.counter++)}`);
          }
          return this.classMap.get(className);
        })
        .join(' ');
      return `class="${newClasses}"`;
    });
  }
  
  obfuscateCssClasses(css) {
    let result = css;
    this.classMap.forEach((newClass, oldClass) => {
      // Заменяем .oldClass на .newClass в CSS
      const regex = new RegExp(`\\.${this.escapeRegExp(oldClass)}(?![a-zA-Z0-9_-])`, 'g');
      result = result.replace(regex, `.${newClass}`);
    });
    return result;
  }
  
  obfuscateIds(html) {
    return html.replace(/id="([^"]*)"/g, (match, id) => {
      if (!this.idMap.has(id)) {
        this.idMap.set(id, `i${this.generateHash(id + this.counter++)}`);
      }
      return `id="${this.idMap.get(id)}"`;
    });
  }
  
  obfuscateDataAttributes(html) {
    return html.replace(/data-([a-zA-Z0-9-]+)="([^"]*)"/g, (match, attrName, value) => {
      const obfuscatedName = `d${this.generateHash(attrName)}`;
      return `data-${obfuscatedName}="${value}"`;
    });
  }
  
  minifyHtml(html) {
    // Удаляем комментарии
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    // Удаляем лишние пробелы
    html = html.replace(/\s+/g, ' ');
    html = html.replace(/>\s+</g, '><');
    // Удаляем пробелы вокруг атрибутов
    html = html.replace(/\s+>/g, '>');
    html = html.replace(/>\s+/g, '>');
    
    return html.trim();
  }
  
  generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substr(0, 8);
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Плагин для обфускации JavaScript
class JSObfuscatorPlugin {
  constructor(options = {}) {
    this.options = options;
  }
  
  apply(compiler) {
    compiler.hooks.emit.tap('JSObfuscatorPlugin', (compilation) => {
      Object.keys(compilation.assets).forEach((filename) => {
        if (filename.endsWith('.js') && !filename.includes('runtime')) {
          try {
            const source = compilation.assets[filename].source();
            const obfuscatedCode = JavaScriptObfuscator.obfuscate(source, {
              compact: true,
              controlFlowFlattening: true,
              controlFlowFlatteningThreshold: 0.75,
              deadCodeInjection: false,
              debugProtection: false,
              disableConsoleOutput: true,
              identifierNamesGenerator: 'hexadecimal',
              log: false,
              numbersToExpressions: true,
              renameGlobals: false,
              selfDefending: true,
              simplify: true,
              splitStrings: true,
              splitStringsChunkLength: 10,
              stringArray: true,
              stringArrayEncoding: ['rc4'],
              stringArrayIndexShift: true,
              stringArrayWrappersCount: 2,
              stringArrayWrappersChainedCalls: true,
              stringArrayWrappersParametersMaxCount: 4,
              stringArrayWrappersType: 'function',
              stringArrayThreshold: 0.75,
              transformObjectKeys: true,
              unicodeEscapeSequence: false,
              ...this.options
            });

            compilation.assets[filename] = {
              source: () => obfuscatedCode.getObfuscatedCode(),
              size: () => obfuscatedCode.getObfuscatedCode().length
            };
          } catch (error) {
            console.warn(`Ошибка обфускации ${filename}:`, error.message);
          }
        }
      });
    });
  }
}

module.exports = {
  entry: './src/js/app.js',
  
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'js/[name].[contenthash].bundle.js',
    publicPath: './',
    chunkFilename: 'js/[name].[contenthash].chunk.js',
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              // Удаляем console.log в production
              ['transform-remove-console', { exclude: ['error', 'warn'] }]
            ]
          }
        }
      },
      
      // Обработка CSS - БЕЗ CSS Modules для глобальных стилей
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // Убираем modules чтобы классы оставались глобальными
              modules: false,
              sourceMap: false
            }
          }
        ]
      },

      // Обработка изображений с короткими путями
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'r/i/[hash][ext]' // Короткий путь resources/images -> r/i
        }
      },
      
      // Обработка шрифтов с короткими путями
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'r/f/[hash][ext]' // Короткий путь resources/fonts -> r/f
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
      minify: false // Отключаем встроенную минификацию, т.к. используем свой плагин
    }),
    
    // Плагин для шифрования DOM и классов (должен быть после HtmlWebpackPlugin)
    new DomObfuscatorPlugin(),
    
    // Плагин для обфускации JavaScript
    new JSObfuscatorPlugin(),
    
    // Копируем статические файлы
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: 'a', // assets -> a
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/Thumbs.db']
          }
        },
        {
          from: 'src/resources',
          to: 'r', // resources -> r
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/Thumbs.db']
          }
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
            drop_console: true, // Удаляем все console.log
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'], // Удаляем конкретные функции
          },
          mangle: {
            properties: {
              regex: /^_/, // Шифруем свойства начинающиеся с _
            },
          },
          output: {
            comments: false, // Удаляем комментарии
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }, // Удаляем комментарии из CSS
            },
          ],
        },
      }),
    ],
    
    // Разделяем код для усложнения анализа
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    
    // Шифруем имена чанков
    chunkIds: 'deterministic',
    moduleIds: 'deterministic',
  },
  
  resolve: {
    extensions: ['.js', '.css', '.scss'],
    alias: {
      // Создаем алиасы с короткими путями
      '@': path.resolve(__dirname, 'src'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    }
  },
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs')
    },
    port: 3000,
    open: true,
    hot: true,
    client: {
      logging: 'none', // Скрываем логи в dev режиме
    }
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
    ],
    // Минималистичный вывод
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }
};