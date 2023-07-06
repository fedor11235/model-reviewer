const path = require('path');
module.exports = {
  mode: 'none',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/')
    }
  },
  resolve: {
    alias: {
      three: path.resolve('./node_modules/three'),
      tween: path.resolve('@tweenjs/tween.js')
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};