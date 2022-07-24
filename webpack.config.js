const pth = require('path');
const process = require('process');
const {VueLoaderPlugin} = require('vue-loader');

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
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
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
        loader: 'webgl-loader',
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
}
