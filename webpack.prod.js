const config = require('./webpack.config.js');

module.exports = {
  ...config,
  output: {
    ...config.output,
    publicPath: './' // Только для production
  },
  mode: 'production'
};