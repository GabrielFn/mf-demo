const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  entry: './src/index.js',
  // "auto": os chunks expostos são resolvidos a partir da URL do remoteEntry.js,
  // então funcionam mesmo quando carregados por outra origem (3001, 3002)
  output: { publicPath: 'auto' },
  devServer: {
    port: 3000,
    // Recarregar em /carrinho devolve o index.html (roteamento no cliente)
    historyApiFallback: true,
    // Os MFEs (outras origens) baixam o remoteEntry.js do core
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  module: {
    rules: [{ test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' }],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      // O core também é um REMOTE: expõe utilitários para os MFEs
      filename: 'remoteEntry.js',
      exposes: {
        './soft-redirect': './src/soft-redirect',
      },
      // Sem "remotes" aqui: as URLs vêm do mfe-manifest.json em runtime
      // (ver src/mfe.js). Trocar a URL de um MFE não exige rebuild do host.
      remotes: {},
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
      dts: false,
    }),
    // publicPath "/" só no HTML: main.js carrega certo também em /carrinho
    new HtmlWebpackPlugin({ template: './public/index.html', publicPath: '/' }),
    // Publica o manifest junto com o build de produção
    new CopyPlugin({ patterns: [{ from: 'public/mfe-manifest.json' }] }),
  ],
};
