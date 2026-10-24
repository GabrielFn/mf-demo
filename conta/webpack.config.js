const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  entry: './src/index.js',
  output: { publicPath: 'auto' },
  devServer: {
    port: 3003,
    // Standalone com rotas próprias: recarregar em /conta/seguranca devolve o index.html
    historyApiFallback: true,
    // O host roda em outra origem (3000) e precisa baixar o remoteEntry.js
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  module: {
    rules: [{ test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' }],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'conta',
      filename: 'remoteEntry.js',
      // Expõe uma FUNÇÃO de montagem, não um componente: o MFE cria a própria
      // raiz React e cuida das próprias rotas (padrão "mount/unmount")
      exposes: {
        './montar': './src/montar',
      },
      // Sem remotes: a navegação chega por parâmetro do montar(), então este
      // MFE não depende do host estar no ar nem para rodar standalone
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
      dts: false,
    }),
    // publicPath "/" só no HTML: main.js carrega certo também em /conta/dados
    new HtmlWebpackPlugin({ template: './public/index.html', publicPath: '/' }),
  ],
};
