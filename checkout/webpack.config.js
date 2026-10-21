const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  entry: './src/index.js',
  output: { publicPath: 'auto' },
  devServer: {
    port: 3002,
    // O host roda em outra origem (3000) e precisa baixar o remoteEntry.js
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  module: {
    rules: [{ test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' }],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'checkout',
      filename: 'remoteEntry.js',
      exposes: {
        './Carrinho': './src/Carrinho',
      },
      // O core (host) também é remote deste MFE: fornece o soft-redirect
      remotes: {
        host: 'host@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
      dts: false,
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
