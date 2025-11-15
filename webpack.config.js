const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// Шифратор классов и путей
class ObfuscatorPlugin {
  constructor() {
    this.classMap = new Map();
    this.counter = 0;
  }
  
  apply(compiler) {
    compiler.hooks.emit.tap('ObfuscatorPlugin', (compilation) => {
      // Обрабатываем HTML
      Object.keys(compilation.assets).forEach(filename => {
        if (filename.endsWith('.html')) {
          let content = compilation.assets[filename].source();
          content = this.obfuscateHtml(content);
          compilation.assets[filename] = { source: () => content, size: () => content.length };
        }
        
        // Обрабатываем CSS
        if (filename.endsWith('.css')) {
          let content = compilation.assets[filename].source();
          content = this.obfuscateCss(content);
          compilation.assets[filename] = { source: () => content, size: () => content.length };
        }
      });
    });
  }

  obfuscateHtml(html) {
    // Шифруем классы
    html = html.replace(/class="([^"]*)"/g, (match, classes) => {
      const newClasses = classes.split(/\s+/)
        .map(cls => {
          if (!this.classMap.has(cls)) {
            this.classMap.set(cls, `c${this.counter++}`);
          }
          return this.classMap.get(cls);
        })
        .join(' ');
      return `class="${newClasses}"`;
    });

    // Шифруем ID
    html = html.replace(/id="([^"]*)"/g, (match, id) => {
      return `id="i${this.counter++}"`;
    });

    // Минифицируем
    return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  }

  obfuscateCss(css) {
    // Заменяем классы в CSS
    this.classMap.forEach((newClass, oldClass) => {
      css = css.replace(new RegExp(`\\.${oldClass}(?![a-zA-Z0-9_-])`, 'g'), `.${newClass}`);
    });
    
    // Исправляем пути
    css = css.replace(/url\(['"]?\.\.\/([^'")]*)['"]?\)/g, 'url(./$1)');
    
    return css;
  }
}

module.exports = {
  entry: './src/js/app.js',
  
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'js/[hash].js',
    publicPath: './',
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['transform-remove-console', { exclude: ['error'] }]]
          }
        }
      },
      
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },

      {
        test: /\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: { filename: '[hash][ext]' }
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'css/[hash].css' }),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new ObfuscatorPlugin()
  ],
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
          mangle: true
        }
      }),
      new CssMinimizerPlugin()
    ]
  },
  
  devServer: {
    static: './docs',
    port: 3000
  }
};