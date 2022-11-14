const pth = require('path');
const process = require('process');

const PORT = process.env.port || undefined;

module.exports = {
  target: 'web',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: pth.join(__dirname, 'public/dist'),
  },
  devServer: {
    static: {
      directory: pth.join(__dirname, 'public'),
    },
    devMiddleware: {
      publicPath: '/dist/',
    },
    compress: true,
    port: PORT,
    hot: true,
    proxy: {
      '/media/**': {
        target: 'http://localhost:8081',
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.woff2?$/,
        type: 'asset/resource',
      },
      {
        test: /\.(fs|vs)$/,
        loader: 'simple-webgl-loader',
      },
      {
        test: /\.(txt|html|md)$/,
        type: 'asset/source',
      },
    ],
  },
}
